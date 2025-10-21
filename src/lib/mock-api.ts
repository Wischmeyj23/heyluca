import { Note, Contact, BusinessCard } from "@/types";
import { mockNotes, mockContacts, mockBusinessCards, mockUser } from "./mock-data";

// Simulated latency
const delay = (ms: number = 1000) => new Promise(resolve => setTimeout(resolve, ms));
const randomDelay = () => delay(800 + Math.random() * 700);

// In-memory store for demo mode
let notesStore = [...mockNotes];
let contactsStore = [...mockContacts];
let cardsStore = [...mockBusinessCards];
let userStore = { ...mockUser };

export const mockApi = {
  // Upload endpoints
  upload: {
    audio: async (file: File): Promise<{ audio_url: string }> => {
      await randomDelay();
      if (Math.random() < 0.05) throw new Error("Upload failed");
      return {
        audio_url: `/mock-audio-${Date.now()}.mp3`,
      };
    },
    
    photo: async (files: File[]): Promise<{ urls: string[] }> => {
      await randomDelay();
      return {
        urls: files.map((_, i) => `/mock-photo-${Date.now()}-${i}.jpg`),
      };
    },
    
    card: async (file: File): Promise<{ image_url: string }> => {
      await randomDelay();
      return {
        image_url: `/mock-card-${Date.now()}.jpg`,
      };
    },
  },

  // Processing endpoints
  process: {
    note: async (noteId: string, audio_url: string): Promise<Partial<Note>> => {
      await delay(1500);
      if (Math.random() < 0.05) {
        throw new Error("Processing failed - please try again");
      }
      
      const mockTranscripts = [
        "Just had a great conversation about their upcoming product launch. They're looking to expand into new markets and need strategic partners. Budget approved for Q1. Very interested in our solution and want to move fast. Decision maker is on board.",
        "Coffee meeting went well. Discussed their current challenges with workflow automation. They're spending too much time on manual processes. Showed interest in our platform, especially the AI features. Want to see a demo next week.",
        "Met at the conference. They're frustrated with their current vendor and actively looking for alternatives. Contract expires in 60 days. Perfect timing for us. Need to send over case studies and pricing.",
      ];
      
      const transcript = mockTranscripts[Math.floor(Math.random() * mockTranscripts.length)];
      
      return {
        transcript,
        summary: [
          "Productive conversation about product launch and market expansion",
          "Budget approved for Q1, decision maker is engaged",
          "Strong interest in our solution, ready to move quickly",
        ],
        next_step: "Send follow-up email with case studies and schedule demo call",
        tags: ["follow-up", "qualified", "hot-lead"],
        status: "ready",
      };
    },
    
    card: async (cardId: string): Promise<Partial<BusinessCard>> => {
      await delay(1200);
      
      const mockNames = ["Jennifer Lee", "Marcus Johnson", "Priya Patel", "Tom Anderson"];
      const mockCompanies = ["Stellar Inc", "CloudNext", "DataFlow Systems", "Apex Solutions"];
      
      const name = mockNames[Math.floor(Math.random() * mockNames.length)];
      const company = mockCompanies[Math.floor(Math.random() * mockCompanies.length)];
      const firstName = name.split(" ")[0].toLowerCase();
      const lastName = name.split(" ")[1].toLowerCase();
      
      return {
        ocr_text: `${name}\n${company}\n${firstName}.${lastName}@${company.toLowerCase().replace(" ", "")}.com\n+1-555-${Math.floor(1000 + Math.random() * 9000)}`,
        extracted: {
          name,
          company,
          email: `${firstName}.${lastName}@${company.toLowerCase().replace(" ", "")}.com`,
          phone: `+1-555-${Math.floor(1000 + Math.random() * 9000)}`,
        },
        linkedin_guess: `https://linkedin.com/in/${firstName}${lastName}`,
        processed_at: new Date().toISOString(),
      };
    },
  },

  // CRUD endpoints
  notes: {
    list: async (): Promise<Note[]> => {
      await delay(300);
      return notesStore;
    },
    
    get: async (id: string): Promise<Note | null> => {
      await delay(200);
      return notesStore.find(n => n.id === id) || null;
    },
    
    create: async (data: Partial<Note>): Promise<Note> => {
      await delay(400);
      const note: Note = {
        id: `note-${Date.now()}`,
        user_id: mockUser.id,
        contact_id: data.contact_id || null,
        audio_url: data.audio_url,
        status: "draft",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...data,
      } as Note;
      notesStore.unshift(note);
      return note;
    },
    
    update: async (id: string, data: Partial<Note>): Promise<Note> => {
      await delay(300);
      const index = notesStore.findIndex(n => n.id === id);
      if (index === -1) throw new Error("Note not found");
      notesStore[index] = {
        ...notesStore[index],
        ...data,
        updated_at: new Date().toISOString(),
      };
      return notesStore[index];
    },
    
    delete: async (id: string): Promise<void> => {
      await delay(200);
      notesStore = notesStore.filter(n => n.id !== id);
    },
  },

  contacts: {
    list: async (): Promise<Contact[]> => {
      await delay(300);
      return contactsStore;
    },
    
    get: async (id: string): Promise<Contact | null> => {
      await delay(200);
      return contactsStore.find(c => c.id === id) || null;
    },
    
    create: async (data: Partial<Contact>): Promise<Contact> => {
      await delay(400);
      const contact: Contact = {
        id: `contact-${Date.now()}`,
        user_id: mockUser.id,
        full_name: data.full_name || "",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...data,
      } as Contact;
      contactsStore.push(contact);
      return contact;
    },
    
    update: async (id: string, data: Partial<Contact>): Promise<Contact> => {
      await delay(300);
      const index = contactsStore.findIndex(c => c.id === id);
      if (index === -1) throw new Error("Contact not found");
      contactsStore[index] = {
        ...contactsStore[index],
        ...data,
        updated_at: new Date().toISOString(),
      };
      return contactsStore[index];
    },
    
    delete: async (id: string): Promise<void> => {
      await delay(200);
      contactsStore = contactsStore.filter(c => c.id !== id);
    },
  },

  cards: {
    list: async (): Promise<BusinessCard[]> => {
      await delay(300);
      return cardsStore;
    },
    
    create: async (data: Partial<BusinessCard>): Promise<BusinessCard> => {
      await delay(400);
      const card: BusinessCard = {
        id: `card-${Date.now()}`,
        user_id: mockUser.id,
        image_url: data.image_url || "",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...data,
      } as BusinessCard;
      cardsStore.push(card);
      return card;
    },
  },

  reminders: {
    schedule: async (noteId: string, dueDate: string): Promise<{ scheduled: boolean }> => {
      await delay(500);
      return { scheduled: true };
    },
  },

  export: {
    data: async (format: 'csv' | 'json'): Promise<string> => {
      await delay(800);
      if (format === 'json') {
        return JSON.stringify({
          contacts: contactsStore,
          notes: notesStore,
          cards: cardsStore,
          exported_at: new Date().toISOString(),
        }, null, 2);
      }
      // Simple CSV export
      return "id,name,company,notes_count\n" + 
        contactsStore.map(c => 
          `${c.id},${c.full_name},${c.company || 'N/A'},${notesStore.filter(n => n.contact_id === c.id).length}`
        ).join("\n");
    },
  },

  user: {
    get: async () => {
      await delay(200);
      return userStore;
    },
    
    update: async (data: Partial<typeof userStore>) => {
      await delay(300);
      userStore = { ...userStore, ...data };
      return userStore;
    },
  },

  // Demo data management
  demo: {
    reset: () => {
      notesStore = [...mockNotes];
      contactsStore = [...mockContacts];
      cardsStore = [...mockBusinessCards];
      userStore = { ...mockUser };
    },
    
    seed: () => {
      // Already seeded with mock data
      return {
        contacts: contactsStore.length,
        notes: notesStore.length,
        cards: cardsStore.length,
      };
    },
  },
};
