import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Capture from "./pages/Capture";
import Notes from "./pages/Notes";
import NoteDetail from "./pages/NoteDetail";
import Contacts from "./pages/Contacts";
import ContactDetail from "./pages/ContactDetail";
import Settings from "./pages/Settings";
import Onboarding from "./pages/Onboarding";
import ScanCard from "./pages/ScanCard";
import NotFound from "./pages/NotFound";
import Companies from "./pages/crm/Companies";
import CompanyDetail from "./pages/crm/CompanyDetail";
import CRMContacts from "./pages/crm/CRMContacts";
import ContactDetailCRM from "./pages/crm/ContactDetailCRM";
import ConferenceList from "./pages/conferences/ConferenceList";
import ConferenceDetail from "./pages/conferences/ConferenceDetail";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <div className="min-h-screen bg-bg">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/capture" element={<ProtectedRoute><Capture /><Navigation /></ProtectedRoute>} />
              <Route path="/notes" element={<ProtectedRoute><Notes /><Navigation /></ProtectedRoute>} />
              <Route path="/note/:id" element={<ProtectedRoute><NoteDetail /></ProtectedRoute>} />
              <Route path="/contacts" element={<ProtectedRoute><Contacts /><Navigation /></ProtectedRoute>} />
              <Route path="/contacts/:id" element={<ProtectedRoute><ContactDetail /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Settings /><Navigation /></ProtectedRoute>} />
              <Route path="/scan-card" element={<ProtectedRoute><ScanCard /></ProtectedRoute>} />
              
              {/* CRM Routes */}
              <Route path="/crm/companies" element={<ProtectedRoute><Companies /><Navigation /></ProtectedRoute>} />
              <Route path="/crm/companies/:id" element={<ProtectedRoute><CompanyDetail /><Navigation /></ProtectedRoute>} />
              <Route path="/crm/contacts" element={<ProtectedRoute><CRMContacts /><Navigation /></ProtectedRoute>} />
              <Route path="/crm/contacts/:id" element={<ProtectedRoute><ContactDetailCRM /><Navigation /></ProtectedRoute>} />
              
              {/* Conference Routes */}
              <Route path="/conferences" element={<ProtectedRoute><ConferenceList /><Navigation /></ProtectedRoute>} />
              <Route path="/conferences/:id" element={<ProtectedRoute><ConferenceDetail /><Navigation /></ProtectedRoute>} />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
