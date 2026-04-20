import React, { useState } from 'react';
import { Toaster } from "@/components/ui/sonner";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
  MenubarSeparator
} from "@/components/ui/menubar";
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
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
  HelpCircle,
  Bell
} from "lucide-react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { SidebarTrigger } from "@/components/ui/sidebar/sidebar-trigger";
import { cn } from "@/lib/utils";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { useNotifications } from "@/hooks/useNotifications";

const DashboardLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [bellOpen, setBellOpen] = useState(false);
  const { count: notifCount, items: notifItems } = useNotifications();

  const isActive = (path: string) => location.pathname === path;

  return (
    <SidebarProvider>
    <div className="flex min-h-screen w-full bg-background">
      <AppSidebar />
      <div className="flex-1 flex flex-col">
        <div className="border-b sticky top-0 bg-background/95 backdrop-blur-sm z-10 shadow-sm">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center h-14">
              <div className="flex items-center gap-2">
              <SidebarTrigger className="md:hidden" />
              <Menubar className="border-none px-0 bg-transparent">
                <MenubarMenu>
                  <MenubarTrigger className={cn("text-sm rounded-md px-3 py-1","data-[state=open]:bg-secondary")}>Archivo</MenubarTrigger>
                  <MenubarContent>
                    <MenubarItem asChild className="flex gap-2 items-center">
                      <Link to="/dashboard"><LayoutDashboard size={16} /> Dashboard</Link>
                    </MenubarItem>
                    <MenubarItem asChild className="flex gap-2 items-center">
                      <Link to="/configuration"><Settings size={16} /> Configuración</Link>
                    </MenubarItem>
                  </MenubarContent>
                </MenubarMenu>
                <MenubarMenu>
                  <MenubarTrigger className={cn("text-sm rounded-md px-3 py-1","data-[state=open]:bg-secondary")}>Ver</MenubarTrigger>
                  <MenubarContent>
                    <MenubarItem asChild className="flex gap-2 items-center">
                      <Link to="/mountpoints"><Radio size={16} /> Puntos de montaje</Link>
                    </MenubarItem>
                    <MenubarItem asChild className="flex gap-2 items-center">
                      <Link to="/statistics"><Activity size={16} /> Estadísticas</Link>
                    </MenubarItem>
                    <MenubarItem asChild className="flex gap-2 items-center">
                      <Link to="/logs"><FileText size={16} /> Registros</Link>
                    </MenubarItem>
                  </MenubarContent>
                </MenubarMenu>
                <MenubarMenu>
                  <MenubarTrigger className={cn("text-sm rounded-md px-3 py-1","data-[state=open]:bg-secondary")}>Sistema</MenubarTrigger>
                  <MenubarContent>
                    <MenubarItem asChild className="flex gap-2 items-center">
                      <Link to="/server-control"><RefreshCw size={16} /> Control de servidor</Link>
                    </MenubarItem>
                    <MenubarItem asChild className="flex gap-2 items-center">
                      <Link to="/remote-servers"><Globe size={16} /> Servidores remotos</Link>
                    </MenubarItem>
                  </MenubarContent>
                </MenubarMenu>
                <MenubarMenu>
                  <MenubarTrigger className={cn("text-sm rounded-md px-3 py-1","data-[state=open]:bg-secondary")}>Herramientas</MenubarTrigger>
                  <MenubarContent>
                    <MenubarItem asChild className="flex gap-2 items-center">
                      <Link to="/my-station/players"><Headphones size={16} /> Generador de Reproductores IA</Link>
                    </MenubarItem>
                    <MenubarItem asChild className="flex gap-2 items-center">
                      <Link to="/users"><Users size={16} /> Gestionar usuarios</Link>
                    </MenubarItem>
                  </MenubarContent>
                </MenubarMenu>
                <MenubarMenu>
                  <MenubarTrigger className={cn("text-sm rounded-md px-3 py-1","data-[state=open]:bg-secondary")}>Ayuda</MenubarTrigger>
                  <MenubarContent>
                    <MenubarItem asChild className="flex gap-2 items-center">
                      <Link to="/"><HelpCircle size={16} /> Inicio</Link>
                    </MenubarItem>
                    <MenubarSeparator />
                    <MenubarItem className="flex gap-2 items-center" onClick={() => window.open('https://github.com/mikesosacr/icecast-control-hub', '_blank')}>
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23 3.297 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" /></svg>
                      GitHub
                    </MenubarItem>
                  </MenubarContent>
                </MenubarMenu>
              </Menubar>
              </div>

              <div className="flex items-center gap-2">
                {/* Bell */}
                <div className="relative">
                  <button
                    onClick={() => setBellOpen(o => !o)}
                    className="relative p-2 rounded-md hover:bg-secondary transition-colors"
                  >
                    <Bell className="h-5 w-5 text-muted-foreground" />
                    {notifCount > 0 && (
                      <span className="absolute top-1 right-1 bg-red-500 text-white text-xs font-bold rounded-full h-4 min-w-4 flex items-center justify-center px-1 leading-none">
                        {notifCount > 99 ? '99+' : notifCount}
                      </span>
                    )}
                  </button>
                  {bellOpen && (
                    <div className="absolute right-0 top-full mt-1 w-80 bg-background border rounded-lg shadow-lg z-50 overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-3 border-b">
                        <span className="font-semibold text-sm">Solicitudes pendientes</span>
                        {notifCount > 0 && (
                          <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">{notifCount}</span>
                        )}
                      </div>
                      {notifItems.length === 0 ? (
                        <div className="px-4 py-6 text-center text-sm text-muted-foreground">Sin solicitudes pendientes</div>
                      ) : (
                        <div className="divide-y max-h-72 overflow-y-auto">
                          {notifItems.map((item: any) => (
                            <div key={item.id}
                              className="px-4 py-3 hover:bg-secondary/50 cursor-pointer transition-colors"
                              onClick={() => { navigate('/service-requests'); setBellOpen(false); }}>
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${item.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'}`}>
                                  {item.status === 'pending' ? 'Nuevo' : 'Pago pendiente'}
                                </span>
                              </div>
                              <p className="text-sm font-medium text-foreground truncate">{item.radioName || item.username}</p>
                              <p className="text-xs text-muted-foreground">{item.plan} · {item.email}</p>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="border-t px-4 py-2.5">
                        <button
                          onClick={() => { navigate('/service-requests'); setBellOpen(false); }}
                          className="text-xs text-primary hover:underline font-medium w-full text-center">
                          Ver todas las solicitudes →
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <ModeToggle />
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 md:p-6 flex-1">
          <div className="container mx-auto max-w-7xl">
            <Outlet />
          </div>
        </div>
        <Toaster position="top-right" richColors closeButton />
      </div>
    </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
