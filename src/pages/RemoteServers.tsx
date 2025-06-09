import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { IcecastServer } from "@/types/icecast";
import { Plus, Edit, Trash, Globe, Server, RefreshCw, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useServers, useServerMutations } from "@/hooks/useIcecastApi";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AddEditServerModal, ServerFormData } from "@/components/servers/AddEditServerModal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const RemoteServers = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingServer, setEditingServer] = useState<IcecastServer | null>(null);
  const [deletingServerId, setDeletingServerId] = useState<string | null>(null);
  
  const { data: serversResponse, isLoading, error, refetch } = useServers();
  const { addServer, updateServer, deleteServer, isAdding, isUpdating, isDeleting } = useServerMutations();

  const handleEdit = (id: string) => {
    console.log(`Edit server ${id}`);
    const server = servers.find(s => s.id === id);
    if (server) {
      setEditingServer(server);
    }
  };

  const handleDelete = (id: string) => {
    console.log(`Delete server ${id}`);
    
    // Don't delete the local server
    if (id === "local") {
      toast.error("Cannot delete local server");
      return;
    }
    
    setDeletingServerId(id);
  };

  const confirmDelete = () => {
    if (deletingServerId) {
      deleteServer(deletingServerId);
      setDeletingServerId(null);
    }
  };

  const handleRefreshStatus = async () => {
    setIsRefreshing(true);
    
    try {
      await refetch();
      toast.success("Server statuses refreshed");
    } catch (error) {
      toast.error("Failed to refresh server statuses");
      console.error("Error refreshing server statuses:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Get servers from API response
  const servers = serversResponse?.success ? serversResponse.data || [] : [];

  // Filter servers by type
  const localServer = servers.find(server => server.isLocal);
  const remoteServers = servers.filter(server => !server.isLocal);

  const handleAddServer = () => {
    setShowAddModal(true);
  };

  const handleSubmitServer = (data: ServerFormData) => {
    if (editingServer) {
      // Update existing server
      updateServer({
        serverId: editingServer.id,
        server: data
      });
      setEditingServer(null);
    } else {
      // Add new server - ensure all required fields are present
      const serverData: Omit<IcecastServer, 'id' | 'status'> = {
        name: data.name,
        host: data.host,
        port: data.port,
        adminUsername: data.adminUsername,
        adminPassword: data.adminPassword,
        isLocal: data.isLocal
      };
      addServer(serverData);
      setShowAddModal(false);
    }
  };

  const isModalLoading = isAdding || isUpdating;

  return (
    <>
      <PageHeader 
        heading="Server Management" 
        text="Manage your Icecast server instances"
      >
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefreshStatus} disabled={isRefreshing}>
            <RefreshCw className={cn("mr-1 h-4 w-4", isRefreshing && "animate-spin")} />
            <span>{isRefreshing ? "Refreshing..." : "Refresh Status"}</span>
          </Button>
          <Button onClick={handleAddServer}>
            <Plus className="mr-1 h-4 w-4" />
            <span>Add Server</span>
          </Button>
        </div>
      </PageHeader>

      {error ? (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {String(error)}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefreshStatus} 
              className="ml-2"
              disabled={isRefreshing}
            >
              Try Again
            </Button>
          </AlertDescription>
        </Alert>
      ) : isLoading ? (
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-1/3 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent className="py-4">
                <div className="grid grid-cols-2 gap-y-2">
                  {[...Array(5)].map((_, j) => (
                    <div key={j} className="col-span-2 flex justify-between">
                      <Skeleton className="h-4 w-1/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="border-t bg-muted/30 pt-3">
                <div className="flex justify-between w-full">
                  <Skeleton className="h-8 w-24" />
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                  </div>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All Servers</TabsTrigger>
            <TabsTrigger value="local">Local Server</TabsTrigger>
            <TabsTrigger value="remote">Remote Servers</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-6 space-y-6">
            {servers.length > 0 ? (
              servers.map((server) => (
                <ServerCard
                  key={server.id}
                  server={server}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center min-h-[200px] bg-muted/30 rounded-md border border-dashed p-8 text-center">
                <Server className="h-10 w-10 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Servers Found</h3>
                <p className="text-muted-foreground mb-4">
                  You haven't added any servers yet
                </p>
                <Button onClick={handleAddServer}>
                  <Plus className="mr-1 h-4 w-4" />
                  <span>Add Server</span>
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="local" className="mt-6">
            {localServer ? (
              <ServerCard
                server={localServer}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ) : (
              <div className="flex flex-col items-center justify-center min-h-[200px] bg-muted/30 rounded-md border border-dashed p-8 text-center">
                <Server className="h-10 w-10 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Local Server</h3>
                <p className="text-muted-foreground mb-4">
                  The local Icecast server is not configured
                </p>
              </div>
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
                <Button onClick={handleAddServer}>
                  <Plus className="mr-1 h-4 w-4" />
                  <span>Add Remote Server</span>
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}

      {/* Add/Edit Server Modal */}
      <AddEditServerModal
        open={showAddModal || !!editingServer}
        onOpenChange={(open) => {
          if (!open) {
            setShowAddModal(false);
            setEditingServer(null);
          }
        }}
        server={editingServer}
        onSubmit={handleSubmitServer}
        isLoading={isModalLoading}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingServerId} onOpenChange={() => setDeletingServerId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Server</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this server? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
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
