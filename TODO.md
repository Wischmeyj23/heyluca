# HeyLuca - Production Implementation TODO

This document maps simulated endpoints to real services for production deployment.

## 🎙️ Audio Processing

### Current (Mock)
```typescript
mockApi.upload.audio(file) → { audio_url: "/mock-audio.mp3" }
mockApi.process.note(noteId, audio_url) → { transcript, summary, next_step, tags }
```

### Production Implementation

#### 1. Audio Upload
**Service**: AWS S3 / Cloudinary / Supabase Storage
```typescript
// Upload to S3
const uploadAudio = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch('/api/upload/audio', {
    method: 'POST',
    body: formData,
  });
  
  return await response.json(); // { audio_url: "https://..." }
};
```

#### 2. Transcription
**Service**: OpenAI Whisper API
```typescript
const transcribeAudio = async (audio_url: string) => {
  const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: formData, // Include audio file
  });
  
  return await response.json(); // { text: "..." }
};
```

#### 3. Summarization
**Service**: OpenAI GPT-4 / Claude
```typescript
const SYSTEM_PROMPT = `You are a professional note summarizer. Given a conversation transcript:
1. Extract 3 key bullet points
2. Identify the most important next step (one clear action)
3. Suggest 3-5 relevant tags

Output as JSON:
{
  "summary": ["point 1", "point 2", "point 3"],
  "next_step": "specific action to take",
  "tags": ["tag1", "tag2", "tag3"]
}`;

const summarizeTranscript = async (transcript: string) => {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: transcript },
      ],
      response_format: { type: 'json_object' },
    }),
  });
  
  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
};
```

## 📇 Business Card OCR

### Current (Mock)
```typescript
mockApi.process.card(cardId) → { 
  ocr_text, 
  extracted: { name, company, email, phone },
  linkedin_guess 
}
```

### Production Implementation

#### 1. OCR Extraction
**Service**: Google Cloud Vision / AWS Textract / Azure Computer Vision
```typescript
const extractCardText = async (image_url: string) => {
  const response = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_API_KEY}`, {
    method: 'POST',
    body: JSON.stringify({
      requests: [{
        image: { source: { imageUri: image_url } },
        features: [{ type: 'TEXT_DETECTION' }],
      }],
    }),
  });
  
  const data = await response.json();
  return data.responses[0].textAnnotations[0].description; // Full OCR text
};
```

#### 2. Structured Extraction
**Service**: OpenAI GPT-4
```typescript
const EXTRACTION_PROMPT = `Extract contact information from this business card text:
{ocr_text}

Return JSON:
{
  "name": "full name",
  "company": "company name",
  "email": "email address",
  "phone": "phone number (with country code)"
}`;

const extractContactInfo = async (ocr_text: string) => {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are a business card parser.' },
        { role: 'user', content: EXTRACTION_PROMPT.replace('{ocr_text}', ocr_text) },
      ],
      response_format: { type: 'json_object' },
    }),
  });
  
  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
};
```

#### 3. LinkedIn Enrichment
**Service**: LinkedIn API / Clearbit / RocketReach
```typescript
const findLinkedInProfile = async (name: string, company: string) => {
  // Option 1: LinkedIn Official API (requires OAuth)
  // Option 2: Clearbit Enrichment API
  const response = await fetch(`https://person.clearbit.com/v2/combined/find?email=${email}`, {
    headers: {
      'Authorization': `Bearer ${CLEARBIT_API_KEY}`,
    },
  });
  
  const data = await response.json();
  return data.linkedin?.handle 
    ? `https://linkedin.com/in/${data.linkedin.handle}` 
    : null;
};
```

## 📅 Reminders & Calendar

### Current (Mock)
```typescript
mockApi.reminders.schedule(noteId, dueDate) → { scheduled: true }
```

### Production Implementation

#### 1. Calendar Integration
**Service**: Google Calendar API
```typescript
const scheduleReminder = async (title: string, dueDate: string, description: string) => {
  const event = {
    summary: title,
    description: description,
    start: {
      dateTime: new Date(dueDate).toISOString(),
      timeZone: 'America/Los_Angeles',
    },
    end: {
      dateTime: new Date(new Date(dueDate).getTime() + 30*60000).toISOString(),
      timeZone: 'America/Los_Angeles',
    },
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 24 * 60 },
        { method: 'popup', minutes: 30 },
      ],
    },
  };

  const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GOOGLE_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(event),
  });
  
  return await response.json();
};
```

#### 2. Email Reminders
**Service**: SendGrid / AWS SES / Resend
```typescript
const sendReminderEmail = async (to: string, subject: string, body: string, dueDate: string) => {
  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SENDGRID_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [{
        to: [{ email: to }],
        subject: subject,
      }],
      from: { email: 'reminders@heyluca.com' },
      content: [{
        type: 'text/html',
        value: body,
      }],
      send_at: Math.floor(new Date(dueDate).getTime() / 1000),
    }),
  });
  
  return await response.json();
};
```

## 💾 Database Schema

### PostgreSQL / Supabase

```sql
-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  demo_mode BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contacts
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  company TEXT,
  email TEXT,
  phone TEXT,
  linkedin_url TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notes
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  audio_url TEXT,
  transcript TEXT,
  summary JSONB, -- Array of bullet points
  next_step TEXT,
  due_date TIMESTAMPTZ,
  tags TEXT[],
  photo_urls TEXT[],
  status TEXT NOT NULL DEFAULT 'draft', -- draft | processing | ready | error
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Business Cards
CREATE TABLE business_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  image_url TEXT NOT NULL,
  ocr_text TEXT,
  extracted JSONB, -- { name, company, email, phone }
  linkedin_guess TEXT,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_notes_user_id ON notes(user_id);
