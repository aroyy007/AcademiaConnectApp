/*
  # Update Posts RLS Policy for Friend-Based Visibility

  1. Changes
    - Replace the existing posts SELECT policy to restrict visibility
    - Posts can only be viewed if:
      - User is the author of the post, OR
      - Author is a friend of the current user (via friendships table), OR
      - Post is marked as an announcement (is_announcement = true)
    
  2. Security
    - Maintains existing INSERT, UPDATE, DELETE policies
    - Only modifies the SELECT policy for enhanced privacy
*/

-- Drop the existing SELECT policy for posts
DROP POLICY IF EXISTS "Users can view all posts" ON posts;

-- Create new restrictive SELECT policy for posts
CREATE POLICY "Users can view own posts, friends' posts, and announcements"
  ON posts
  FOR SELECT
  TO authenticated
  USING (
    -- User can see their own posts
    auth.uid() = author_id
    OR
    -- User can see posts from friends
    EXISTS (
      SELECT 1 FROM friendships 
      WHERE friendships.user_id = auth.uid() 
      AND friendships.friend_id = posts.author_id
    )
    OR
    -- User can see announcements (public posts)
    is_announcement = true
  );