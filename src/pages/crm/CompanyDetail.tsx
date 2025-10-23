import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Building2, Globe, Phone, MapPin, Briefcase, Plus } from "lucide-react";
import { Company } from "@/types/crm";
import { Contact } from "@/types";

export default function CompanyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Guard against "new" route
  if (id === 'new') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-text-muted">Create company form not yet implemented</p>
      </div>
    );
  }

  const { data: company } = useQuery({
    queryKey: ["company", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("companies")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data as Company;
    },
  });

  const { data: contacts } = useQuery({
    queryKey: ["company-contacts", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contacts")
        .select("*")
        .eq("company_id", id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Contact[];
    },
  });

  if (!company) {
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
          <Button variant="ghost" size="icon" onClick={() => navigate("/crm/companies")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-text flex items-center gap-3">
              <Building2 className="w-8 h-8 text-brand" />
              {company.name}
            </h1>
          </div>
          <Button onClick={() => navigate(`/crm/contacts/new?company=${company.id}`)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Contact
          </Button>
        </div>

        {/* Company Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {company.website_url && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-text-muted">
                  <Globe className="w-4 h-4" />
                  <a
                    href={company.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-brand transition-colors"
                  >
                    {company.domain || 'Website'}
                  </a>
                </div>
              </CardContent>
            </Card>
          )}
          {company.phone && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-text-muted">
                  <Phone className="w-4 h-4" />
                  <span>{company.phone}</span>
                </div>
              </CardContent>
            </Card>
          )}
          {(company.city || company.country) && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-text-muted">
                  <MapPin className="w-4 h-4" />
                  <span>{[company.city, company.state, company.country].filter(Boolean).join(', ')}</span>
                </div>
              </CardContent>
            </Card>
          )}
          {company.industry && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-text-muted">
                  <Briefcase className="w-4 h-4" />
                  <span>{company.industry}</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="contacts" className="space-y-4">
          <TabsList>
            <TabsTrigger value="contacts">Contacts</TabsTrigger>
            <TabsTrigger value="overview">Overview</TabsTrigger>
          </TabsList>

          <TabsContent value="contacts" className="space-y-4">
            {contacts?.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-text-muted">
                  No contacts yet
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {contacts?.map((contact) => (
                  <Card
                    key={contact.id}
                    className="cursor-pointer hover:border-brand transition-colors"
                    onClick={() => navigate(`/crm/contacts/${contact.id}`)}
                  >
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg">{contact.full_name}</h3>
                          <p className="text-text-muted text-sm">{contact.email}</p>
                          {contact.phone && (
                            <p className="text-text-muted text-sm mt-1">{contact.phone}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle>Company Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-text-muted whitespace-pre-wrap">
                  {company.notes || 'No notes'}
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