CREATE INDEX idx_notes_contact_id ON notes(contact_id);
CREATE INDEX idx_notes_status ON notes(status);
CREATE INDEX idx_notes_due_date ON notes(due_date);
CREATE INDEX idx_contacts_user_id ON contacts(user_id);
```

## 🔐 Authentication

**Service**: Supabase Auth / Auth0 / Firebase Auth

```typescript
// Supabase example
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Sign up
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'secure-password',
});

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'secure-password',
});

// Get session
const { data: { session } } = await supabase.auth.getSession();
```

## 📊 Analytics

**Service**: PostHog / Mixpanel / Amplitude

```typescript
// Track events
analytics.track('note_created', {
  duration: 45,
  has_photos: true,
  contact_id: 'contact-123',
});

analytics.track('card_scanned', {
  extraction_success: true,
  fields_found: ['name', 'email', 'company'],
});
```

## 🚀 Deployment Checklist

- [ ] Set up production database (Supabase / PostgreSQL)
- [ ] Configure S3/Cloudinary for file storage
- [ ] Add OpenAI API key for transcription & summarization
- [ ] Set up OCR service (Google Vision / AWS Textract)
- [ ] Configure email service (SendGrid / SES)
- [ ] Implement authentication (Supabase Auth / Auth0)
- [ ] Add analytics tracking (PostHog / Mixpanel)
- [ ] Set up error monitoring (Sentry / LogRocket)
- [ ] Configure CDN for static assets
- [ ] Implement rate limiting for API endpoints
- [ ] Add backup strategy for database
- [ ] Set up CI/CD pipeline
- [ ] Configure domain and SSL certificate
- [ ] Implement GDPR compliance (data export, deletion)
- [ ] Add terms of service and privacy policy

## 💰 Cost Estimates (Monthly for 1000 active users)

| Service | Cost | Notes |
|---------|------|-------|
| OpenAI API (Whisper + GPT-4) | $200-400 | Depends on usage |
| Google Cloud Vision | $50-100 | OCR processing |
| AWS S3 | $10-20 | Audio/image storage |
| Supabase | $25-50 | Database + Auth |
| SendGrid | $20-40 | Email reminders |
| Vercel/Netlify | $0-20 | Hosting |
| **Total** | **$305-630** | |

## 🔧 Development vs Production

| Feature | Development (Mock) | Production |
|---------|-------------------|------------|
| Audio upload | Instant, local | S3 upload, ~1-2s |
| Transcription | Instant, fake text | Whisper API, ~5-10s |
| Summarization | Instant, canned | GPT-4, ~3-5s |
| OCR | Instant, fake data | Vision API, ~2-3s |
| Database | In-memory | PostgreSQL |
| Authentication | None | Supabase Auth |

---

**Next Steps**: Replace mocked endpoints one by one, starting with the most critical (audio processing, database) and gradually adding integrations.
