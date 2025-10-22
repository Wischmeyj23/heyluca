import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, CreditCard } from "lucide-react";
import { RecordButton } from "@/components/RecordButton";
import { ContactPicker } from "@/components/ContactPicker";
import { PhotoGrid } from "@/components/PhotoGrid";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { Button } from "@/components/ui/button";
import { mockApi } from "@/lib/mock-api";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Contact } from "@/types";

export default function Capture() {
  const navigate = useNavigate();
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string>();
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: contacts = [] } = useQuery({
    queryKey: ["contacts"],
    queryFn: mockApi.contacts.list,
  });

  const handleStartRecording = () => {
    setIsRecording(true);
  };

  const handleStopRecording = async (duration: number) => {
    setIsRecording(false);
    try {
      // Mock audio file
      const mockFile = new File([""], "recording.mp3", { type: "audio/mp3" });
      const { audio_url } = await mockApi.upload.audio(mockFile);
      setAudioUrl(audio_url);
      toast.success("Recording saved!");
    } catch (error) {
      toast.error("Failed to save recording");
    }
  };

  const handleAddPhotos = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.multiple = true;
    input.onchange = async (e) => {
      const files = Array.from((e.target as HTMLInputElement).files || []);
      if (files.length > 0) {
        try {
          const { urls } = await mockApi.upload.photo(files);
          setPhotos([...photos, ...urls]);
          toast.success(`Added ${files.length} photo(s)`);
        } catch (error) {
          toast.error("Failed to upload photos");
        }
      }
    };
    input.click();
  };

  const handleScanCard = () => {
    navigate("/scan-card");
  };

  const handleCreateContact = () => {
    navigate("/contacts/new");
  };

  const handleSaveNote = async () => {
    if (!audioUrl) {
      toast.error("Please record audio first");
      return;
    }

    setIsProcessing(true);
    try {
      // Create note
      const note = await mockApi.notes.create({
        audio_url: audioUrl,
        contact_id: selectedContactId,
        photo_urls: photos,
        status: "processing",
      });

      // Process note
      const processed = await mockApi.process.note(note.id, audioUrl);
      await mockApi.notes.update(note.id, processed);

      toast.success("Note saved successfully!");
      navigate(`/note/${note.id}`);
    } catch (error) {
      toast.error("Failed to save note");
    } finally {
      setIsProcessing(false);
    }
  };

  const canSave = audioUrl && !isRecording;

  return (
    <div className="min-h-screen pb-24">
      {isProcessing && <LoadingOverlay message="Processing your note..." />}
      
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-brand bg-clip-text text-transparent">
            HeyLuca
          </h1>
          <p className="text-text-muted">Record a 60-second follow-up memory</p>
        </div>

        {/* Record Button */}
        <div className="mb-12 flex justify-center">
          <RecordButton
            onStart={handleStartRecording}
            onStop={handleStopRecording}
          />
        </div>

        {/* Form */}
        <div className="space-y-6">
          {/* Contact Picker */}
          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Contact
            </label>
            <ContactPicker
              contacts={contacts}
              selectedId={selectedContactId}
              onSelect={setSelectedContactId}
              onCreateNew={handleCreateContact}
            />
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={handleAddPhotos}
              className="gap-2"
            >
              <Camera className="w-4 h-4" />
              Add Photos
            </Button>
            <Button
              variant="outline"
              onClick={handleScanCard}
              className="gap-2"
            >
              <CreditCard className="w-4 h-4" />
              Scan Card
            </Button>
          </div>

          {/* Photos */}
          {photos.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Photos ({photos.length})
              </label>
              <PhotoGrid
                urls={photos}
                onRemove={(index) => setPhotos(photos.filter((_, i) => i !== index))}
              />
            </div>
          )}

          {/* Save Button */}
          <Button
            size="lg"
            onClick={handleSaveNote}
            disabled={!canSave}
            className="w-full"
          >
            Save Note
          </Button>

          {!audioUrl && (
            <p className="text-sm text-text-muted text-center">
              Record audio to enable saving
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
