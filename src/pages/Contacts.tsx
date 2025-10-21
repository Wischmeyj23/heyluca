import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Search, Plus, Users as UsersIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { EmptyState } from "@/components/EmptyState";
import { mockApi } from "@/lib/mock-api";

export default function Contacts() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const { data: contacts = [] } = useQuery({
    queryKey: ["contacts"],
    queryFn: mockApi.contacts.list,
  });

  const { data: notes = [] } = useQuery({
    queryKey: ["notes"],
    queryFn: mockApi.notes.list,
  });

  const filteredContacts = useMemo(() => {
    if (!search) return contacts;
    const lower = search.toLowerCase();
    return contacts.filter(c =>
      c.full_name.toLowerCase().includes(lower) ||
      c.company?.toLowerCase().includes(lower) ||
      c.email?.toLowerCase().includes(lower)
    );
  }, [contacts, search]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getNotesCount = (contactId: string) => {
    return notes.filter(n => n.contact_id === contactId).length;
  };

  // Group by first letter
  const groupedContacts = useMemo(() => {
    const groups: Record<string, typeof contacts> = {};
    filteredContacts.forEach(contact => {
      const letter = contact.full_name[0].toUpperCase();
      if (!groups[letter]) groups[letter] = [];
      groups[letter].push(contact);
    });
    return groups;
  }, [filteredContacts]);

  const letters = Object.keys(groupedContacts).sort();

  return (
    <div className="min-h-screen pb-24">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Contacts</h1>
          <Button onClick={() => navigate("/contacts/new")} size="sm" className="gap-2">
            <Plus className="w-4 h-4" />
            New Contact
          </Button>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <Input
            placeholder="Search contacts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Contacts List */}
        {filteredContacts.length === 0 ? (
          <EmptyState
            icon={UsersIcon}
            title="No contacts yet"
            description="Add contacts to organize your follow-up notes"
            actionLabel="Add Contact"
            onAction={() => navigate("/contacts/new")}
          />
        ) : (
          <div className="space-y-6">
            {letters.map(letter => (
              <div key={letter}>
                <div className="sticky top-0 bg-bg py-2 mb-2">
                  <h3 className="text-sm font-bold text-text-muted">{letter}</h3>
                </div>
                <div className="space-y-2">
                  {groupedContacts[letter].map(contact => (
                    <button
                      key={contact.id}
                      onClick={() => navigate(`/contacts/${contact.id}`)}
                      className="w-full flex items-center gap-3 p-3 bg-surface rounded-lg border border-border hover:border-brand/50 transition-all text-left"
                    >
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={contact.avatar_url} />
                        <AvatarFallback className="bg-brand/20 text-brand">
                          {getInitials(contact.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-text truncate">
                          {contact.full_name}
                        </div>
                        {contact.company && (
                          <div className="text-sm text-text-muted truncate">
                            {contact.company}
                          </div>
                        )}
                      </div>
                      <div className="text-sm text-text-subtle">
                        {getNotesCount(contact.id)} notes
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
