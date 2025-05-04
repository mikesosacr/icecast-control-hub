
import { 
  SidebarContent, 
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  Sidebar,
  SidebarTrigger,
  SidebarFooter,
  useSidebar
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { 
  Home, 
  Radio, 
  Users, 
  Activity, 
  FileText, 
  Settings,
  RefreshCw, 
  Server, 
  Globe,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function AppSidebar() {
  const location = useLocation();
  const [serverStatus, setServerStatus] = useState<'online' | 'offline' | 'warning'>('online');
  const { open, setOpen, toggleSidebar } = useSidebar();
  
  const navigationItems = [
    {
      title: "Dashboard",
      path: "/dashboard",
      icon: Home,
    },
    {
      title: "Mountpoints",
      path: "/mountpoints",
      icon: Radio,
    },
    {
      title: "Users",
      path: "/users",
      icon: Users,
    },
    {
      title: "Statistics",
      path: "/statistics",
      icon: Activity,
    },
    {
      title: "Logs",
      path: "/logs",
      icon: FileText,
    },
    {
      title: "Configuration",
      path: "/configuration",
      icon: Settings,
    },
  ];

  const serverManagementItems = [
    {
      title: "Server Control",
      path: "/server-control",
      icon: RefreshCw,
    },
    {
      title: "Remote Servers",
      path: "/remote-servers", 
      icon: Globe,
    },
  ];

  return (
    <Sidebar variant="sidebar" side="left" collapsible="icon">
      <SidebarHeader className="px-6 py-3 flex items-center gap-2 relative">
        <div className="relative h-8 w-8 mr-1">
          <div className="h-full w-full bg-white rounded-md flex items-center justify-center">
            <svg 
              className="h-6 w-6"
              viewBox="0 0 50 50" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                d="M25 5C14.5 5 6 13.5 6 24V45H18V24C18 20.1 21.1 17 25 17C28.9 17 32 20.1 32 24V45H44V24C44 13.5 35.5 5 25 5Z" 
                fill="#0077CC" 
              />
              <path 
                d="M36 28C33.8 28 32 29.8 32 32V45H40V32C40 29.8 38.2 28 36 28Z" 
                fill="#33A3FF" 
              />
              <path 
                d="M14 28C11.8 28 10 29.8 10 32V45H18V32C18 29.8 16.2 28 14 28Z" 
                fill="#33A3FF" 
              />
            </svg>
          </div>
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-sidebar-foreground text-lg">Icecast</span>
          <span className="text-sidebar-foreground/70 text-xs">Control Hub</span>
        </div>
        
        {/* Toggle button for sidebar */}
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-2 top-1/2 -translate-y-1/2 ml-auto hidden md:flex"
          onClick={toggleSidebar}
          aria-label={open ? "Colapsar menú" : "Expandir menú"}
        >
          {open ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </Button>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <div className="px-4 py-2.5">
            <div className="flex items-center gap-2 px-2">
              <div className={cn(
                "h-2 w-2 rounded-full",
                serverStatus === "online" && "bg-green-500",
                serverStatus === "offline" && "bg-red-500",
                serverStatus === "warning" && "bg-yellow-500"
              )}/>
              <span className="text-sidebar-foreground/80 text-sm">
                Server Status:
              </span>
              <Badge variant={serverStatus === "online" ? "default" : serverStatus === "warning" ? "outline" : "destructive"}>
                {serverStatus === "online" ? "Online" : serverStatus === "warning" ? "Warning" : "Offline"}
              </Badge>
            </div>
          </div>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location.pathname === item.path}
                    tooltip={item.title}
                  >
                    <Link to={item.path} className="flex items-center gap-2 w-full">
                      <item.icon className="h-5 w-5 shrink-0" />
                      <span className="text-sm font-medium">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Server Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {serverManagementItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location.pathname === item.path}
                    tooltip={item.title}
                  >
                    <Link to={item.path} className="flex items-center gap-2 w-full">
                      <item.icon className="h-5 w-5 shrink-0" />
                      <span className="text-sm font-medium">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="px-6 py-3">
        <div className="flex items-center justify-between text-sidebar-foreground/60 text-xs">
          <span>IcecastAdmin v1.0.0</span>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
