-- Create the business_cards storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('business_cards', 'business_cards', true);

-- Add RLS policy for users to upload their own business cards
CREATE POLICY "Users can upload their own cards"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'business_cards' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Add RLS policy for users to view their own business cards
CREATE POLICY "Users can view their own cards"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'business_cards' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Add RLS policy for users to delete their own business cards
CREATE POLICY "Users can delete their own cards"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'business_cards' AND
  auth.uid()::text = (storage.foldername(name))[1]
);