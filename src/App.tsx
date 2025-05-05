
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/components/ui/theme-provider';
import { TooltipProvider } from '@/components/ui/tooltip';
import { SidebarProvider } from '@/components/ui/sidebar';
import Dashboard from '@/pages/Dashboard';
import Mountpoints from '@/pages/Mountpoints';
import NewMountpoint from '@/pages/NewMountpoint';
import Users from '@/pages/Users';
import Statistics from '@/pages/Statistics';
import Logs from '@/pages/Logs';
import Configuration from '@/pages/Configuration';
import ServerControl from '@/pages/ServerControl';
import RemoteServers from '@/pages/RemoteServers';
import AIRadioPlayerGenerator from '@/pages/AIRadioPlayerGenerator';
import Index from '@/pages/Index';
import NotFound from '@/pages/NotFound';
import { queryClient } from '@/lib/react-query';
import DashboardLayout from '@/components/layout/DashboardLayout';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="icecast-ui-theme">
        <TooltipProvider>
          <SidebarProvider>
            <Router>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/" element={<DashboardLayout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/mountpoints" element={<Mountpoints />} />
                  <Route path="/mountpoints/new" element={<NewMountpoint />} />
                  <Route path="/users" element={<Users />} />
                  <Route path="/statistics" element={<Statistics />} />
                  <Route path="/logs" element={<Logs />} />
                  <Route path="/configuration" element={<Configuration />} />
                  <Route path="/server-control" element={<ServerControl />} />
                  <Route path="/remote-servers" element={<RemoteServers />} />
                  <Route path="/ai-radio-player" element={<AIRadioPlayerGenerator />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Router>
          </SidebarProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
