/*
  # Setup Storage for Messages

  1. Storage Buckets
    - Create `messages` bucket for message attachments
    
  2. Storage Policies
    - Allow authenticated users to view message attachments
    - Allow users to upload their own message attachments
    - Allow users to update/delete their own message attachments
*/

-- Create storage bucket for message attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('messages', 'messages', true)
ON CONFLICT (id) DO NOTHING;

-- Policies for messages bucket
CREATE POLICY "Allow authenticated users to view message attachments"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'messages');

CREATE POLICY "Allow users to upload their own message attachments"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'messages' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Allow users to update their own message attachments"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'messages' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Allow users to delete their own message attachments"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'messages' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
