-- Create COMPANIES table
CREATE TABLE IF NOT EXISTS public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  domain TEXT,
  website_url TEXT,
  phone TEXT,
  city TEXT,
  state TEXT,
  country TEXT,
  industry TEXT,
  linkedin_url TEXT,
  notes TEXT,
  owner_user_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on companies
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- RLS policies for companies
CREATE POLICY "Users can view their own companies"
  ON public.companies FOR SELECT
  USING (auth.uid() = owner_user_id);

CREATE POLICY "Users can create their own companies"
  ON public.companies FOR INSERT
  WITH CHECK (auth.uid() = owner_user_id);

CREATE POLICY "Users can update their own companies"
  ON public.companies FOR UPDATE
  USING (auth.uid() = owner_user_id);

CREATE POLICY "Users can delete their own companies"
  ON public.companies FOR DELETE
  USING (auth.uid() = owner_user_id);

-- Create COMPANY_DOMAINS table for mapping multiple domains to one company
CREATE TABLE IF NOT EXISTS public.company_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  domain TEXT NOT NULL UNIQUE,
  owner_user_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on company_domains
ALTER TABLE public.company_domains ENABLE ROW LEVEL SECURITY;

-- RLS policies for company_domains
CREATE POLICY "Users can view their own company domains"
  ON public.company_domains FOR SELECT
  USING (auth.uid() = owner_user_id);

CREATE POLICY "Users can create their own company domains"
  ON public.company_domains FOR INSERT
  WITH CHECK (auth.uid() = owner_user_id);

CREATE POLICY "Users can update their own company domains"
  ON public.company_domains FOR UPDATE
  USING (auth.uid() = owner_user_id);

CREATE POLICY "Users can delete their own company domains"
  ON public.company_domains FOR DELETE
  USING (auth.uid() = owner_user_id);

-- Update existing CONTACTS table to add company_id
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL;
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS title TEXT;

-- Create LEADS table
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID REFERENCES public.contacts(id) ON DELETE CASCADE,
  source TEXT,
  status TEXT DEFAULT 'new',
  notes TEXT,
  owner_user_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on leads
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- RLS policies for leads
CREATE POLICY "Users can view their own leads"
  ON public.leads FOR SELECT
  USING (auth.uid() = owner_user_id);

CREATE POLICY "Users can create their own leads"
  ON public.leads FOR INSERT
  WITH CHECK (auth.uid() = owner_user_id);

CREATE POLICY "Users can update their own leads"
  ON public.leads FOR UPDATE
  USING (auth.uid() = owner_user_id);

CREATE POLICY "Users can delete their own leads"
  ON public.leads FOR DELETE
  USING (auth.uid() = owner_user_id);

-- Create MEETINGS table (maps to existing notes concept)
CREATE TABLE IF NOT EXISTS public.meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  happened_at TIMESTAMPTZ DEFAULT NOW(),
  location TEXT,
  event TEXT,
  notes_raw TEXT,
  summary TEXT,
  owner_user_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on meetings
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;

-- RLS policies for meetings
CREATE POLICY "Users can view their own meetings"
  ON public.meetings FOR SELECT
  USING (auth.uid() = owner_user_id);

CREATE POLICY "Users can create their own meetings"
  ON public.meetings FOR INSERT
  WITH CHECK (auth.uid() = owner_user_id);

CREATE POLICY "Users can update their own meetings"
  ON public.meetings FOR UPDATE
  USING (auth.uid() = owner_user_id);

CREATE POLICY "Users can delete their own meetings"
  ON public.meetings FOR DELETE
  USING (auth.uid() = owner_user_id);

-- Create CONTACTS_MEETINGS junction table
CREATE TABLE IF NOT EXISTS public.contacts_meetings (
  contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  meeting_id UUID NOT NULL REFERENCES public.meetings(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'primary',
  PRIMARY KEY (contact_id, meeting_id)
);

-- Enable RLS on contacts_meetings
ALTER TABLE public.contacts_meetings ENABLE ROW LEVEL SECURITY;

-- RLS policies for contacts_meetings (check through related tables)
CREATE POLICY "Users can view their own contact meetings"
  ON public.contacts_meetings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.contacts
      WHERE contacts.id = contact_id AND contacts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create their own contact meetings"
  ON public.contacts_meetings FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.contacts
      WHERE contacts.id = contact_id AND contacts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own contact meetings"
  ON public.contacts_meetings FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.contacts
      WHERE contacts.id = contact_id AND contacts.user_id = auth.uid()
    )
  );

