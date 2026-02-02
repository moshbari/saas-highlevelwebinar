import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import WebinarEditor from "./pages/WebinarEditor";
import WebinarCode from "./pages/WebinarCode";
import WebinarPreviewPage from "./pages/WebinarPreviewPage";
import ChatHistory from "./pages/ChatHistory";
import ChatDetail from "./pages/ChatDetail";
import ReportingDashboard from "./pages/ReportingDashboard";
import Live from "./pages/Live";
import ClipLibrary from "./pages/ClipLibrary";
import LiveChat from "./pages/LiveChat";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Laboratory from "./pages/Laboratory";
import Upgrade from "./pages/Upgrade";
import UpdatePassword from "./pages/UpdatePassword";
import AppSettings from "./pages/AppSettings";
import ApiKeys from "./pages/ApiKeys";
import Branding from "./pages/Branding";
import AnalyticsHelp from "./pages/AnalyticsHelp";
import WatchWebinar from "./pages/WatchWebinar";
import ReplayWebinar from "./pages/ReplayWebinar";
import RegisterPage from "./pages/RegisterPage";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { AppErrorBoundary } from "./components/app/AppErrorBoundary";
import { ROUTES } from "./lib/routes";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
      staleTime: 1000 * 60,
      gcTime: 1000 * 60 * 5,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppErrorBoundary>
        <BrowserRouter>
        <Routes>
            {/* Public routes */}
            <Route path="/auth" element={<Auth />} />
            <Route path="/watch/:webinarId" element={<WatchWebinar />} />
            <Route path="/replay/:webinarId" element={<ReplayWebinar />} />
            <Route path="/register/:webinarId" element={<RegisterPage />} />
            
            {/* Protected user routes */}
            <Route path="/laboratory" element={<ProtectedRoute><Laboratory /></ProtectedRoute>} />
            <Route path="/upgrade" element={<ProtectedRoute><Upgrade /></ProtectedRoute>} />
            <Route path="/update-password" element={<ProtectedRoute><UpdatePassword /></ProtectedRoute>} />
            <Route path="/api-keys" element={<ProtectedRoute><ApiKeys /></ProtectedRoute>} />
            
            {/* Admin-only routes */}
            <Route path="/app-settings" element={<ProtectedRoute requireAdmin><AppSettings /></ProtectedRoute>} />
            <Route path="/branding" element={<ProtectedRoute requireAdmin><Branding /></ProtectedRoute>} />
            
            {/* Root redirects directly to laboratory - no component hop */}
            <Route path="/" element={<ProtectedRoute><Navigate to={ROUTES.HOME} replace /></ProtectedRoute>} />
            
            {/* Webinar dashboard routes (protected) */}
            <Route path="/dashboard" element={<ProtectedRoute><ReportingDashboard /></ProtectedRoute>} />
            <Route path="/analytics-help" element={<ProtectedRoute><AnalyticsHelp /></ProtectedRoute>} />
            <Route path="/webinar/new" element={<ProtectedRoute><WebinarEditor /></ProtectedRoute>} />
            <Route path="/webinar/:id/edit" element={<ProtectedRoute><WebinarEditor /></ProtectedRoute>} />
            <Route path="/webinar/:id/code" element={<ProtectedRoute><WebinarCode /></ProtectedRoute>} />
            <Route path="/webinar/:id/preview" element={<ProtectedRoute><WebinarPreviewPage /></ProtectedRoute>} />
            <Route path="/chat-history" element={<ProtectedRoute><ChatHistory /></ProtectedRoute>} />
            <Route path="/chat-history/:webinarId/:sessionDate/:userEmail" element={<ProtectedRoute><ChatDetail /></ProtectedRoute>} />
            <Route path="/live" element={<ProtectedRoute><Live /></ProtectedRoute>} />
            <Route path="/live-chat" element={<ProtectedRoute><LiveChat /></ProtectedRoute>} />
            <Route path="/clips" element={<ProtectedRoute><ClipLibrary /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AppErrorBoundary>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
