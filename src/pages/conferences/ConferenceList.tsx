import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Plus, Search, MapPin } from "lucide-react";
import { Conference } from "@/types/crm";

export default function ConferenceList() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: conferences, isLoading } = useQuery({
    queryKey: ["conferences", searchQuery],
    queryFn: async () => {
      let query = supabase
        .from("conferences")
        .select("*, conference_sessions(count)")
        .order("start_date", { ascending: false, nullsFirst: false });

      if (searchQuery) {
        query = query.ilike("name", `%${searchQuery}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as (Conference & { conference_sessions: { count: number }[] })[];
    },
  });

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-text flex items-center gap-2">
              <Calendar className="w-8 h-8" />
              Events & Conferences
            </h1>
            <p className="text-text-muted mt-1">
              Manage your conference activities
            </p>
          </div>
          <Button onClick={() => navigate("/conferences/new")}>
            <Plus className="w-4 h-4 mr-2" />
            New Conference
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
          <Input
            placeholder="Search conferences..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Conference Grid */}
        {isLoading ? (
          <div className="text-center py-8 text-text-muted">Loading...</div>
        ) : conferences?.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-text-muted">
              No conferences found. Create your first conference to get started!
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {conferences?.map((conference) => (
              <Card
                key={conference.id}
                className="cursor-pointer hover:border-brand transition-colors"
                onClick={() => navigate(`/conferences/${conference.id}`)}
              >
                <CardHeader>
                  <CardTitle className="flex items-start justify-between">
                    <span className="line-clamp-2">{conference.name}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {(conference.start_date || conference.end_date) && (
                    <div className="flex items-center gap-2 text-sm text-text-muted">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {conference.start_date && new Date(conference.start_date).toLocaleDateString()}
                        {conference.end_date && ` - ${new Date(conference.end_date).toLocaleDateString()}`}
                      </span>
                    </div>
                  )}
                  {conference.location && (
                    <div className="flex items-center gap-2 text-sm text-text-muted">
                      <MapPin className="w-4 h-4" />
                      <span>{conference.location}</span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-border">
                    <p className="text-sm text-text-muted">
                      {conference.conference_sessions[0]?.count || 0} sessions
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
