import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, Plus, Search } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Contact } from "@/types";
import { Company } from "@/types/crm";

export default function CRMContacts() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: contacts, isLoading } = useQuery({
    queryKey: ["crm-contacts", searchQuery],
    queryFn: async () => {
      // Sanitize search query: max 100 chars, trim whitespace, minimum 2 chars
      const sanitizedQuery = searchQuery.trim().slice(0, 100);
      
      let query = supabase
        .from("contacts")
        .select("*, company:companies(*)")
        .order("created_at", { ascending: false });

      if (sanitizedQuery.length >= 2) {
        query = query.or(`full_name.ilike.%${sanitizedQuery}%,email.ilike.%${sanitizedQuery}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as (Contact & { company: Company | null })[];
    },
  });

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-text flex items-center gap-2">
              <Users className="w-8 h-8" />
              Contacts
            </h1>
            <p className="text-text-muted mt-1">
              Manage your contact relationships
            </p>
          </div>
          <Button onClick={() => navigate("/crm/contacts/new")}>
            <Plus className="w-4 h-4 mr-2" />
            New Contact
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
          <Input
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Table */}
        <div className="bg-surface rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-text-muted">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : contacts?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-text-muted">
                    No contacts found
                  </TableCell>
                </TableRow>
              ) : (
                contacts?.map((contact) => (
                  <TableRow
                    key={contact.id}
                    className="cursor-pointer"
                    onClick={() => navigate(`/crm/contacts/${contact.id}`)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={contact.avatar_url} />
                          <AvatarFallback>
                            {contact.full_name ? getInitials(contact.full_name) : '?'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{contact.full_name || 'Unnamed'}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-text-muted">{contact.email || '—'}</TableCell>
                    <TableCell className="text-text-muted">{contact.phone || '—'}</TableCell>
                    <TableCell>
                      {contact.company ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/crm/companies/${contact.company.id}`);
                          }}
                          className="text-brand hover:underline"
                        >
                          {contact.company.name}
                        </button>
                      ) : (
                        <span className="text-text-muted">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-text-muted">
                      {new Date(contact.created_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
