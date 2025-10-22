import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Upload, Loader2, Check, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { BusinessCard } from "@/types";
import { contactSchema } from "@/lib/validation";

export default function ScanCard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [imageUrl, setImageUrl] = useState<string>();
  const [isProcessing, setIsProcessing] = useState(false);
  const [extracted, setExtracted] = useState<BusinessCard["extracted"]>();
  const [linkedinGuess, setLinkedinGuess] = useState<string>();

  const createContactMutation = useMutation({
    mutationFn: async (contactData: any) => {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      const { data, error } = await supabase
        .from('contacts')
        .insert({ ...contactData, user_id: userId })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (contact) => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      toast.success("Contact created!");
      navigate(`/contacts/${contact.id}`);
    },
  });

  const handleUpload = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        setIsProcessing(true);
        
        // Upload image to storage
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('business_cards')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('business_cards')
          .getPublicUrl(filePath);

        setImageUrl(publicUrl);
        
        // Create card record in database
        const { data: card, error: createError } = await supabase
          .from('business_cards')
          .insert({
            image_url: publicUrl,
            user_id: (await supabase.auth.getUser()).data.user?.id
          })
          .select()
          .single();

        if (createError) throw createError;
        
        // Mock OCR extraction (in production, this would be real OCR)
        const mockNames = ["Jennifer Lee", "Marcus Johnson", "Priya Patel", "Tom Anderson"];
        const mockCompanies = ["Stellar Inc", "CloudNext", "DataFlow Systems", "Apex Solutions"];
        
        const name = mockNames[Math.floor(Math.random() * mockNames.length)];
        const company = mockCompanies[Math.floor(Math.random() * mockCompanies.length)];
        const firstName = name.split(" ")[0].toLowerCase();
        const lastName = name.split(" ")[1].toLowerCase();
        
        const extractedData = {
          name,
          company,
          email: `${firstName}.${lastName}@${company.toLowerCase().replace(" ", "")}.com`,
          phone: `+1-555-${Math.floor(1000 + Math.random() * 9000)}`,
        };

        const ocrText = `${name}\n${company}\n${extractedData.email}\n${extractedData.phone}`;
        const linkedInGuess = `https://linkedin.com/in/${firstName}${lastName}`;

        // Process card with validation via edge function
        const { data: processedCard, error: processError } = await supabase.functions.invoke('process-card', {
          body: {
            card_id: card.id,
            extracted: extractedData,
            ocr_text: ocrText,
            linkedin_guess: linkedInGuess,
          }
        });

        if (processError) throw processError;

        setExtracted(extractedData);
        setLinkedinGuess(linkedInGuess);
        
        toast.success("Business card scanned!");
      } catch (error) {
        console.error("Error scanning card:", error);
        toast.error("Failed to scan card");
      } finally {
        setIsProcessing(false);
      }
    };
    input.click();
  };

  const handleCreateContact = () => {
    if (!extracted) return;
    
    // Validate contact data before submission
    const contactData = {
      full_name: extracted.name || "",
      company: extracted.company || "",
      email: extracted.email || "",
      phone: extracted.phone || "",
      linkedin_url: linkedinGuess || "",
    };

    const validation = contactSchema.safeParse(contactData);
    
    if (!validation.success) {
      const firstError = validation.error.errors[0];
      toast.error(`Validation error: ${firstError.message}`);
      return;
    }
    
    createContactMutation.mutate(validation.data);
  };

  return (
    <div className="min-h-screen pb-24">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/capture")}
          className="gap-2 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>

        <h1 className="text-2xl font-bold mb-6">Scan Business Card</h1>

        {/* Upload Area */}
        {!imageUrl ? (
          <button
            onClick={handleUpload}
            className="w-full aspect-[3/2] border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-3 hover:border-brand transition-colors bg-surface"
          >
            <Upload className="w-12 h-12 text-text-muted" />
            <div className="text-center">
              <p className="font-medium text-text">Upload business card</p>
              <p className="text-sm text-text-muted">Tap to select image</p>
            </div>
          </button>
        ) : (
          <div className="space-y-6">
            {/* Preview */}
            <div className="relative aspect-[3/2] rounded-lg overflow-hidden bg-surface-elevated">
              <img
                src={imageUrl}
                alt="Business card"
                className="w-full h-full object-contain"
              />
            </div>

            {/* Processing State */}
            {isProcessing && (
              <div className="p-4 bg-surface rounded-lg flex items-center gap-3">
                <Loader2 className="w-5 h-5 text-brand animate-spin" />
                <span className="text-text-muted">Processing card...</span>
              </div>
            )}

            {/* Extracted Data */}
            {extracted && !isProcessing && (
              <div className="space-y-4">
                <div className="p-4 bg-surface rounded-lg border border-success/30">
                  <div className="flex items-center gap-2 mb-3">
                    <Check className="w-5 h-5 text-success" />
                    <span className="font-medium text-success">Card scanned successfully</span>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs text-text-muted">Name</Label>
                      <p className="text-text font-medium">{extracted.name}</p>
                    </div>
                    
                    {extracted.company && (
                      <div>
                        <Label className="text-xs text-text-muted">Company</Label>
                        <p className="text-text font-medium">{extracted.company}</p>
                      </div>
                    )}
                    
                    {extracted.email && (
                      <div>
                        <Label className="text-xs text-text-muted">Email</Label>
                        <p className="text-text font-medium">{extracted.email}</p>
                      </div>
                    )}
                    
                    {extracted.phone && (
                      <div>
                        <Label className="text-xs text-text-muted">Phone</Label>
                        <p className="text-text font-medium">{extracted.phone}</p>
                      </div>
                    )}
                    
                    {linkedinGuess && (
                      <div>
                        <Label className="text-xs text-text-muted">LinkedIn (suggested)</Label>
                        <a
                          href={linkedinGuess}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-accent hover:underline flex items-center gap-1"
                        >
                          {linkedinGuess}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    onClick={handleCreateContact}
                    className="flex-1"
                    disabled={createContactMutation.isPending}
                  >
                    Create Contact
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setImageUrl(undefined);
                      setExtracted(undefined);
                      setLinkedinGuess(undefined);
                    }}
                  >
                    Scan Another
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
