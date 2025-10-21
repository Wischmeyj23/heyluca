import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Plus, ExternalLink, Mic, Camera, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { NoteCard } from "@/components/NoteCard";
import { mockApi } from "@/lib/mock-api";

export default function ContactDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const { data: contact } = useQuery({
    queryKey: ["contact", id],
    queryFn: () => mockApi.contacts.get(id!),
    enabled: !!id,
  });

  const { data: allNotes = [] } = useQuery({
    queryKey: ["notes"],
    queryFn: mockApi.notes.list,
  });

  if (!contact) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-text-muted">Contact not found</p>
      </div>
    );
  }

  const notes = allNotes.filter(n => n.contact_id === contact.id);
  const openNextSteps = notes.filter(n => n.next_step && n.status === "ready").length;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen pb-24">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/contacts")}
          className="gap-2 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>

        {/* Contact Info */}
        <div className="flex items-start gap-4 mb-6">
          <Avatar className="w-20 h-20">
            <AvatarImage src={contact.avatar_url} />
            <AvatarFallback className="bg-brand/20 text-brand text-2xl">
              {getInitials(contact.full_name)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-1">{contact.full_name}</h1>
            {contact.company && (
              <p className="text-text-muted mb-2">{contact.company}</p>
            )}
            
            <div className="space-y-1 text-sm">
              {contact.email && (
                <a 
                  href={`mailto:${contact.email}`}
                  className="block text-accent hover:underline"
                >
                  {contact.email}
                </a>
              )}
              {contact.phone && (
                <a 
                  href={`tel:${contact.phone}`}
                  className="block text-text-muted hover:text-text"
                >
                  {contact.phone}
                </a>
              )}
              {contact.linkedin_url && (
                <a
                  href={contact.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-accent hover:underline"
                >
                  LinkedIn
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2 mb-6">
          <Button variant="outline" size="sm" className="gap-2">
            <Mic className="w-4 h-4" />
            New Note
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Camera className="w-4 h-4" />
            Add Photo
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="p-3 bg-surface rounded-lg text-center">
            <div className="text-2xl font-bold text-text">{notes.length}</div>
            <div className="text-xs text-text-muted">Total Notes</div>
          </div>
          <div className="p-3 bg-surface rounded-lg text-center">
            <div className="text-2xl font-bold text-accent">{openNextSteps}</div>
            <div className="text-xs text-text-muted">Open Steps</div>
          </div>
          <div className="p-3 bg-surface rounded-lg text-center">
            <div className="text-2xl font-bold text-text-muted">
              {notes.length > 0 ? "Recent" : "Never"}
            </div>
            <div className="text-xs text-text-muted">Last Contact</div>
          </div>
        </div>

        {/* Recent Notes */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Notes</h2>
          </div>
          
          {notes.length === 0 ? (
            <div className="text-center py-8 text-text-muted">
              No notes yet
            </div>
          ) : (
            <div className="space-y-3">
              {notes.slice(0, 10).map(note => (
                <NoteCard
                  key={note.id}
                  note={note}
                  contact={contact}
                  onClick={() => navigate(`/note/${note.id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
