import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, MoreVertical, Calendar, Check, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AudioPlayer } from "@/components/AudioPlayer";
import { PhotoGrid } from "@/components/PhotoGrid";
import { StatusBadge } from "@/components/StatusBadge";
import { TagInput } from "@/components/TagInput";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { mockApi } from "@/lib/mock-api";
import { toast } from "sonner";
import { format } from "date-fns";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export default function NoteDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [nextStep, setNextStep] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [transcriptOpen, setTranscriptOpen] = useState(false);

  const { data: note } = useQuery({
    queryKey: ["note", id],
    queryFn: () => mockApi.notes.get(id!),
    enabled: !!id,
  });

  const { data: contacts = [] } = useQuery({
    queryKey: ["contacts"],
    queryFn: mockApi.contacts.list,
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => mockApi.notes.update(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["note", id] });
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      toast.success("Note updated");
      setIsEditing(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => mockApi.notes.delete(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      toast.success("Note deleted");
      navigate("/notes");
    },
  });

  if (!note) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-text-muted">Note not found</p>
      </div>
    );
  }

  const contact = contacts.find(c => c.id === note.contact_id);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSave = () => {
    updateMutation.mutate({
      next_step: nextStep || note.next_step,
      tags: tags.length > 0 ? tags : note.tags,
    });
  };

  const handleStartEdit = () => {
    setNextStep(note.next_step || "");
    setTags(note.tags || []);
    setIsEditing(true);
  };

  return (
    <div className="min-h-screen pb-24">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/notes")}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleStartEdit}>
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setShowDeleteDialog(true)}
                className="text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Contact Info */}
        {contact && (
          <div className="flex items-center gap-3 mb-6">
            <Avatar className="w-16 h-16">
              <AvatarImage src={contact.avatar_url} />
              <AvatarFallback className="bg-brand/20 text-brand text-xl">
                {getInitials(contact.full_name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{contact.full_name}</h1>
              {contact.company && (
                <p className="text-text-muted">{contact.company}</p>
              )}
            </div>
            <StatusBadge status={note.status} />
          </div>
        )}

        <div className="space-y-6">
          {/* Metadata */}
          <div className="text-sm text-text-muted">
            {format(new Date(note.created_at), "PPP 'at' p")}
          </div>

          {/* Audio */}
          {note.audio_url && (
            <div>
              <h3 className="text-sm font-medium text-text mb-2">Recording</h3>
              <AudioPlayer src={note.audio_url} />
            </div>
          )}

          {/* Transcript */}
          {note.transcript && (
            <Collapsible open={transcriptOpen} onOpenChange={setTranscriptOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="outline" className="w-full">
                  {transcriptOpen ? "Hide" : "Show"} Transcript
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2">
                <div className="p-4 bg-surface-elevated rounded-lg">
                  <p className="text-sm text-text-muted whitespace-pre-wrap">
                    {note.transcript}
                  </p>
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Summary */}
          {note.summary && note.summary.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-text mb-2">Summary</h3>
              <ul className="space-y-2">
                {note.summary.map((item, i) => (
                  <li key={i} className="flex gap-2 text-sm">
                    <span className="text-brand mt-1">•</span>
                    <span className="text-text-muted">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Next Step */}
          <div>
            <h3 className="text-sm font-medium text-text mb-2">Next Step</h3>
            {isEditing ? (
              <Textarea
                value={nextStep}
                onChange={(e) => setNextStep(e.target.value)}
                placeholder="What's the next action?"
                rows={3}
              />
            ) : note.next_step ? (
              <p className="text-text-muted">{note.next_step}</p>
            ) : (
              <p className="text-text-subtle italic">No next step defined</p>
            )}
          </div>

          {/* Due Date */}
          {note.due_date && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-accent" />
              <span className="text-text-muted">
                Due: {format(new Date(note.due_date), "PPP")}
              </span>
            </div>
          )}

          {/* Tags */}
          <div>
            <h3 className="text-sm font-medium text-text mb-2">Tags</h3>
            {isEditing ? (
              <TagInput tags={tags} onChange={setTags} />
            ) : note.tags && note.tags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {note.tags.map(tag => (
                  <span key={tag} className="px-2 py-1 bg-surface-elevated rounded text-xs">
                    {tag}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-text-subtle italic">No tags</p>
            )}
          </div>

          {/* Photos */}
          {note.photo_urls && note.photo_urls.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-text mb-2">
                Photos ({note.photo_urls.length})
              </h3>
              <PhotoGrid urls={note.photo_urls} readonly />
            </div>
          )}

          {/* Save Button */}
          {isEditing && (
            <div className="flex gap-2">
              <Button onClick={handleSave} className="flex-1 gap-2">
                <Check className="w-4 h-4" />
                Save Changes
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Note?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the note.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
