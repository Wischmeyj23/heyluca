import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Mail, Phone, Linkedin, Building2, Mic } from "lucide-react";
import { Contact } from "@/types";
import { Company, Meeting } from "@/types/crm";

export default function ContactDetailCRM() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Guard against "new" route
  if (id === 'new') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-text-muted">Create contact form not yet implemented</p>
      </div>
    );
  }

  const { data: contact } = useQuery({
    queryKey: ["contact", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contacts")
        .select("*, company:companies(*)")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data as Contact & { company: Company | null };
    },
  });

  const { data: meetings } = useQuery({
    queryKey: ["contact-meetings", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contacts_meetings")
        .select("meeting:meetings(*)")
        .eq("contact_id", id);
      if (error) throw error;
      // Sort by meeting happened_at on the client since contacts_meetings has no timestamp
      const sortedData = data
        .map(cm => cm.meeting)
        .filter(Boolean)
        .sort((a: any, b: any) => new Date(b.happened_at).getTime() - new Date(a.happened_at).getTime());
      return sortedData as Meeting[];
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

  if (!contact) {
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
          <Button variant="ghost" size="icon" onClick={() => navigate("/crm/contacts")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1 flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={contact.avatar_url} />
              <AvatarFallback className="text-lg">
                {contact.full_name ? getInitials(contact.full_name) : '?'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold text-text">
                {contact.full_name || 'Unnamed Contact'}
              </h1>
              {contact.company && (
                <button
                  onClick={() => navigate(`/crm/companies/${contact.company!.id}`)}
                  className="text-brand hover:underline flex items-center gap-2 mt-1"
                >
                  <Building2 className="w-4 h-4" />
                  {contact.company.name}
                </button>
              )}
            </div>
          </div>
          <Button onClick={() => navigate(`/capture?contact=${contact.id}`)}>
            <Mic className="w-4 h-4 mr-2" />
            Record
          </Button>
        </div>

        {/* Contact Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {contact.email && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-text-muted">
                  <Mail className="w-4 h-4" />
                  <a href={`mailto:${contact.email}`} className="hover:text-brand transition-colors">
                    {contact.email}
                  </a>
                </div>
              </CardContent>
            </Card>
          )}
          {contact.phone && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-text-muted">
                  <Phone className="w-4 h-4" />
                  <a href={`tel:${contact.phone}`} className="hover:text-brand transition-colors">
                    {contact.phone}
                  </a>
                </div>
              </CardContent>
            </Card>
          )}
          {contact.linkedin_url && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-text-muted">
                  <Linkedin className="w-4 h-4" />
                  <a
                    href={contact.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-brand transition-colors"
                  >
                    LinkedIn Profile
                  </a>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="meetings" className="space-y-4">
          <TabsList>
            <TabsTrigger value="meetings">Meetings ({meetings?.length || 0})</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="meetings" className="space-y-4">
            {meetings?.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-text-muted">
                  No meetings recorded yet
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {meetings?.map((meeting) => (
                  <Card key={meeting.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">
                            {meeting.event || 'Meeting'}
                          </CardTitle>
                          <p className="text-sm text-text-muted mt-1">
                            {new Date(meeting.happened_at).toLocaleString()}
                          </p>
                          {meeting.location && (
                            <p className="text-sm text-text-muted">{meeting.location}</p>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    {meeting.summary && (
                      <CardContent>
                        <p className="text-text-muted whitespace-pre-wrap">{meeting.summary}</p>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-text-muted">Full Name</label>
                  <p className="text-text mt-1">{contact.full_name || '—'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-text-muted">Email</label>
                  <p className="text-text mt-1">{contact.email || '—'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-text-muted">Phone</label>
                  <p className="text-text mt-1">{contact.phone || '—'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-text-muted">Company</label>
                  <p className="text-text mt-1">
                    {contact.company ? (
                      <button
                        onClick={() => navigate(`/crm/companies/${contact.company!.id}`)}
                        className="text-brand hover:underline"
                      >
                        {contact.company.name}
                      </button>
                    ) : (
                      '—'
                    )}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
