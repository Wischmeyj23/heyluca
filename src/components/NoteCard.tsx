import { Note, Contact } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Clock, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, formatDistanceToNow, isPast } from "date-fns";

interface NoteCardProps {
  note: Note;
  contact?: Contact | null;
  onClick: () => void;
}

export function NoteCard({ note, contact, onClick }: NoteCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusColor = (status: Note["status"]) => {
    switch (status) {
      case "ready": return "bg-status-ready/20 text-status-ready border-status-ready/30";
      case "processing": return "bg-status-processing/20 text-status-processing border-status-processing/30";
      case "error": return "bg-status-error/20 text-status-error border-status-error/30";
      default: return "bg-status-draft/20 text-status-draft border-status-draft/30";
    }
  };

  const isOverdue = note.due_date && isPast(new Date(note.due_date));

  return (
    <button
      onClick={onClick}
      className="w-full p-4 bg-surface rounded-lg border border-border hover:border-brand/50 transition-all text-left group"
    >
      <div className="flex gap-3">
        {contact && (
          <Avatar className="w-12 h-12 flex-shrink-0">
            <AvatarImage src={contact.avatar_url} />
            <AvatarFallback className="bg-brand/20 text-brand">
              {getInitials(contact.full_name)}
            </AvatarFallback>
          </Avatar>
        )}

        <div className="flex-1 min-w-0 space-y-2">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              {contact && (
                <div className="font-semibold text-text truncate">
                  {contact.full_name}
                </div>
              )}
              {contact?.company && (
                <div className="text-sm text-text-muted truncate">
                  {contact.company}
                </div>
              )}
              {!contact && (
                <div className="text-text-muted">No contact</div>
              )}
            </div>
            
            <Badge 
              variant="outline" 
              className={cn("capitalize flex-shrink-0", getStatusColor(note.status))}
            >
              {note.status}
            </Badge>
          </div>

          {/* Summary */}
          {note.summary && note.summary.length > 0 && (
            <p className="text-sm text-text-muted line-clamp-2">
              {note.summary[0]}
            </p>
          )}

          {/* Next step pill */}
          {note.next_step && note.status === "ready" && (
            <div className="flex items-center gap-2 text-xs">
              <span className="px-2 py-1 rounded bg-accent/20 text-accent font-medium line-clamp-1">
                Next: {note.next_step}
              </span>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center gap-3 text-xs text-text-subtle">
            <span>
              {formatDistanceToNow(new Date(note.created_at), { addSuffix: true })}
            </span>
            
            {note.photo_urls && note.photo_urls.length > 0 && (
              <span className="flex items-center gap-1">
                <ImageIcon className="w-3 h-3" />
                {note.photo_urls.length}
              </span>
            )}

            {note.due_date && (
              <span 
                className={cn(
                  "flex items-center gap-1 ml-auto",
                  isOverdue && "text-error font-medium"
                )}
              >
                <Clock className="w-3 h-3" />
                {format(new Date(note.due_date), "MMM d")}
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}
