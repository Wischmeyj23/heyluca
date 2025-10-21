import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import Capture from "./pages/Capture";
import Notes from "./pages/Notes";
import NoteDetail from "./pages/NoteDetail";
import Contacts from "./pages/Contacts";
import ContactDetail from "./pages/ContactDetail";
import Settings from "./pages/Settings";
import Onboarding from "./pages/Onboarding";
import ScanCard from "./pages/ScanCard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="min-h-screen bg-bg">
          <Routes>
            <Route path="/" element={<Navigate to="/capture" replace />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/capture" element={<><Capture /><Navigation /></>} />
            <Route path="/notes" element={<><Notes /><Navigation /></>} />
            <Route path="/note/:id" element={<NoteDetail />} />
            <Route path="/contacts" element={<><Contacts /><Navigation /></>} />
            <Route path="/contacts/:id" element={<ContactDetail />} />
            <Route path="/settings" element={<><Settings /><Navigation /></>} />
            <Route path="/scan-card" element={<ScanCard />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
