import { UUID, ISODate } from './index';

export type Company = {
  id: UUID;
  name: string;
  domain?: string;
  website_url?: string;
  phone?: string;
  city?: string;
  state?: string;
  country?: string;
  industry?: string;
  linkedin_url?: string;
  notes?: string;
  owner_user_id: UUID;
  created_at: ISODate;
  updated_at: ISODate;
};

export type CompanyDomain = {
  id: UUID;
  company_id: UUID;
  domain: string;
  owner_user_id: UUID;
  created_at: ISODate;
};

export type Lead = {
  id: UUID;
  contact_id?: UUID;
  source?: string;
  status: 'new' | 'working' | 'qualified' | 'unqualified' | 'won' | 'lost';
  notes?: string;
  owner_user_id: UUID;
  created_at: ISODate;
  updated_at: ISODate;
};

export type Meeting = {
  id: UUID;
  happened_at: ISODate;
  location?: string;
  event?: string;
  notes_raw?: string;
  summary?: string;
  owner_user_id: UUID;
  created_at: ISODate;
  updated_at: ISODate;
};

export type ContactMeeting = {
  contact_id: UUID;
  meeting_id: UUID;
  role?: string;
};

export type Conference = {
  id: UUID;
  name: string;
  start_date?: string;
  end_date?: string;
  location?: string;
  notes?: string;
  owner_user_id: UUID;
  created_at: ISODate;
  updated_at: ISODate;
};

export type ConferenceSession = {
  id: UUID;
  conference_id: UUID;
  meeting_id?: UUID;
  contact_id?: UUID;
  title?: string;
  started_at: ISODate;
  owner_user_id: UUID;
  created_at: ISODate;
};

export type ConferenceRecap = {
  id: UUID;
  conference_id: UUID;
  storage_path: string;
  generated_at: ISODate;
  owner_user_id: UUID;
};
