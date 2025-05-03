import DashboardLayout from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsCard } from "@/components/statistics/StatsCard";
import { Activity, Radio, Users, BarChart, Server } from "lucide-react";
import { Link } from "react-router-dom";
import { MountpointCard } from "@/components/mountpoints/MountpointCard";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useServerStats, useMountpoints, useMountpointMutations } from "@/hooks/useIcecastApi";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Helper functions
const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatDuration = (seconds: number): string => {
  const days = Math.floor(seconds / (3600 * 24));
  const hours = Math.floor((seconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  
  return parts.join(' ');
};

const Dashboard = () => {
  const { data: statsResponse, isLoading: statsLoading, error: statsError } = useServerStats();
  const { data: mountpointsResponse, isLoading: mountpointsLoading, error: mountpointsError } = useMountpoints();
  const { deleteMountpoint, toggleMountpointVisibility } = useMountpointMutations();

  const stats = statsResponse?.success ? statsResponse.data : null;
  const mountpoints = mountpointsResponse?.success ? mountpointsResponse.data || [] : [];

  const handleEdit = (id: string) => {
    // Navigate to edit page (to be implemented)
    console.log(`Edit mountpoint ${id}`);
  };

  const handleDelete = (id: string) => {
    deleteMountpoint({ mountpointId: id });
  };

  const handleToggleVisibility = (id: string, isPublic: boolean) => {
    toggleMountpointVisibility({ mountpointId: id, isPublic });
  };

  // Calculate totals
  const totalListeners = mountpoints.reduce(
    (sum, mp) => sum + mp.listeners.current, 0
  );

  const isLoading = statsLoading || mountpointsLoading;
  const error = statsError || mountpointsError;

  if (error) {
    return (
      <DashboardLayout>
        <PageHeader 
          heading="Dashboard" 
          text="Overview of your Icecast server status and performance"
        />
        <Alert variant="destructive">
          <AlertTitle>Error loading dashboard data</AlertTitle>
          <AlertDescription>
            {String(error)}
          </AlertDescription>
        </Alert>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageHeader 
        heading="Dashboard" 
        text="Overview of your Icecast server status and performance"
      >
        <Button asChild>
          <Link to="/mountpoints/new">Create Mountpoint</Link>
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard 
          title="Current Listeners"
          value={isLoading ? undefined : totalListeners}
          icon={<Users size={18} />}
          description="Across all mountpoints"
        />
        <StatsCard 
          title="Active Mountpoints"
          value={isLoading ? undefined : mountpoints.filter(mp => mp.status === "active").length}
          icon={<Radio size={18} />}
          description={isLoading ? undefined : `of ${mountpoints.length} total`}
        />
        <StatsCard 
          title="Outgoing Bandwidth"
          value={isLoading || !stats?.bandwidth ? undefined : formatBytes(stats.bandwidth.outgoing) + "/s"}
          icon={<Activity size={18} />}
          description="Current usage"
        />
        <StatsCard 
          title="Server Uptime"
          value={isLoading || !stats?.uptime ? undefined : formatDuration(stats.uptime)}
          icon={<Server size={18} />}
          description="Since last restart"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Server Resource Usage</CardTitle>
              <CardDescription>
                Current system resource utilization
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading || !stats ? (
                <div className="space-y-6">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">CPU Usage</span>
                      <span className="font-medium">{stats.cpu}%</span>
                    </div>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Progress value={stats.cpu} className="h-2" />
                        </TooltipTrigger>
                        <TooltipContent>
                          CPU: {stats.cpu}%
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Memory Usage</span>
                      <span className="font-medium">{formatBytes(stats.memory)}</span>
                    </div>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Progress value={(stats.memory / (512 * 1024 * 1024)) * 100} className="h-2" />
                        </TooltipTrigger>
                        <TooltipContent>
                          Memory: {formatBytes(stats.memory)}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Bandwidth Usage</span>
                      <span className="font-medium">{formatBytes(stats.bandwidth.outgoing)}/s</span>
                    </div>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Progress value={(stats.bandwidth.outgoing / (10 * 1024 * 1024)) * 100} className="h-2" />
                        </TooltipTrigger>
                        <TooltipContent>
                          Bandwidth: {formatBytes(stats.bandwidth.outgoing)}/s
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle>Active Listeners</CardTitle>
                <BarChart size={16} className="text-muted-foreground" />
              </div>
              <CardDescription>Listener trends over the past 24 hours</CardDescription>
            </CardHeader>
            <CardContent className="h-[220px] flex items-center justify-center">
              <div className="text-muted-foreground text-center p-6 border border-dashed rounded-md w-full">
                <p>Listener chart will be displayed here</p>
                <p className="text-sm">Data will be available when the history API is implemented</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Active Mountpoints</CardTitle>
              <CardDescription>
                Recent activity on your streams
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-40 w-full" />
                  <Skeleton className="h-40 w-full" />
                </div>
              ) : mountpoints.filter(mp => mp.status === "active").length > 0 ? (
                mountpoints
                  .filter(mp => mp.status === "active")
                  .slice(0, 2)
                  .map(mountpoint => (
                    <MountpointCard 
                      key={mountpoint.id} 
                      mountpoint={mountpoint} 
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onToggleVisibility={handleToggleVisibility}
                    />
                  ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No active mountpoints found
                </div>
              )}
            </CardContent>
            <CardFooter className="border-t pt-4">
              <Button variant="ghost" size="sm" className="w-full" asChild>
                <Link to="/mountpoints">View All Mountpoints</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Server Information</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading || !stats ? (
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ) : (
                <div className="space-y-3 text-sm">
                  <div className="grid grid-cols-2 gap-1">
                    <div className="text-muted-foreground">Version</div>
                    <div className="font-medium">Icecast {stats.version || "2.x"}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    <div className="text-muted-foreground">Total Connections</div>
                    <div className="font-medium">{stats.totalConnections?.toLocaleString() || "N/A"}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    <div className="text-muted-foreground">Current Connections</div>
                    <div className="font-medium">{stats.connections?.current || "N/A"}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    <div className="text-muted-foreground">Peak Connections</div>
                    <div className="font-medium">{stats.connections?.peak || "N/A"}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    <div className="text-muted-foreground">Incoming Bandwidth</div>
                    <div className="font-medium">{formatBytes(stats.bandwidth?.incoming || 0)}/s</div>
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    <div className="text-muted-foreground">Server Type</div>
                    <div className="font-medium">Local Instance</div>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="border-t pt-4">
              <Button variant="outline" size="sm" className="w-full" asChild>
                <Link to="/configuration">View Configuration</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
