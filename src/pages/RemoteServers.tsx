
import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { IcecastServer } from "@/types/icecast";
import { Plus, Edit, Trash, Globe, Server, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Sample data
const mockServers: IcecastServer[] = [
  {
    id: "local",
    name: "Local Server",
    host: "localhost",
    port: 8000,
    adminUsername: "admin",
    adminPassword: "hackme",
    isLocal: true,
    status: "online",
  },
  {
    id: "remote1",
    name: "Production Server",
    host: "icecast.example.com",
    port: 8000,
    adminUsername: "admin",
    adminPassword: "******",
    isLocal: false,
    status: "online",
  },
  {
    id: "remote2",
    name: "Backup Server",
    host: "backup.example.com",
    port: 8000,
    adminUsername: "admin",
    adminPassword: "******",
    isLocal: false,
    status: "offline",
  },
  {
    id: "remote3",
    name: "Test Server",
    host: "test.example.com",
    port: 8000,
    adminUsername: "admin",
    adminPassword: "******",
    isLocal: false,
    status: "warning",
  },
];

const RemoteServers = () => {
  const [servers, setServers] = useState<IcecastServer[]>(mockServers);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleEdit = (id: string) => {
    console.log(`Edit server ${id}`);
    // Implement edit server logic
  };

  const handleDelete = (id: string) => {
    console.log(`Delete server ${id}`);
    
    // Don't delete the local server
    if (id === "local") {
      toast.error("Cannot delete local server");
      return;
    }
    
    // Remove the server from the list
    setServers(servers.filter(server => server.id !== id));
    toast.success("Server removed successfully");
  };

  const handleRefreshStatus = () => {
    setIsRefreshing(true);
    
    // Simulate refreshing server statuses
    setTimeout(() => {
      toast.success("Server statuses refreshed");
      setIsRefreshing(false);
    }, 2000);
  };

  // Filter servers by type
  const localServer = servers.find(server => server.isLocal);
  const remoteServers = servers.filter(server => !server.isLocal);

  return (
    <DashboardLayout>
      <PageHeader 
        heading="Server Management" 
        text="Manage your Icecast server instances"
      >
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefreshStatus} disabled={isRefreshing}>
            <RefreshCw className={cn("mr-1 h-4 w-4", isRefreshing && "animate-spin")} />
            <span>{isRefreshing ? "Refreshing..." : "Refresh Status"}</span>
          </Button>
          <Button>
            <Plus className="mr-1 h-4 w-4" />
            <span>Add Server</span>
          </Button>
        </div>
      </PageHeader>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Servers</TabsTrigger>
          <TabsTrigger value="local">Local Server</TabsTrigger>
          <TabsTrigger value="remote">Remote Servers</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-6 space-y-6">
          {servers.map((server) => (
            <ServerCard
              key={server.id}
              server={server}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </TabsContent>
        
        <TabsContent value="local" className="mt-6">
          {localServer && (
            <ServerCard
              server={localServer}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </TabsContent>
        
        <TabsContent value="remote" className="mt-6 space-y-6">
          {remoteServers.length > 0 ? (
            remoteServers.map((server) => (
              <ServerCard
                key={server.id}
                server={server}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[200px] bg-muted/30 rounded-md border border-dashed p-8 text-center">
              <Globe className="h-10 w-10 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Remote Servers</h3>
              <p className="text-muted-foreground mb-4">
                You haven't added any remote servers yet
              </p>
              <Button>
                <Plus className="mr-1 h-4 w-4" />
                <span>Add Remote Server</span>
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

interface ServerCardProps {
  server: IcecastServer;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const ServerCard = ({ server, onEdit, onDelete }: ServerCardProps) => {
  const getStatusColor = (status: 'online' | 'offline' | 'warning') => {
    switch (status) {
      case 'online':
        return 'bg-green-500 hover:bg-green-500/90';
      case 'offline':
        return 'bg-destructive hover:bg-destructive/90';
      case 'warning':
        return 'bg-yellow-500 hover:bg-yellow-500/90';
    }
  };

  const getStatusLabel = (status: 'online' | 'offline' | 'warning') => {
    switch (status) {
      case 'online':
        return 'Online';
      case 'offline':
        return 'Offline';
      case 'warning':
        return 'Warning';
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className={cn(
        "pb-2",
        server.status === 'online' 
          ? "border-l-4 border-green-500" 
          : server.status === 'warning'
          ? "border-l-4 border-yellow-500"
          : "border-l-4 border-destructive"
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-full">
              {server.isLocal ? (
                <Server size={14} className="text-primary" />
              ) : (
                <Globe size={14} className="text-primary" />
              )}
            </div>
            <CardTitle>{server.name}</CardTitle>
          </div>
          <div>
            <Badge className={cn(getStatusColor(server.status))}>
              {getStatusLabel(server.status)}
            </Badge>
          </div>
        </div>
        <CardDescription className="flex items-center gap-1">
          <span>{server.host}:{server.port}</span>
          <span className="text-muted-foreground">•</span>
          <span>{server.isLocal ? "Local Instance" : "Remote Server"}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="py-4">
        <div className="grid grid-cols-2 gap-y-2 text-sm">
          <div className="text-muted-foreground">Status</div>
          <div className="font-medium">{getStatusLabel(server.status)}</div>
          
          <div className="text-muted-foreground">Host</div>
          <div className="font-medium">{server.host}</div>
          
          <div className="text-muted-foreground">Port</div>
          <div className="font-medium">{server.port}</div>
          
          <div className="text-muted-foreground">Admin Username</div>
          <div className="font-medium">{server.adminUsername}</div>
          
          <div className="text-muted-foreground">Admin Password</div>
          <div className="font-medium">••••••••</div>
        </div>
      </CardContent>
      <CardFooter className="border-t bg-muted/30 pt-3">
        <div className="flex justify-between w-full">
          <Button variant="outline" size="sm" asChild>
            <a href={`http://${server.host}:${server.port}`} target="_blank" rel="noopener noreferrer">
              Open Admin
            </a>
          </Button>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" onClick={() => onEdit(server.id)}>
              <Edit size={16} />
              <span className="sr-only">Edit</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className={cn(
                "text-muted-foreground hover:text-destructive",
                server.isLocal && "opacity-50 cursor-not-allowed"
              )} 
              onClick={() => onDelete(server.id)}
              disabled={server.isLocal}
            >
              <Trash size={16} />
              <span className="sr-only">Delete</span>
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default RemoteServers;
