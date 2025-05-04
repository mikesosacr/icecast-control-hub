
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/components/ui/theme-provider';
import { TooltipProvider } from '@/components/ui/tooltip';
import Dashboard from '@/pages/Dashboard';
import Mountpoints from '@/pages/Mountpoints';
import Users from '@/pages/Users';
import Statistics from '@/pages/Statistics';
import Logs from '@/pages/Logs';
import Configuration from '@/pages/Configuration';
import ServerControl from '@/pages/ServerControl';
import RemoteServers from '@/pages/RemoteServers';
import Index from '@/pages/Index';
import NotFound from '@/pages/NotFound';
import { queryClient } from '@/lib/react-query';
import DashboardLayout from '@/components/layout/DashboardLayout';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="icecast-ui-theme">
        <TooltipProvider>
          <Router>
            <Toaster position="top-right" richColors closeButton />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/dashboard" element={<DashboardLayout><Dashboard /></DashboardLayout>} />
              <Route path="/mountpoints" element={<DashboardLayout><Mountpoints /></DashboardLayout>} />
              <Route path="/users" element={<DashboardLayout><Users /></DashboardLayout>} />
              <Route path="/statistics" element={<DashboardLayout><Statistics /></DashboardLayout>} />
              <Route path="/logs" element={<DashboardLayout><Logs /></DashboardLayout>} />
              <Route path="/configuration" element={<DashboardLayout><Configuration /></DashboardLayout>} />
              <Route path="/server-control" element={<DashboardLayout><ServerControl /></DashboardLayout>} />
              <Route path="/remote-servers" element={<DashboardLayout><RemoteServers /></DashboardLayout>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
