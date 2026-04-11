
import { 
  SidebarContent, 
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  Sidebar,
  SidebarFooter
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
  Globe
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useServerStats } from "@/hooks/useIcecastApi";

export function AppSidebar() {
  const location = useLocation();
  const { data: statsData } = useServerStats();
  
  const serverStatus = statsData?.success ? 'online' : 'offline';
  
  const navigationItems = [
    { title: "Dashboard", path: "/dashboard", icon: Home },
    { title: "Mountpoints", path: "/mountpoints", icon: Radio },
    { title: "Users", path: "/users", icon: Users },
    { title: "Statistics", path: "/statistics", icon: Activity },
    { title: "Logs", path: "/logs", icon: FileText },
    { title: "Configuration", path: "/configuration", icon: Settings },
  ];

  const serverManagementItems = [
    { title: "Server Control", path: "/server-control", icon: RefreshCw },
    { title: "Remote Servers", path: "/remote-servers", icon: Globe },
  ];

  const MenuItem = ({ item, isActive }: { item: typeof navigationItems[0], isActive: boolean }) => (
    <Link 
      to={item.path}
      className={cn(
        "flex items-center gap-3 w-full px-3 py-2 rounded-md transition-all duration-200 group",
        "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        isActive && "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
      )}
    >
      <item.icon className={cn(
        "h-5 w-5 shrink-0 transition-colors",
        "text-sidebar-foreground group-hover:text-sidebar-accent-foreground",
        isActive && "text-sidebar-accent-foreground"
      )} />
      <span className="text-sm font-medium">{item.title}</span>
    </Link>
  );

  return (
    <Sidebar variant="sidebar" side="left" collapsible="offcanvas">
      <SidebarHeader className="px-6 py-3 flex items-center gap-2">
        <div className="relative h-8 w-8 mr-1">
          <div className="h-full w-full bg-background rounded-md flex items-center justify-center">
            <svg className="h-6 w-6" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M25 5C14.5 5 6 13.5 6 24V45H18V24C18 20.1 21.1 17 25 17C28.9 17 32 20.1 32 24V45H44V24C44 13.5 35.5 5 25 5Z" fill="hsl(var(--primary))" />
              <path d="M36 28C33.8 28 32 29.8 32 32V45H40V32C40 29.8 38.2 28 36 28Z" fill="hsl(var(--primary) / 0.6)" />
              <path d="M14 28C11.8 28 10 29.8 10 32V45H18V32C18 29.8 16.2 28 14 28Z" fill="hsl(var(--primary) / 0.6)" />
            </svg>
          </div>
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-sidebar-foreground text-lg">Icecast</span>
          <span className="text-sidebar-foreground/80 text-xs">Control Hub</span>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <div className="px-4 py-2.5">
            <div className="flex items-center gap-2 px-2">
              <div className={cn(
                "h-2 w-2 rounded-full",
                serverStatus === "online" ? "bg-green-500" : "bg-destructive"
              )}/>
              <span className="text-sidebar-foreground text-sm">Server:</span>
              <Badge variant={serverStatus === "online" ? "default" : "destructive"}>
                {serverStatus === "online" ? "Online" : "Offline"}
              </Badge>
            </div>
          </div>
          
          <SidebarGroupLabel className="text-sidebar-foreground/80 text-xs font-semibold uppercase tracking-wider px-4 mb-2">
            Navigation
          </SidebarGroupLabel>
          
          <SidebarGroupContent>
            <div className="space-y-1 px-2">
              {navigationItems.map((item) => (
                <MenuItem key={item.path} item={item} isActive={location.pathname === item.path} />
              ))}
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/80 text-xs font-semibold uppercase tracking-wider px-4 mb-2">
            Server Management
          </SidebarGroupLabel>
          
          <SidebarGroupContent>
            <div className="space-y-1 px-2">
              {serverManagementItems.map((item) => (
                <MenuItem key={item.path} item={item} isActive={location.pathname === item.path} />
              ))}
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="px-6 py-3">
        <div className="flex items-center justify-between text-sidebar-foreground/80 text-xs">
          <span>IcecastAdmin v1.0.0</span>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
