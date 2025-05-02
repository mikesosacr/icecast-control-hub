
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Mountpoints from "./pages/Mountpoints";
import Users from "./pages/Users";
import Statistics from "./pages/Statistics";
import Logs from "./pages/Logs";
import Configuration from "./pages/Configuration";
import ServerControl from "./pages/ServerControl";
import RemoteServers from "./pages/RemoteServers";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/mountpoints" element={<Mountpoints />} />
          <Route path="/users" element={<Users />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="/logs" element={<Logs />} />
          <Route path="/configuration" element={<Configuration />} />
          <Route path="/restart" element={<ServerControl />} />
          <Route path="/server/local" element={<ServerControl />} />
          <Route path="/server/remote" element={<RemoteServers />} />
          <Route path="/settings" element={<Configuration />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
