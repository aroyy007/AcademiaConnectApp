/*
  # Real-time Messaging System

  1. New Tables
    - `conversations` - Chat rooms/conversations
    - `conversation_participants` - Users in each conversation
    - `messages` - Individual messages
    - `message_read_status` - Track read status per user
    - `typing_indicators` - Real-time typing status

  2. Security
    - Enable RLS on all tables
    - Add policies for conversation participants
    - Implement message visibility controls

  3. Functions
    - Auto-create conversation participants
    - Update conversation timestamps
    - Handle typing indicators
*/

-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text,
  is_group boolean DEFAULT false,
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create conversation participants table
CREATE TABLE IF NOT EXISTS conversation_participants (
  conversation_id uuid REFERENCES conversations(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at timestamptz DEFAULT now(),
  last_read_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true,
  PRIMARY KEY (conversation_id, user_id)
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  attachment_url text,
  attachment_type text CHECK (attachment_type IN ('image', 'file', 'video')),
  reply_to_id uuid REFERENCES messages(id) ON DELETE SET NULL,
  is_edited boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create message read status table
CREATE TABLE IF NOT EXISTS message_read_status (
  message_id uuid REFERENCES messages(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  read_at timestamptz DEFAULT now(),
  PRIMARY KEY (message_id, user_id)
);

-- Create typing indicators table
CREATE TABLE IF NOT EXISTS typing_indicators (
  conversation_id uuid REFERENCES conversations(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  is_typing boolean DEFAULT false,
  updated_at timestamptz DEFAULT now(),
  PRIMARY KEY (conversation_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_read_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE typing_indicators ENABLE ROW LEVEL SECURITY;

-- Conversations policies
CREATE POLICY "Users can view conversations they participate in"
  ON conversations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversation_participants 
      WHERE conversation_id = conversations.id 
      AND user_id = auth.uid()
      AND is_active = true
    )
  );

CREATE POLICY "Users can create conversations"
  ON conversations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update conversations they participate in"
  ON conversations
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversation_participants 
      WHERE conversation_id = conversations.id 
      AND user_id = auth.uid()
      AND is_active = true
    )
  );

-- Conversation participants policies
CREATE POLICY "Users can view participants in their conversations"
  ON conversation_participants
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversation_participants cp 
      WHERE cp.conversation_id = conversation_participants.conversation_id 
      AND cp.user_id = auth.uid()
      AND cp.is_active = true
    )
  );

CREATE POLICY "Users can add participants to conversations they're in"
  ON conversation_participants
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversation_participants 
      WHERE conversation_id = conversation_participants.conversation_id 
      AND user_id = auth.uid()
      AND is_active = true
    )
  );

CREATE POLICY "Users can update their own participation"
  ON conversation_participants
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Messages policies
CREATE POLICY "Users can view messages in their conversations"
  ON messages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversation_participants 
      WHERE conversation_id = messages.conversation_id 
      AND user_id = auth.uid()
      AND is_active = true
    )
  );

CREATE POLICY "Users can send messages to conversations they're in"
  ON messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM conversation_participants 
      WHERE conversation_id = messages.conversation_id 
      AND user_id = auth.uid()
      AND is_active = true
    )
  );

CREATE POLICY "Users can update their own messages"
  ON messages
  FOR UPDATE
  TO authenticated
  USING (sender_id = auth.uid());

CREATE POLICY "Users can delete their own messages"
  ON messages
  FOR DELETE
  TO authenticated
  USING (sender_id = auth.uid());

-- Message read status policies
CREATE POLICY "Users can view read status in their conversations"
  ON message_read_status
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM messages m
      JOIN conversation_participants cp ON m.conversation_id = cp.conversation_id
      WHERE m.id = message_read_status.message_id 
      AND cp.user_id = auth.uid()
      AND cp.is_active = true
    )
  );

CREATE POLICY "Users can mark messages as read"
  ON message_read_status
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own read status"
  ON message_read_status
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Typing indicators policies
CREATE POLICY "Users can view typing indicators in their conversations"
  ON typing_indicators
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversation_participants 
      WHERE conversation_id = typing_indicators.conversation_id 
      AND user_id = auth.uid()
      AND is_active = true
    )
  );

CREATE POLICY "Users can manage their own typing indicators"
  ON typing_indicators
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON conversations(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_user ON conversation_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_conversation ON conversation_participants(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_message_read_status_message ON message_read_status(message_id);
CREATE INDEX IF NOT EXISTS idx_typing_indicators_conversation ON typing_indicators(conversation_id);

-- Function to update conversation timestamp when new message is sent
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations 
  SET updated_at = now() 
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to update conversation timestamp
CREATE TRIGGER trigger_update_conversation_timestamp
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_timestamp();

-- Function to auto-create conversation participants for direct messages
CREATE OR REPLACE FUNCTION create_direct_conversation(
  user1_id uuid,
  user2_id uuid
)
RETURNS uuid AS $$
DECLARE
  conversation_id uuid;
BEGIN
  -- Check if conversation already exists
  SELECT c.id INTO conversation_id
  FROM conversations c
  JOIN conversation_participants cp1 ON c.id = cp1.conversation_id
  JOIN conversation_participants cp2 ON c.id = cp2.conversation_id
  WHERE c.is_group = false
    AND cp1.user_id = user1_id
    AND cp2.user_id = user2_id
    AND cp1.is_active = true
    AND cp2.is_active = true;

  -- If conversation doesn't exist, create it
  IF conversation_id IS NULL THEN
    INSERT INTO conversations (is_group, created_by)
    VALUES (false, user1_id)
    RETURNING id INTO conversation_id;

    -- Add both participants
    INSERT INTO conversation_participants (conversation_id, user_id)
    VALUES 
      (conversation_id, user1_id),
      (conversation_id, user2_id);
  END IF;

  RETURN conversation_id;
END;
$$ language 'plpgsql';

-- Function to clean up old typing indicators
CREATE OR REPLACE FUNCTION cleanup_typing_indicators()
RETURNS void AS $$
BEGIN
  UPDATE typing_indicators 
  SET is_typing = false 
  WHERE is_typing = true 
    AND updated_at < now() - interval '10 seconds';
END;
$$ language 'plpgsql';