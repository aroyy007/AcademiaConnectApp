-- Fix for Friend System Database Issues
-- This script adds proper constraints and indexes to prevent duplicate friendships

-- 1. First, let's remove any existing duplicate friendships
WITH duplicates AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (
      PARTITION BY 
        LEAST(user_id::text, friend_id::text), 
        GREATEST(user_id::text, friend_id::text)
      ORDER BY created_at
    ) as rn
  FROM friendships
)
DELETE FROM friendships 
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 2
);

-- 2. Add a unique constraint to prevent duplicate friendships
-- This constraint ensures that each friendship pair is unique regardless of order
ALTER TABLE friendships 
ADD CONSTRAINT friendships_user_id_friend_id_key 
UNIQUE (user_id, friend_id);

-- 3. Add an index for better performance on friendship queries
CREATE INDEX IF NOT EXISTS idx_friendships_user_id ON friendships(user_id);
CREATE INDEX IF NOT EXISTS idx_friendships_friend_id ON friendships(friend_id);

-- 4. Add a check constraint to prevent self-friendship
ALTER TABLE friendships 
ADD CONSTRAINT friendships_no_self_friendship 
CHECK (user_id != friend_id);

-- 5. Add indexes for friend_requests for better performance
CREATE INDEX IF NOT EXISTS idx_friend_requests_receiver_id ON friend_requests(receiver_id);
CREATE INDEX IF NOT EXISTS idx_friend_requests_sender_id ON friend_requests(sender_id);
CREATE INDEX IF NOT EXISTS idx_friend_requests_status ON friend_requests(status);

-- 6. Add a check constraint to prevent self friend requests
ALTER TABLE friend_requests 
ADD CONSTRAINT friend_requests_no_self_request 
CHECK (sender_id != receiver_id);

-- 7. Add a function to safely create friendships
CREATE OR REPLACE FUNCTION create_friendship(sender_uuid UUID, receiver_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Insert friendships only if they don't already exist
  INSERT INTO friendships (user_id, friend_id)
  SELECT sender_uuid, receiver_uuid
  WHERE NOT EXISTS (
    SELECT 1 FROM friendships 
    WHERE user_id = sender_uuid AND friend_id = receiver_uuid
  );
  
  INSERT INTO friendships (user_id, friend_id)
  SELECT receiver_uuid, sender_uuid
  WHERE NOT EXISTS (
    SELECT 1 FROM friendships 
    WHERE user_id = receiver_uuid AND friend_id = sender_uuid
  );
  
  RETURN TRUE;
EXCEPTION
  WHEN unique_violation THEN
    -- Friendship already exists, that's okay
    RETURN TRUE;
  WHEN OTHERS THEN
    -- Some other error occurred
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- 8. Add a function to safely accept friend requests
CREATE OR REPLACE FUNCTION accept_friend_request(request_uuid UUID)
RETURNS JSON AS $$
DECLARE
  request_record RECORD;
  result JSON;
BEGIN
  -- Get the request details
  SELECT sender_id, receiver_id, status INTO request_record
  FROM friend_requests
  WHERE id = request_uuid;
  
  -- Check if request exists
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Request not found');
  END IF;
  
  -- Check if already accepted
  IF request_record.status = 'accepted' THEN
    RETURN json_build_object('success', false, 'error', 'Request already accepted');
  END IF;
  
  -- Update request status
  UPDATE friend_requests 
  SET status = 'accepted', updated_at = NOW()
  WHERE id = request_uuid;
  
  -- Create friendships safely
  IF create_friendship(request_record.sender_id, request_record.receiver_id) THEN
    RETURN json_build_object('success', true, 'message', 'Friend request accepted successfully');
  ELSE
    RETURN json_build_object('success', false, 'error', 'Failed to create friendship');
  END IF;
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql;

-- 9. Add triggers to automatically update friend counts (optional)
-- This could be used to maintain a friend_count column in profiles table if needed

-- 10. Add some helpful views for debugging
CREATE OR REPLACE VIEW friendship_summary AS
SELECT 
  p.id,
  p.full_name,
  COUNT(f.friend_id) as friend_count,
  ARRAY_AGG(fp.full_name ORDER BY fp.full_name) as friends
FROM profiles p
LEFT JOIN friendships f ON p.id = f.user_id
LEFT JOIN profiles fp ON f.friend_id = fp.id
GROUP BY p.id, p.full_name
ORDER BY p.full_name;

-- Usage examples:
-- To view friendship summary: SELECT * FROM friendship_summary;
-- To accept a friend request safely: SELECT accept_friend_request('request-uuid-here');
-- To create friendship safely: SELECT create_friendship('user1-uuid', 'user2-uuid');
