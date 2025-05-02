
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/components/ui/theme-provider';
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

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="icecast-ui-theme">
        <Router>
          <Toaster position="top-right" richColors closeButton />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/mountpoints" element={<Mountpoints />} />
            <Route path="/users" element={<Users />} />
            <Route path="/statistics" element={<Statistics />} />
            <Route path="/logs" element={<Logs />} />
            <Route path="/configuration" element={<Configuration />} />
            <Route path="/server-control" element={<ServerControl />} />
            <Route path="/remote-servers" element={<RemoteServers />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
