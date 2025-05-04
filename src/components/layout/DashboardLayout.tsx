
import React from 'react';
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Toaster } from "@/components/ui/sonner";
import { 
  Menubar, 
  MenubarContent, 
  MenubarItem, 
  MenubarMenu, 
  MenubarTrigger 
} from "@/components/ui/menubar";
import { Link, Outlet } from 'react-router-dom';

const DashboardLayout = () => {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <div className="border-b">
            <div className="container mx-auto px-4">
              <Menubar className="border-none px-0">
                <MenubarMenu>
                  <MenubarTrigger>Archivo</MenubarTrigger>
                  <MenubarContent>
                    <MenubarItem asChild>
                      <Link to="/dashboard">Dashboard</Link>
                    </MenubarItem>
                    <MenubarItem asChild>
                      <Link to="/configuration">Configuración</Link>
                    </MenubarItem>
                  </MenubarContent>
                </MenubarMenu>
                <MenubarMenu>
                  <MenubarTrigger>Ver</MenubarTrigger>
                  <MenubarContent>
                    <MenubarItem asChild>
                      <Link to="/mountpoints">Puntos de montaje</Link>
                    </MenubarItem>
                    <MenubarItem asChild>
                      <Link to="/statistics">Estadísticas</Link>
                    </MenubarItem>
                    <MenubarItem asChild>
                      <Link to="/logs">Registros</Link>
                    </MenubarItem>
                  </MenubarContent>
                </MenubarMenu>
                <MenubarMenu>
                  <MenubarTrigger>Sistema</MenubarTrigger>
                  <MenubarContent>
                    <MenubarItem asChild>
                      <Link to="/server-control">Control de servidor</Link>
                    </MenubarItem>
                    <MenubarItem asChild>
                      <Link to="/remote-servers">Servidores remotos</Link>
                    </MenubarItem>
                  </MenubarContent>
                </MenubarMenu>
                <MenubarMenu>
                  <MenubarTrigger>Usuarios</MenubarTrigger>
                  <MenubarContent>
                    <MenubarItem asChild>
                      <Link to="/users">Gestionar usuarios</Link>
                    </MenubarItem>
                  </MenubarContent>
                </MenubarMenu>
              </Menubar>
            </div>
          </div>
          <div className="p-4 md:p-6 flex-1">
            <div className="container mx-auto max-w-7xl">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
      <Toaster />
    </SidebarProvider>
  );
};

export default DashboardLayout;
