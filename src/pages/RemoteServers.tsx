import { useState } from "react";
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

  const servers = serversResponse?.success ? serversResponse.data || [] : [];
  const localServer = servers.find(server => server.isLocal);
  const remoteServers = servers.filter(server => !server.isLocal);

  const handleEdit = (id: string) => {
    const server = servers.find(s => s.id === id);
    if (server) setEditingServer(server);
  };

  const handleDelete = (id: string) => {
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
    } catch {
      toast.error("Failed to refresh server statuses");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSubmitServer = (data: ServerFormData) => {
    if (editingServer) {
      updateServer({ serverId: editingServer.id, server: data });
      setEditingServer(null);
    } else {
      addServer({
        name: data.name,
        host: data.host,
        port: data.port,
        adminUsername: data.adminUsername,
        adminPassword: data.adminPassword,
        isLocal: data.isLocal,
      });
      setShowAddModal(false);
    }
  };

  return (
    <>
      <PageHeader heading="Server Management" text="Manage your Icecast server instances">
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefreshStatus} disabled={isRefreshing}>
            <RefreshCw className={cn("mr-1 h-4 w-4", isRefreshing && "animate-spin")} />
            <span>{isRefreshing ? "Refreshing..." : "Refresh Status"}</span>
          </Button>
          <Button onClick={() => setShowAddModal(true)}>
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
            <Button variant="outline" size="sm" onClick={handleRefreshStatus} className="ml-2" disabled={isRefreshing}>
              Try Again
            </Button>
          </AlertDescription>
        </Alert>
      ) : isLoading ? (
        <div className="space-y-6">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-1/3 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent className="py-4">
                <div className="space-y-2">
                  {[...Array(4)].map((_, j) => (
                    <Skeleton key={j} className="h-4 w-full" />
                  ))}
                </div>
              </CardContent>
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
            {servers.length > 0 ? servers.map((server) => (
              <ServerCard key={server.id} server={server} onEdit={handleEdit} onDelete={handleDelete} />
            )) : (
              <EmptyState icon={<Server className="h-10 w-10 text-muted-foreground mb-4" />} title="No Servers Found" description="You haven't added any servers yet" onAdd={() => setShowAddModal(true)} />
            )}
          </TabsContent>
          
          <TabsContent value="local" className="mt-6">
            {localServer ? (
              <ServerCard server={localServer} onEdit={handleEdit} onDelete={handleDelete} />
            ) : (
              <EmptyState icon={<Server className="h-10 w-10 text-muted-foreground mb-4" />} title="No Local Server" description="The local Icecast server is not configured" />
            )}
          </TabsContent>
          
          <TabsContent value="remote" className="mt-6 space-y-6">
            {remoteServers.length > 0 ? remoteServers.map((server) => (
              <ServerCard key={server.id} server={server} onEdit={handleEdit} onDelete={handleDelete} />
            )) : (
              <EmptyState icon={<Globe className="h-10 w-10 text-muted-foreground mb-4" />} title="No Remote Servers" description="You haven't added any remote servers yet" onAdd={() => setShowAddModal(true)} />
            )}
          </TabsContent>
        </Tabs>
      )}

      <AddEditServerModal
        open={showAddModal || !!editingServer}
        onOpenChange={(open) => { if (!open) { setShowAddModal(false); setEditingServer(null); } }}
        server={editingServer}
        onSubmit={handleSubmitServer}
        isLoading={isAdding || isUpdating}
      />

      <AlertDialog open={!!deletingServerId} onOpenChange={() => setDeletingServerId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Server</AlertDialogTitle>
            <AlertDialogDescription>Are you sure? This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={isDeleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {isDeleting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Deleting...</> : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

const EmptyState = ({ icon, title, description, onAdd }: { icon: React.ReactNode; title: string; description: string; onAdd?: () => void }) => (
  <div className="flex flex-col items-center justify-center min-h-[200px] bg-muted/30 rounded-md border border-dashed p-8 text-center">
    {icon}
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    <p className="text-muted-foreground mb-4">{description}</p>
    {onAdd && (
      <Button onClick={onAdd}>
        <Plus className="mr-1 h-4 w-4" />
        <span>Add Server</span>
      </Button>
    )}
  </div>
);

const ServerCard = ({ server, onEdit, onDelete }: { server: IcecastServer; onEdit: (id: string) => void; onDelete: (id: string) => void }) => {
  const statusColor = server.status === 'online' ? 'bg-green-500 hover:bg-green-500/90' : server.status === 'warning' ? 'bg-yellow-500 hover:bg-yellow-500/90' : 'bg-destructive hover:bg-destructive/90';
  const statusLabel = server.status === 'online' ? 'Online' : server.status === 'warning' ? 'Warning' : 'Offline';
  const borderColor = server.status === 'online' ? 'border-green-500' : server.status === 'warning' ? 'border-yellow-500' : 'border-destructive';

  return (
    <Card className="overflow-hidden">
      <CardHeader className={cn("pb-2 border-l-4", borderColor)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-full">
              {server.isLocal ? <Server size={14} className="text-primary" /> : <Globe size={14} className="text-primary" />}
            </div>
            <CardTitle>{server.name}</CardTitle>
          </div>
          <Badge className={cn(statusColor)}>{statusLabel}</Badge>
        </div>
        <CardDescription>{server.host}:{server.port} • {server.isLocal ? "Local Instance" : "Remote Server"}</CardDescription>
      </CardHeader>
      <CardContent className="py-4">
        <div className="grid grid-cols-2 gap-y-2 text-sm">
          <div className="text-muted-foreground">Host</div>
          <div className="font-medium">{server.host}</div>
          <div className="text-muted-foreground">Port</div>
          <div className="font-medium">{server.port}</div>
          <div className="text-muted-foreground">Admin</div>
          <div className="font-medium">{server.adminUsername}</div>
        </div>
      </CardContent>
      <CardFooter className="border-t bg-muted/30 pt-3">
        <div className="flex justify-between w-full">
          <Button variant="outline" size="sm" asChild>
            <a href={`http://${server.host}:${server.port}`} target="_blank" rel="noopener noreferrer">Open Admin</a>
          </Button>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => onEdit(server.id)}>
              <Edit size={16} />
            </Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive" onClick={() => onDelete(server.id)} disabled={server.isLocal}>
              <Trash size={16} />
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default RemoteServers;
