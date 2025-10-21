export type UUID = string;
export type ISODate = string;

export type Contact = {
  id: UUID;
  user_id: UUID;
  full_name: string;
  company?: string;
  email?: string;
  phone?: string;
  linkedin_url?: string;
  avatar_url?: string;
  created_at: ISODate;
  updated_at: ISODate;
};

export type NoteStatus = "draft" | "processing" | "ready" | "error";

export type Note = {
  id: UUID;
  user_id: UUID;
  contact_id: UUID | null;
  audio_url?: string;
  transcript?: string;
  summary?: string[];
  next_step?: string;
  due_date?: ISODate | null;
  tags?: string[];
  photo_urls?: string[];
  status: NoteStatus;
  created_at: ISODate;
  updated_at: ISODate;
};

export type BusinessCard = {
  id: UUID;
  user_id: UUID;
  contact_id?: UUID | null;
  image_url: string;
  ocr_text?: string;
  extracted?: {
    name?: string;
    company?: string;
    email?: string;
    phone?: string;
  };
  linkedin_guess?: string;
  processed_at?: ISODate;
  created_at: ISODate;
  updated_at: ISODate;
};

export type User = {
  id: UUID;
  email: string;
  full_name: string;
  avatar_url?: string;
  demo_mode: boolean;
  created_at: ISODate;
};

export type FilterOptions = {
  search?: string;
  timeframe?: 'all' | '7days' | '30days';
  hasNextStep?: boolean;
  isOverdue?: boolean;
  hasPhotos?: boolean;
};

export type SortOption = 'newest' | 'oldest' | 'due_date';
