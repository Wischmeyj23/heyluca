# FO-MO.ai - Voice-First Follow-Up Memory Assistant

A beautiful, mobile-first web app for capturing and managing follow-up notes with AI-powered summaries and automatic next steps.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:8080`

## 📱 Features

- **60-Second Voice Recording**: Capture thoughts immediately after conversations
- **AI-Powered Summaries**: Automatic transcription and 3-point summaries
- **Next Step Extraction**: AI suggests actionable follow-ups with due dates
- **Contact Management**: Organize notes by contact with avatars and company info
- **Business Card Scanning**: OCR extraction with LinkedIn profile suggestions
- **Photo Attachments**: Add visual context to your notes
- **Search & Filters**: Find notes quickly with powerful search and filtering
- **Demo Mode**: Fully functional with simulated APIs and seeded data

## 🎨 Design System

Built with a dark-first design using:
- **Primary Brand**: Purple (#6C5CE7)
- **Accent**: Cyan (#00C2FF)
- **Dark Backgrounds**: Custom dark theme optimized for mobile
- **Responsive**: Mobile-first with large touch targets
- **Animations**: Smooth transitions and loading states

## 🏗️ Architecture

### Tech Stack
- React 18 + TypeScript
- Vite for fast development
- TanStack Query for state management
- Tailwind CSS for styling
- shadcn/ui components
- React Router for navigation

### Project Structure
```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui primitives
│   ├── RecordButton.tsx
│   ├── ContactPicker.tsx
│   ├── NoteCard.tsx
│   ├── AudioPlayer.tsx
│   └── ...
├── pages/              # Route pages
│   ├── Capture.tsx     # Main recording interface
│   ├── Notes.tsx       # Notes list with filters
│   ├── NoteDetail.tsx  # Individual note view
│   ├── Contacts.tsx    # Contact list
│   ├── Settings.tsx    # App settings
│   └── ...
├── lib/
│   ├── mock-api.ts     # Simulated backend APIs
│   ├── mock-data.ts    # Seeded demo data
│   └── utils.ts        # Helper functions
├── types/
│   └── index.ts        # TypeScript type definitions
└── App.tsx             # Main app with routing
```

## 🔧 Mock API & Demo Mode

All external services are simulated for demo purposes:

### Simulated Services
- **Audio Upload & Transcription**: Mock Whisper API
- **AI Summarization**: Mock GPT API with deterministic responses
- **OCR Processing**: Mock text extraction from business cards
- **LinkedIn Enrichment**: Mock profile URL suggestions
- **Reminders**: Mock scheduling service

### Demo Data
The app comes pre-seeded with:
- 3 sample contacts (Alex Rivera, Dana Chu, Brian Papazian)
- 6 sample notes with various statuses
- 2 scanned business cards

Enable/disable demo mode in **Settings > Demo Mode**.

## 📋 Key Features Explained

### Voice Recording
- 60-second maximum duration
- Visual progress ring
- Automatic save to mock storage

### Note Processing Flow
1. User records audio → Upload mock audio file
2. Create note with "processing" status
3. Simulate 1-2s delay (mock AI processing)
4. Update note with:
   - Transcript
   - 3-point summary
   - Suggested next step
   - Auto-generated tags
   - Status: "ready"

### Business Card Scanning
1. Upload card image
2. Mock OCR extraction (name, company, email, phone)
3. LinkedIn profile guess
4. Create contact or link to existing

### Search & Filters
- Full-text search across transcripts, summaries, contacts
- Quick filters: Last 7 days, Has next step, Overdue, With photos
- Real-time results

## 🔄 Converting to Real APIs

To connect real services, replace the mock implementations in `src/lib/mock-api.ts`:

### 1. Audio Processing
Replace `mockApi.upload.audio` and `mockApi.process.note` with:
- **Whisper API** for transcription
- **GPT-4** for summarization and next step extraction

### 2. OCR & Enrichment
Replace `mockApi.process.card` with:
- **Google Cloud Vision** or **AWS Textract** for OCR
- **LinkedIn API** or **Clearbit** for profile enrichment

### 3. Reminders
Replace `mockApi.reminders.schedule` with:
- **Google Calendar API**
- **SendGrid** for email reminders

### 4. Storage
Replace mock storage with:
- **AWS S3** or **Cloudinary** for audio/images
- **PostgreSQL** or **Supabase** for database

## 🎯 Usage Examples

### Creating a Note
1. Navigate to **Capture** (default route)
2. Tap the record button
3. Speak for up to 60 seconds
4. Select a contact (or create new)
5. Optionally add photos
6. Save note (auto-processes and summarizes)

### Scanning a Business Card
1. From Capture page, tap "Scan Card"
2. Upload card photo
3. Review extracted information
4. Tap "Create Contact" to save

### Managing Contacts
1. Navigate to **Contacts**
2. Browse alphabetically or search
3. Tap contact to view all notes
4. See stats: total notes, open next steps

## 🛠️ Development

### Available Scripts
```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Environment
No environment variables required for demo mode. For production:
- `VITE_OPENAI_API_KEY` - OpenAI API key
- `VITE_CLOUDINARY_URL` - Cloudinary config
- etc.

## 📝 TODO

Future enhancements to consider:
- [ ] Real-time collaboration
- [ ] Voice-to-text while recording
- [ ] Calendar integration
- [ ] Email follow-up templates
- [ ] Analytics dashboard
- [ ] Multi-language support
- [ ] Offline mode with sync
- [ ] Export to CRM systems

## 📄 License

This is a demo project showcasing a simulated AI-powered follow-up assistant.

## 🤝 Contributing

This is a demonstration project. Feel free to fork and customize for your needs.

---

Built with ❤️ using React, TypeScript, and modern web technologies.