-- Create CONFERENCES table
CREATE TABLE IF NOT EXISTS public.conferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  location TEXT,
  notes TEXT,
  owner_user_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on conferences
ALTER TABLE public.conferences ENABLE ROW LEVEL SECURITY;

-- RLS policies for conferences
CREATE POLICY "Users can view their own conferences"
  ON public.conferences FOR SELECT
  USING (auth.uid() = owner_user_id);

CREATE POLICY "Users can create their own conferences"
  ON public.conferences FOR INSERT
  WITH CHECK (auth.uid() = owner_user_id);

CREATE POLICY "Users can update their own conferences"
  ON public.conferences FOR UPDATE
  USING (auth.uid() = owner_user_id);

CREATE POLICY "Users can delete their own conferences"
  ON public.conferences FOR DELETE
  USING (auth.uid() = owner_user_id);

-- Create CONFERENCE_SESSIONS table
CREATE TABLE IF NOT EXISTS public.conference_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conference_id UUID NOT NULL REFERENCES public.conferences(id) ON DELETE CASCADE,
  meeting_id UUID REFERENCES public.meetings(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
  title TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  owner_user_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on conference_sessions
ALTER TABLE public.conference_sessions ENABLE ROW LEVEL SECURITY;

-- RLS policies for conference_sessions
CREATE POLICY "Users can view their own conference sessions"
  ON public.conference_sessions FOR SELECT
  USING (auth.uid() = owner_user_id);

CREATE POLICY "Users can create their own conference sessions"
  ON public.conference_sessions FOR INSERT
  WITH CHECK (auth.uid() = owner_user_id);

CREATE POLICY "Users can update their own conference sessions"
  ON public.conference_sessions FOR UPDATE
  USING (auth.uid() = owner_user_id);

CREATE POLICY "Users can delete their own conference sessions"
  ON public.conference_sessions FOR DELETE
  USING (auth.uid() = owner_user_id);

-- Create storage bucket for conference recaps
INSERT INTO storage.buckets (id, name, public)
VALUES ('conference_recaps', 'conference_recaps', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for conference_recaps bucket
CREATE POLICY "Users can upload their own recaps"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'conference_recaps' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own recaps"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'conference_recaps' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own recaps"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'conference_recaps' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own recaps"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'conference_recaps' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Create CONFERENCE_RECAPS table
CREATE TABLE IF NOT EXISTS public.conference_recaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conference_id UUID NOT NULL REFERENCES public.conferences(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  owner_user_id UUID NOT NULL
);

-- Enable RLS on conference_recaps
ALTER TABLE public.conference_recaps ENABLE ROW LEVEL SECURITY;

-- RLS policies for conference_recaps
CREATE POLICY "Users can view their own conference recaps"
  ON public.conference_recaps FOR SELECT
  USING (auth.uid() = owner_user_id);

CREATE POLICY "Users can create their own conference recaps"
  ON public.conference_recaps FOR INSERT
  WITH CHECK (auth.uid() = owner_user_id);

CREATE POLICY "Users can delete their own conference recaps"
  ON public.conference_recaps FOR DELETE
  USING (auth.uid() = owner_user_id);

-- Create helpful indexes for search performance
CREATE INDEX IF NOT EXISTS companies_name_idx ON public.companies USING gin (to_tsvector('simple', COALESCE(name,'') || ' ' || COALESCE(domain,'')));
CREATE INDEX IF NOT EXISTS contacts_name_email_idx ON public.contacts USING gin (to_tsvector('simple', COALESCE(full_name,'') || ' ' || COALESCE(email,'')));
CREATE INDEX IF NOT EXISTS company_domains_domain_idx ON public.company_domains (domain);
CREATE INDEX IF NOT EXISTS contacts_company_id_idx ON public.contacts (company_id);
CREATE INDEX IF NOT EXISTS leads_contact_id_idx ON public.leads (contact_id);
CREATE INDEX IF NOT EXISTS meetings_happened_at_idx ON public.meetings (happened_at DESC);
CREATE INDEX IF NOT EXISTS conference_sessions_conference_id_idx ON public.conference_sessions (conference_id);

-- Add trigger for updated_at on companies
CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON public.companies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add trigger for updated_at on leads
CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add trigger for updated_at on meetings
CREATE TRIGGER update_meetings_updated_at
  BEFORE UPDATE ON public.meetings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add trigger for updated_at on conferences
CREATE TRIGGER update_conferences_updated_at
  BEFORE UPDATE ON public.conferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();