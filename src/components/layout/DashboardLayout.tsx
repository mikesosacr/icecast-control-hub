
import React from 'react';
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
    <div className="min-h-screen flex flex-col w-full bg-background">
      <div className="border-b sticky top-0 bg-background z-10">
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
              <MenubarTrigger>Herramientas</MenubarTrigger>
              <MenubarContent>
                <MenubarItem asChild>
                  <Link to="/ai-radio-player">Generador de Reproductores IA</Link>
                </MenubarItem>
                <MenubarItem asChild>
                  <Link to="/users">Gestionar usuarios</Link>
                </MenubarItem>
              </MenubarContent>
            </MenubarMenu>
            <MenubarMenu>
              <MenubarTrigger>Ayuda</MenubarTrigger>
              <MenubarContent>
                <MenubarItem asChild>
                  <Link to="/">Inicio</Link>
                </MenubarItem>
                <MenubarItem onClick={() => window.open('https://github.com/YOUR-USERNAME/YOUR-REPO', '_blank')}>
                  GitHub
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
      <Toaster position="top-right" richColors closeButton />
    </div>
  );
};

export default DashboardLayout;
