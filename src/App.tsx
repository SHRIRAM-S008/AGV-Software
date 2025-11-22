import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import { Dashboard } from "./pages/Dashboard";
import Warehouse from "./pages/Warehouse";
import Analytics from "./pages/Analytics";
import { WMSManagement } from "./pages/WMSManagement";
import { AGVFleetManagement } from "./pages/AGVFleetManagement";
import { JobCreation } from "./pages/JobCreation";
import SystemSettings from "./pages/SystemSettings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppContent = () => {
  return (
    <div className="min-h-screen bg-[#000000]">
      <main className="flex-1 overflow-hidden bg-[#000000] min-h-screen">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/warehouse" element={<Warehouse />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/wms" element={<WMSManagement />} />
          <Route path="/agv-fleet" element={<AGVFleetManagement />} />
          <Route path="/job-creation" element={<JobCreation />} />
          <Route path="/settings" element={<SystemSettings />} />
          <Route path="/auth" element={<Navigate to="/" replace />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <Toaster />
    <Sonner />
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AppContent />
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
