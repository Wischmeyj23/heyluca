import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Search, Filter, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NoteCard } from "@/components/NoteCard";
import { EmptyState } from "@/components/EmptyState";
import { mockApi } from "@/lib/mock-api";
import { FilterOptions } from "@/types";
import { isPast, isAfter, subDays } from "date-fns";
import { FileText } from "lucide-react";

export default function Notes() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<FilterOptions>({});

  const { data: notes = [] } = useQuery({
    queryKey: ["notes"],
    queryFn: mockApi.notes.list,
  });

  const { data: contacts = [] } = useQuery({
    queryKey: ["contacts"],
    queryFn: mockApi.contacts.list,
  });

  const filteredNotes = useMemo(() => {
    return notes.filter(note => {
      // Search
      if (search) {
        const searchLower = search.toLowerCase();
        const contact = contacts.find(c => c.id === note.contact_id);
        const matchesContact = contact?.full_name.toLowerCase().includes(searchLower) ||
                              contact?.company?.toLowerCase().includes(searchLower);
        const matchesTranscript = note.transcript?.toLowerCase().includes(searchLower);
        const matchesSummary = note.summary?.some(s => s.toLowerCase().includes(searchLower));
        
        if (!matchesContact && !matchesTranscript && !matchesSummary) {
          return false;
        }
      }

      // Timeframe
      if (filters.timeframe === '7days') {
        if (!isAfter(new Date(note.created_at), subDays(new Date(), 7))) {
          return false;
        }
      } else if (filters.timeframe === '30days') {
        if (!isAfter(new Date(note.created_at), subDays(new Date(), 30))) {
          return false;
        }
      }

      // Has next step
      if (filters.hasNextStep && !note.next_step) {
        return false;
      }

      // Is overdue
      if (filters.isOverdue) {
        if (!note.due_date || !isPast(new Date(note.due_date))) {
          return false;
        }
      }

      // Has photos
      if (filters.hasPhotos && (!note.photo_urls || note.photo_urls.length === 0)) {
        return false;
      }

      return true;
    });
  }, [notes, contacts, search, filters]);

  const toggleFilter = (key: keyof FilterOptions, value?: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: prev[key] === value ? undefined : value,
    }));
  };

  return (
    <div className="min-h-screen pb-24">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Notes</h1>
          <Button onClick={() => navigate("/capture")} size="sm" className="gap-2">
            <Plus className="w-4 h-4" />
            New Note
          </Button>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <Input
            placeholder="Search notes, contacts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <Badge
            variant={filters.timeframe === '7days' ? "default" : "outline"}
            onClick={() => toggleFilter('timeframe', '7days')}
            className="cursor-pointer"
          >
            Last 7 days
          </Badge>
          <Badge
            variant={filters.hasNextStep ? "default" : "outline"}
            onClick={() => toggleFilter('hasNextStep', true)}
            className="cursor-pointer"
          >
            Has next step
          </Badge>
          <Badge
            variant={filters.isOverdue ? "default" : "outline"}
            onClick={() => toggleFilter('isOverdue', true)}
            className="cursor-pointer"
          >
            Overdue
          </Badge>
          <Badge
            variant={filters.hasPhotos ? "default" : "outline"}
            onClick={() => toggleFilter('hasPhotos', true)}
            className="cursor-pointer"
          >
            With photos
          </Badge>
        </div>

        {/* Notes List */}
        {filteredNotes.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No notes yet"
            description="Record your first 60-second memory to get started"
            actionLabel="Create Note"
            onAction={() => navigate("/capture")}
          />
        ) : (
          <div className="space-y-3">
            {filteredNotes.map(note => {
              const contact = contacts.find(c => c.id === note.contact_id);
              return (
                <NoteCard
                  key={note.id}
                  note={note}
                  contact={contact}
                  onClick={() => navigate(`/note/${note.id}`)}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
