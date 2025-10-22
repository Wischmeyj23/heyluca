import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Plus, FileText, Calendar, MapPin } from "lucide-react";
import { Conference, ConferenceSession } from "@/types/crm";
import { Contact } from "@/types";
import { toast } from "sonner";

export default function ConferenceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: conference } = useQuery({
    queryKey: ["conference", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("conferences")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data as Conference;
    },
  });

  const { data: sessions } = useQuery({
    queryKey: ["conference-sessions", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("conference_sessions")
        .select("*, contact:contacts(*), meeting:meetings(*)")
        .eq("conference_id", id)
        .order("started_at", { ascending: false });
      if (error) throw error;
      return data as (ConferenceSession & { 
        contact: Contact | null;
        meeting: any | null;
      })[];
    },
  });

  const handleGenerateRecap = async () => {
    toast.info("Generating conference recap...");
    // TODO: Call edge function to generate recap
  };

  if (!conference) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-text-muted">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/conferences")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-text">{conference.name}</h1>
            <div className="flex flex-wrap gap-4 mt-2 text-sm text-text-muted">
              {(conference.start_date || conference.end_date) && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {conference.start_date && new Date(conference.start_date).toLocaleDateString()}
                    {conference.end_date && ` - ${new Date(conference.end_date).toLocaleDateString()}`}
                  </span>
                </div>
              )}
              {conference.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{conference.location}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleGenerateRecap}>
              <FileText className="w-4 h-4 mr-2" />
              Generate Recap
            </Button>
            <Button onClick={() => navigate(`/capture?conference=${conference.id}`)}>
              <Plus className="w-4 h-4 mr-2" />
              New Session
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="sessions" className="space-y-4">
          <TabsList>
            <TabsTrigger value="sessions">Sessions ({sessions?.length || 0})</TabsTrigger>
            <TabsTrigger value="summary">Summary</TabsTrigger>
          </TabsList>

          <TabsContent value="sessions" className="space-y-4">
            {sessions?.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-text-muted">
                  No sessions yet. Start recording to add sessions!
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {sessions?.map((session) => (
                  <Card key={session.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">
                            {session.title || `Session with ${session.contact?.full_name || 'Unknown'}`}
                          </CardTitle>
                          <p className="text-sm text-text-muted mt-1">
                            {new Date(session.started_at).toLocaleString()}
                          </p>
                        </div>
                        {session.contact && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/crm/contacts/${session.contact!.id}`)}
                          >
                            View Contact
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    {session.meeting?.summary && (
                      <CardContent>
                        <p className="text-text-muted whitespace-pre-wrap">
                          {session.meeting.summary}
                        </p>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="summary">
            <Card>
              <CardHeader>
                <CardTitle>Conference Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-text-muted">Total Sessions</label>
                  <p className="text-2xl font-bold text-text mt-1">{sessions?.length || 0}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-text-muted">Unique Contacts</label>
                  <p className="text-2xl font-bold text-text mt-1">
                    {new Set(sessions?.map(s => s.contact_id).filter(Boolean)).size}
                  </p>
                </div>
                {conference.notes && (
                  <div className="pt-4 border-t border-border">
                    <label className="text-sm font-medium text-text-muted">Notes</label>
                    <p className="text-text-muted mt-2 whitespace-pre-wrap">{conference.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
