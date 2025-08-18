/*
  # Additional Messaging Functions and Triggers

  1. Functions
    - Create notification functions for new messages
    - Auto-cleanup typing indicators
    - Message read status tracking

  2. Triggers
    - Trigger notifications on new messages
    - Auto-update conversation timestamps
*/

-- Function to create message notification
CREATE OR REPLACE FUNCTION create_message_notification()
RETURNS TRIGGER AS $$
DECLARE
  participant RECORD;
  sender_name text;
BEGIN
  -- Get sender name
  SELECT full_name INTO sender_name
  FROM profiles
  WHERE id = NEW.sender_id;

  -- Create notification for all other participants
  FOR participant IN 
    SELECT user_id 
    FROM conversation_participants 
    WHERE conversation_id = NEW.conversation_id 
    AND user_id != NEW.sender_id 
    AND is_active = true
  LOOP
    INSERT INTO notifications (
      user_id,
      type,
      title,
      message,
      data
    ) VALUES (
      participant.user_id,
      'message',
      'New message from ' || sender_name,
      LEFT(NEW.content, 100) || CASE WHEN LENGTH(NEW.content) > 100 THEN '...' ELSE '' END,
      jsonb_build_object(
        'conversation_id', NEW.conversation_id,
        'message_id', NEW.id,
        'sender_id', NEW.sender_id,
        'sender_name', sender_name
      )
    );
  END LOOP;

  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for message notifications
CREATE TRIGGER trigger_message_notification
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION create_message_notification();

-- Function to auto-mark messages as read when user reads conversation
CREATE OR REPLACE FUNCTION auto_mark_messages_read()
RETURNS TRIGGER AS $$
BEGIN
  -- Mark all messages in the conversation as read for this user
  INSERT INTO message_read_status (message_id, user_id, read_at)
  SELECT m.id, NEW.user_id, NEW.last_read_at
  FROM messages m
  WHERE m.conversation_id = NEW.conversation_id
    AND m.created_at <= NEW.last_read_at
    AND NOT EXISTS (
      SELECT 1 FROM message_read_status mrs
      WHERE mrs.message_id = m.id AND mrs.user_id = NEW.user_id
    );

  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for auto-marking messages as read
CREATE TRIGGER trigger_auto_mark_messages_read
  AFTER UPDATE OF last_read_at ON conversation_participants
  FOR EACH ROW
  WHEN (OLD.last_read_at IS DISTINCT FROM NEW.last_read_at)
  EXECUTE FUNCTION auto_mark_messages_read();

-- Function to get unread message count for a user
CREATE OR REPLACE FUNCTION get_unread_message_count(user_uuid uuid)
RETURNS integer AS $$
DECLARE
  unread_count integer;
BEGIN
  SELECT COUNT(DISTINCT m.id) INTO unread_count
  FROM messages m
  JOIN conversation_participants cp ON m.conversation_id = cp.conversation_id
  WHERE cp.user_id = user_uuid
    AND cp.is_active = true
    AND m.sender_id != user_uuid
    AND m.created_at > cp.last_read_at;

  RETURN COALESCE(unread_count, 0);
END;
$$ language 'plpgsql';

-- Function to cleanup old typing indicators (called periodically)
CREATE OR REPLACE FUNCTION cleanup_old_typing_indicators()
RETURNS void AS $$
BEGIN
  UPDATE typing_indicators 
  SET is_typing = false 
  WHERE is_typing = true 
    AND updated_at < now() - interval '30 seconds';
END;
$$ language 'plpgsql';
