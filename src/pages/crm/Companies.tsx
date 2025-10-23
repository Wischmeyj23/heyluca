import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Building2, Plus, Search } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Company } from "@/types/crm";

export default function Companies() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: companies, isLoading } = useQuery({
    queryKey: ["companies", searchQuery],
    queryFn: async () => {
      // Sanitize search query: max 100 chars, trim whitespace, minimum 2 chars
      const sanitizedQuery = searchQuery.trim().slice(0, 100);
      
      let query = supabase
        .from("companies")
        .select("*, contacts(count)")
        .order("updated_at", { ascending: false });

      if (sanitizedQuery.length >= 2) {
        query = query.or(`name.ilike.%${sanitizedQuery}%,domain.ilike.%${sanitizedQuery}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as (Company & { contacts: { count: number }[] })[];
    },
  });

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-text flex items-center gap-2">
              <Building2 className="w-8 h-8" />
              Companies
            </h1>
            <p className="text-text-muted mt-1">
              Manage your company relationships
            </p>
          </div>
          <Button onClick={() => navigate("/crm/companies/new")}>
            <Plus className="w-4 h-4 mr-2" />
            New Company
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
          <Input
            placeholder="Search companies..."
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
                <TableHead>Company</TableHead>
                <TableHead>Domain</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Industry</TableHead>
                <TableHead className="text-right">Contacts</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-text-muted">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : companies?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-text-muted">
                    No companies found
                  </TableCell>
                </TableRow>
              ) : (
                companies?.map((company) => (
                  <TableRow
                    key={company.id}
                    className="cursor-pointer"
                    onClick={() => navigate(`/crm/companies/${company.id}`)}
                  >
                    <TableCell className="font-medium">{company.name}</TableCell>
                    <TableCell className="text-text-muted">{company.domain || '—'}</TableCell>
                    <TableCell className="text-text-muted">{company.phone || '—'}</TableCell>
                    <TableCell className="text-text-muted">
                      {[company.city, company.country].filter(Boolean).join(', ') || '—'}
                    </TableCell>
                    <TableCell className="text-text-muted">{company.industry || '—'}</TableCell>
                    <TableCell className="text-right">
                      {company.contacts[0]?.count || 0}
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
