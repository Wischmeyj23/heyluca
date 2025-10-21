import { useState, useMemo } from "react";
import { Contact } from "@/types";
import { Search, Plus, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ContactPickerProps {
  contacts: Contact[];
  selectedId: string | null;
  onSelect: (contactId: string | null) => void;
  onCreateNew: () => void;
}

export function ContactPicker({ 
  contacts, 
  selectedId, 
  onSelect,
  onCreateNew 
}: ContactPickerProps) {
  const [search, setSearch] = useState("");
  const [showPicker, setShowPicker] = useState(false);

  const selectedContact = contacts.find(c => c.id === selectedId);

  const filteredContacts = useMemo(() => {
    if (!search) return contacts;
    const lower = search.toLowerCase();
    return contacts.filter(c => 
      c.full_name.toLowerCase().includes(lower) ||
      c.company?.toLowerCase().includes(lower) ||
      c.email?.toLowerCase().includes(lower)
    );
  }, [contacts, search]);

  const handleSelect = (contactId: string) => {
    onSelect(contactId);
    setShowPicker(false);
    setSearch("");
  };

  const handleCreateNew = () => {
    setShowPicker(false);
    setSearch("");
    onCreateNew();
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setShowPicker(true)}
        className="w-full justify-start gap-3 h-auto py-3"
      >
        {selectedContact ? (
          <>
            <Avatar className="w-10 h-10">
              <AvatarImage src={selectedContact.avatar_url} />
              <AvatarFallback className="bg-brand/20 text-brand">
                {getInitials(selectedContact.full_name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-start">
              <span className="font-medium text-text">{selectedContact.full_name}</span>
              {selectedContact.company && (
                <span className="text-sm text-text-muted">{selectedContact.company}</span>
              )}
            </div>
          </>
        ) : (
          <>
            <User className="w-10 h-10 p-2 rounded-full bg-surface-elevated" />
            <span className="text-text-muted">Select contact</span>
          </>
        )}
      </Button>

      <Dialog open={showPicker} onOpenChange={setShowPicker}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Select Contact</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <Input
                placeholder="Search contacts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            <Button
              variant="outline"
              onClick={handleCreateNew}
              className="w-full justify-start gap-2"
            >
              <Plus className="w-4 h-4" />
              Create new contact
            </Button>

            <ScrollArea className="h-[300px]">
              <div className="space-y-1">
                {filteredContacts.map((contact) => (
                  <button
                    key={contact.id}
                    onClick={() => handleSelect(contact.id)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-surface-elevated transition-colors text-left"
                  >
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={contact.avatar_url} />
                      <AvatarFallback className="bg-brand/20 text-brand">
                        {getInitials(contact.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-text truncate">
                        {contact.full_name}
                      </div>
                      {contact.company && (
                        <div className="text-sm text-text-muted truncate">
                          {contact.company}
                        </div>
                      )}
                    </div>
                  </button>
                ))}
                {filteredContacts.length === 0 && (
                  <div className="text-center py-8 text-text-muted">
                    No contacts found
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
