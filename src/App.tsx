import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Index from "./pages/Index";
import { Dashboard } from "./pages/Dashboard";
import Warehouse from "./pages/Warehouse";
import Analytics from "./pages/Analytics";
import { WMSManagement } from "./pages/WMSManagement";
import { AGVFleetManagement } from "./pages/AGVFleetManagement";
import AGVDigitalTwin from "./pages/AGVDigitalTwin";
import { JobCreation } from "./pages/JobCreation";
import SystemSettings from "./pages/SystemSettings";
import NotFound from "./pages/NotFound";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { ErrorBoundary } from "@/components/ui/error-boundary";

const queryClient = new QueryClient();

const AppContent = () => {
  const location = useLocation();
  const isLandingPage = location.pathname === '/';

  if (isLandingPage) {
    return (
      <ErrorBoundary>
        <div className="min-h-screen bg-[#000000] overflow-auto">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <main className="flex-1 overflow-auto">
            <Routes>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/warehouse" element={<Warehouse />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/wms" element={<WMSManagement />} />
              <Route path="/agv-fleet" element={<AGVFleetManagement />} />
              <Route path="/agv-digital-twin" element={<AGVDigitalTwin />} />
              <Route path="/job-creation" element={<JobCreation />} />
              <Route path="/settings" element={
                <ErrorBoundary fallback={
                  <div className="flex items-center justify-center h-full bg-gray-100">
                    <div className="text-center">
                      <div className="text-gray-600 text-lg font-semibold mb-2">Settings Unavailable</div>
                      <div className="text-gray-500 text-sm">The settings page could not be loaded</div>
                    </div>
                  </div>
                }>
                  <SystemSettings />
                </ErrorBoundary>
              } />
              <Route path="/auth" element={<Navigate to="/" replace />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </ErrorBoundary>
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
