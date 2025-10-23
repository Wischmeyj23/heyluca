-- Add UPDATE policy to contacts_meetings junction table
CREATE POLICY "Users can update their own contact meetings"
  ON public.contacts_meetings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.contacts
      WHERE contacts.id = contacts_meetings.contact_id 
        AND contacts.user_id = auth.uid()
    )
  );