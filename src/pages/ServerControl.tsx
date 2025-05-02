
import DashboardLayout from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw, Server, Info, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { ServerStatus } from "@/types/icecast";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Mock server data
const serverInfo = {
  name: "Local Icecast",
  version: "2.4.4",
  startTime: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
  status: "running" as ServerStatus,
};

const ServerControl = () => {
  const [isRestarting, setIsRestarting] = useState(false);
  const [serverData, setServerData] = useState(serverInfo);
  
  const formatUptime = (startTime: Date): string => {
    const now = new Date();
    const diff = now.getTime() - startTime.getTime();
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    const parts = [];
    if (days > 0) parts.push(`${days} day${days > 1 ? 's' : ''}`);
    if (hours > 0) parts.push(`${hours} hour${hours > 1 ? 's' : ''}`);
    if (minutes > 0) parts.push(`${minutes} minute${minutes > 1 ? 's' : ''}`);
    
    return parts.join(', ');
  };

  const handleRestart = async () => {
    setIsRestarting(true);
    
    // Simulate server restart
    try {
      // In a real implementation, this would be an API call to restart the server
      toast.info("Restarting Icecast server...");
      
      // Simulate the restart delay
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Update server data
      setServerData({
        ...serverData,
        startTime: new Date(),
      });
      
      toast.success("Icecast server restarted successfully");
    } catch (error) {
      toast.error("Failed to restart Icecast server");
    } finally {
      setIsRestarting(false);
    }
  };

  const handleStop = async () => {
    try {
      // In a real implementation, this would be an API call to stop the server
      toast.info("Stopping Icecast server...");
      
      // Simulate the stop delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update server data
      setServerData({
        ...serverData,
        status: "stopped",
      });
      
      toast.success("Icecast server stopped successfully");
    } catch (error) {
      toast.error("Failed to stop Icecast server");
    }
  };

  const handleStart = async () => {
    try {
      // In a real implementation, this would be an API call to start the server
      toast.info("Starting Icecast server...");
      
      // Simulate the start delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update server data
      setServerData({
        ...serverData,
        status: "running",
        startTime: new Date(),
      });
      
      toast.success("Icecast server started successfully");
    } catch (error) {
      toast.error("Failed to start Icecast server");
    }
  };

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
            <div className="flex items-center justify-between mb-4">
              <span className="text-muted-foreground">Status:</span>
              <Badge 
                variant={serverData.status === "running" ? "default" : "destructive"}
                className={cn(
                  serverData.status === "running" && "bg-green-500 hover:bg-green-500/90"
                )}
              >
                {serverData.status === "running" ? "Running" : "Stopped"}
              </Badge>
            </div>
            {serverData.status === "running" && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Uptime:</span>
                <span>{formatUptime(serverData.startTime)}</span>
              </div>
            )}
          </CardContent>
          <CardFooter>
            {serverData.status === "running" ? (
              <Button onClick={handleStop} variant="destructive" className="w-full">
                Stop Server
              </Button>
            ) : (
              <Button onClick={handleStart} variant="default" className="w-full">
                Start Server
              </Button>
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
            <Button 
              onClick={handleRestart} 
              disabled={isRestarting || serverData.status !== "running"} 
              className="w-full"
            >
              {isRestarting ? "Restarting..." : "Restart Server"}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Server Information</CardTitle>
            <CardDescription>Details about your Icecast instance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Server:</span>
                <span>{serverData.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Version:</span>
                <span>{serverData.version}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Type:</span>
                <span>Local Instance</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Started:</span>
                <span>{serverData.startTime.toLocaleString()}</span>
              </div>
            </div>
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
                      <Button variant="outline" size="sm" disabled={isRestarting}>Standard Restart</Button>
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
                      <Button variant="destructive" size="sm" disabled={isRestarting}>Force Restart</Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-lg font-medium mb-2">Service Status</h3>
              <div className="p-4 border rounded-md">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Service Status</div>
                    <div className="font-medium">
                      <Badge 
                        variant={serverData.status === "running" ? "default" : "destructive"}
                        className={cn(
                          serverData.status === "running" && "bg-green-500 hover:bg-green-500/90"
                        )}
                      >
                        {serverData.status === "running" ? "Running" : "Stopped"}
                      </Badge>
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Process ID</div>
                    <div className="font-medium">
                      {serverData.status === "running" ? "12345" : "N/A"}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Service Type</div>
                    <div className="font-medium">systemd</div>
                  </div>
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-medium">Server Logs</h3>
                <Button variant="outline" size="sm">View Full Logs</Button>
              </div>
              <div className="p-4 border rounded-md bg-muted/30">
                <pre className="text-xs font-mono text-muted-foreground overflow-auto max-h-[200px]">
                  {`[2023-09-15 12:30:00] INFO: Server started
[2023-09-15 12:32:15] INFO: Source client connected: /stream
[2023-09-15 12:32:16] INFO: Mountpoint /stream active
[2023-09-15 12:34:21] INFO: New client connection from 192.168.1.101
[2023-09-15 12:35:30] INFO: New client connection from 192.168.1.102`}
                </pre>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default ServerControl;
