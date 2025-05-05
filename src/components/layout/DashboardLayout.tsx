import React from 'react';
import { Toaster } from "@/components/ui/sonner";
import { 
  Menubar, 
  MenubarContent, 
  MenubarItem, 
  MenubarMenu, 
  MenubarTrigger,
  MenubarSeparator
} from "@/components/ui/menubar";
import { Link, Outlet, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Radio, 
  Users, 
  Activity, 
  FileText, 
  Settings, 
  RefreshCw, 
  Globe, 
  Headphones, 
  HelpCircle 
} from "lucide-react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { cn } from "@/lib/utils";
import { ModeToggle } from "@/components/ui/mode-toggle";

const DashboardLayout = () => {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Sidebar */}
      <AppSidebar />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Navigation */}
        <div className="border-b sticky top-0 bg-background/95 backdrop-blur-sm z-10 shadow-sm">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center h-14">
              <Menubar className="border-none px-0 bg-transparent">
                <MenubarMenu>
                  <MenubarTrigger className={cn(
                    "text-sm rounded-md px-3 py-1",
                    "data-[state=open]:bg-secondary"
                  )}>Archivo</MenubarTrigger>
                  <MenubarContent>
                    <MenubarItem asChild className="flex gap-2 items-center">
                      <Link to="/dashboard">
                        <LayoutDashboard size={16} /> Dashboard
                      </Link>
                    </MenubarItem>
                    <MenubarItem asChild className="flex gap-2 items-center">
                      <Link to="/configuration">
                        <Settings size={16} /> Configuración
                      </Link>
                    </MenubarItem>
                  </MenubarContent>
                </MenubarMenu>
                <MenubarMenu>
                  <MenubarTrigger className={cn(
                    "text-sm rounded-md px-3 py-1",
                    "data-[state=open]:bg-secondary"
                  )}>Ver</MenubarTrigger>
                  <MenubarContent>
                    <MenubarItem asChild className="flex gap-2 items-center">
                      <Link to="/mountpoints">
                        <Radio size={16} /> Puntos de montaje
                      </Link>
                    </MenubarItem>
                    <MenubarItem asChild className="flex gap-2 items-center">
                      <Link to="/statistics">
                        <Activity size={16} /> Estadísticas
                      </Link>
                    </MenubarItem>
                    <MenubarItem asChild className="flex gap-2 items-center">
                      <Link to="/logs">
                        <FileText size={16} /> Registros
                      </Link>
                    </MenubarItem>
                  </MenubarContent>
                </MenubarMenu>
                <MenubarMenu>
                  <MenubarTrigger className={cn(
                    "text-sm rounded-md px-3 py-1",
                    "data-[state=open]:bg-secondary"
                  )}>Sistema</MenubarTrigger>
                  <MenubarContent>
                    <MenubarItem asChild className="flex gap-2 items-center">
                      <Link to="/server-control">
                        <RefreshCw size={16} /> Control de servidor
                      </Link>
                    </MenubarItem>
                    <MenubarItem asChild className="flex gap-2 items-center">
                      <Link to="/remote-servers">
                        <Globe size={16} /> Servidores remotos
                      </Link>
                    </MenubarItem>
                  </MenubarContent>
                </MenubarMenu>
                <MenubarMenu>
                  <MenubarTrigger className={cn(
                    "text-sm rounded-md px-3 py-1",
                    "data-[state=open]:bg-secondary"
                  )}>Herramientas</MenubarTrigger>
                  <MenubarContent>
                    <MenubarItem asChild className="flex gap-2 items-center">
                      <Link to="/ai-radio-player">
                        <Headphones size={16} /> Generador de Reproductores IA
                      </Link>
                    </MenubarItem>
                    <MenubarItem asChild className="flex gap-2 items-center">
                      <Link to="/users">
                        <Users size={16} /> Gestionar usuarios
                      </Link>
                    </MenubarItem>
                  </MenubarContent>
                </MenubarMenu>
                <MenubarMenu>
                  <MenubarTrigger className={cn(
                    "text-sm rounded-md px-3 py-1",
                    "data-[state=open]:bg-secondary"
                  )}>Ayuda</MenubarTrigger>
                  <MenubarContent>
                    <MenubarItem asChild className="flex gap-2 items-center">
                      <Link to="/">
                        <HelpCircle size={16} /> Inicio
                      </Link>
                    </MenubarItem>
                    <MenubarSeparator />
                    <MenubarItem className="flex gap-2 items-center" onClick={() => window.open('https://github.com/mikesosacr/icecast-control-hub', '_blank')}>
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23 3.297 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                      </svg>
                      GitHub
                    </MenubarItem>
                  </MenubarContent>
                </MenubarMenu>
              </Menubar>
              
              {/* Right side elements */}
              <div className="flex items-center gap-2">
                <ModeToggle />
              </div>
            </div>
          </div>
        </div>
        
        {/* Page Content */}
        <div className="p-4 md:p-6 flex-1">
          <div className="container mx-auto max-w-7xl">
            <Outlet />
          </div>
        </div>
        <Toaster position="top-right" richColors closeButton />
      </div>
    </div>
  );
};

export default DashboardLayout;
