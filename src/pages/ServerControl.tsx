
import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw, Server, AlertTriangle } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useServerStats, useServerStatus, useServerControl } from "@/hooks/useIcecastApi";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const ServerControl = () => {
  const { data: statusData, isLoading: statusLoading, error: statusError, refetch: refetchStatus } = useServerStatus();
  const { data: statsData, isLoading: statsLoading, error: statsError } = useServerStats();
  const { startServer, stopServer, restartServer, isStarting, isStopping, isRestarting } = useServerControl();

  const serverStatus = statusData?.success ? statusData.data?.status : 'stopped';
  const serverStats = statsData?.success ? statsData.data : undefined;
  
  const formatUptime = (seconds: number): string => {
    if (!seconds) return "N/A";
    
    const days = Math.floor(seconds / (60 * 60 * 24));
    const hours = Math.floor((seconds % (60 * 60 * 24)) / (60 * 60));
    const minutes = Math.floor((seconds % (60 * 60)) / 60);
    
    const parts = [];
    if (days > 0) parts.push(`${days} day${days > 1 ? 's' : ''}`);
    if (hours > 0) parts.push(`${hours} hour${hours > 1 ? 's' : ''}`);
    if (minutes > 0) parts.push(`${minutes} minute${minutes > 1 ? 's' : ''}`);
    
    return parts.length > 0 ? parts.join(', ') : "Less than a minute";
  };

  const handleRestart = async () => {
    restartServer('local');
    setTimeout(() => {
      refetchStatus();
    }, 3000);
  };

  const handleStop = async () => {
    stopServer('local');
    setTimeout(() => {
      refetchStatus();
    }, 2000);
  };

  const handleStart = async () => {
    startServer('local');
    setTimeout(() => {
      refetchStatus();
    }, 2000);
  };

  const isLoading = statusLoading || statsLoading;
  const error = statusError || statsError;

  if (error) {
    return (
      <DashboardLayout>
        <PageHeader 
          heading="Server Control" 
          text="Manage and control your Icecast server instance"
        />
        <Alert variant="destructive">
          <AlertTitle>Error loading server data</AlertTitle>
          <AlertDescription>{String(error)}</AlertDescription>
        </Alert>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageHeader 
        heading="Server Control" 
        text="Manage and control your Icecast server instance"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Server Status</CardTitle>
            <CardDescription>Current status of your Icecast server</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge 
                    variant={serverStatus === "running" ? "default" : "destructive"}
                    className={cn(
                      serverStatus === "running" && "bg-green-500 hover:bg-green-500/90"
                    )}
                  >
                    {serverStatus === "running" ? "Running" : "Stopped"}
                  </Badge>
                </div>
                {serverStatus === "running" && serverStats && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Uptime:</span>
                    <span>{formatUptime(serverStats.uptime)}</span>
                  </div>
                )}
              </>
            )}
          </CardContent>
          <CardFooter>
            {isLoading ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              serverStatus === "running" ? (
                <Button onClick={handleStop} variant="destructive" className="w-full" disabled={isStopping}>
                  {isStopping ? "Stopping..." : "Stop Server"}
                </Button>
              ) : (
                <Button onClick={handleStart} variant="default" className="w-full" disabled={isStarting}>
                  {isStarting ? "Starting..." : "Start Server"}
                </Button>
              )
            )}
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Restart Server</CardTitle>
            <CardDescription>Restart your Icecast server instance</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center pt-4">
            <RefreshCw size={48} className="text-muted-foreground" />
          </CardContent>
          <CardFooter>
            {isLoading ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Button 
                onClick={handleRestart} 
                disabled={isRestarting || serverStatus !== "running"} 
                className="w-full"
              >
                {isRestarting ? "Restarting..." : "Restart Server"}
              </Button>
            )}
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Server Information</CardTitle>
            <CardDescription>Details about your Icecast instance</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Server:</span>
                  <span>Icecast2</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Version:</span>
                  <span>{serverStats?.version || "Unknown"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Type:</span>
                  <span>Local Instance</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Connections:</span>
                  <span>{serverStats ? serverStats.connections.current : "N/A"}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Service Management</CardTitle>
          <CardDescription>Detailed server control and advanced options</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Restart Options</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-md">
                  <div className="flex items-start mb-3">
                    <RefreshCw className="mr-2 h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-medium">Standard Restart</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Restart the server gracefully, allowing connected clients to finish their streams.
                      </p>
                      <Button variant="outline" size="sm" disabled={isRestarting || serverStatus !== "running"} onClick={handleRestart}>
                        Standard Restart
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 border rounded-md">
                  <div className="flex items-start mb-3">
                    <AlertTriangle className="mr-2 h-5 w-5 text-destructive mt-0.5" />
                    <div>
                      <h4 className="font-medium">Force Restart</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Immediately restart the server, disconnecting all clients.
                      </p>
                      <Button variant="destructive" size="sm" disabled={isRestarting || serverStatus !== "running"} onClick={handleRestart}>
                        Force Restart
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-lg font-medium mb-2">Service Status</h3>
              <div className="p-4 border rounded-md">
                {isLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Service Status</div>
                      <div className="font-medium">
                        <Badge 
                          variant={serverStatus === "running" ? "default" : "destructive"}
                          className={cn(
                            serverStatus === "running" && "bg-green-500 hover:bg-green-500/90"
                          )}
                        >
                          {serverStatus === "running" ? "Running" : "Stopped"}
                        </Badge>
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Total Connections</div>
                      <div className="font-medium">
                        {serverStats ? serverStats.totalConnections : "N/A"}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Service Type</div>
                      <div className="font-medium">systemd</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <Separator />
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-medium">Server Logs</h3>
                <Button variant="outline" size="sm" onClick={() => window.location.href = "/logs"}>View Full Logs</Button>
              </div>
              <div className="p-4 border rounded-md bg-muted/30">
                {isLoading ? (
                  <Skeleton className="h-[200px] w-full" />
                ) : (
                  <pre className="text-xs font-mono text-muted-foreground overflow-auto max-h-[200px]">
                    {serverStatus === "running" ? 
                      `[System] Icecast server is running
[System] Version: ${serverStats?.version || "Unknown"}
[System] Uptime: ${formatUptime(serverStats?.uptime || 0)}
[System] Current connections: ${serverStats?.connections.current || 0}
[System] Peak connections: ${serverStats?.connections.peak || 0}` :
                      "[System] Icecast server is currently stopped"
                    }
                  </pre>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default ServerControl;
