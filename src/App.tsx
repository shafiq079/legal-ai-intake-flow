import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import PublicIntake from "./pages/PublicIntake";
import AIIntake from "./pages/AIIntake";
import AIDocuments from "./pages/AIDocuments";
import AIForms from "./pages/AIForms";
import Cases from "./pages/Cases";
import Calendar from "./pages/Calendar";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import IntakeDetails from "./pages/IntakeDetails";
import IntakeEdit from "./pages/IntakeEdit";
import NotFound from "./pages/NotFound";
import CaseDetails from "./pages/CaseDetails";
import { NotificationProvider } from "./context/NotificationContext";

const queryClient = new QueryClient();

// Mock authentication - replace with real auth logic
import { PublicRoute } from "./components/auth/PublicRoute";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <NotificationProvider>
          <Routes>
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
          <Route path="/clients" element={<ProtectedRoute><Layout><Clients /></Layout></ProtectedRoute>} />
          <Route path="/ai-intake" element={<ProtectedRoute><Layout><AIIntake /></Layout></ProtectedRoute>} />
          <Route path="/ai-documents" element={<ProtectedRoute><Layout><AIDocuments /></Layout></ProtectedRoute>} />
          <Route path="/ai-forms" element={<ProtectedRoute><Layout><AIForms /></Layout></ProtectedRoute>} />
          <Route path="/cases" element={<ProtectedRoute><Layout><Cases /></Layout></ProtectedRoute>} />
          <Route path="/calendar" element={<ProtectedRoute><Layout><Calendar /></Layout></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute><Layout><Reports /></Layout></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Layout><Settings /></Layout></ProtectedRoute>} />
          <Route path="/intake/:linkId" element={<PublicIntake />} />
          <Route path="/intake-details/:id" element={<ProtectedRoute><Layout><IntakeDetails /></Layout></ProtectedRoute>} />
          <Route path="/intake-edit/:id" element={<ProtectedRoute><Layout><IntakeEdit /></Layout></ProtectedRoute>} />
          <Route path="/cases/:id" element={<ProtectedRoute><Layout><CaseDetails /></Layout></ProtectedRoute>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        </NotificationProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
