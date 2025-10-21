import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Upload, Loader2, Check, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { mockApi } from "@/lib/mock-api";
import { toast } from "sonner";
import { BusinessCard } from "@/types";

export default function ScanCard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [imageUrl, setImageUrl] = useState<string>();
  const [isProcessing, setIsProcessing] = useState(false);
  const [extracted, setExtracted] = useState<BusinessCard["extracted"]>();
  const [linkedinGuess, setLinkedinGuess] = useState<string>();

  const createContactMutation = useMutation({
    mutationFn: mockApi.contacts.create,
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
        // Upload image
        const { image_url } = await mockApi.upload.card(file);
        setImageUrl(image_url);

        // Create card record
        const card = await mockApi.cards.create({ image_url });

        // Process OCR
        setIsProcessing(true);
        const processed = await mockApi.process.card(card.id);
        setExtracted(processed.extracted);
        setLinkedinGuess(processed.linkedin_guess);
        setIsProcessing(false);

        toast.success("Business card scanned!");
      } catch (error) {
        toast.error("Failed to scan card");
        setIsProcessing(false);
      }
    };
    input.click();
  };

  const handleCreateContact = () => {
    if (!extracted) return;
    
    createContactMutation.mutate({
      full_name: extracted.name || "",
      company: extracted.company,
      email: extracted.email,
      phone: extracted.phone,
      linkedin_url: linkedinGuess,
    });
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
