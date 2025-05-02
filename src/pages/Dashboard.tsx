
import DashboardLayout from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsCard } from "@/components/statistics/StatsCard";
import { Activity, Radio, Users, BarChart, Server } from "lucide-react";
import { useEffect, useState } from "react";
import { ServerStats, MountPoint } from "@/types/icecast";
import { MountpointCard } from "@/components/mountpoints/MountpointCard";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Link } from "react-router-dom";

// Sample data (to be replaced with API calls)
const mockStats: ServerStats = {
  uptime: 2592000, // 30 days in seconds
  totalConnections: 15783,
  connections: {
    current: 145,
    peak: 356,
  },
  bandwidth: {
    incoming: 512000, // 500 KB/s
    outgoing: 5242880, // 5 MB/s
  },
  cpu: 12.5,
  memory: 134217728, // 128 MB
};

const mockMountpoints: MountPoint[] = [
  {
    id: "1",
    name: "Main Stream",
    point: "/stream",
    type: "audio/mpeg",
    bitrate: 128,
    description: "Main radio stream",
    genre: "Various",
    streamUrl: "http://example.com/stream",
    listeners: {
      current: 87,
      peak: 156,
    },
    streamUser: "source",
    streamPassword: "hackme",
    isPublic: true,
    status: "active",
  },
  {
    id: "2",
    name: "High Quality",
    point: "/high",
    type: "audio/aac",
    bitrate: 256,
    description: "High quality AAC stream",
    genre: "Electronic",
    streamUrl: "http://example.com/high",
    listeners: {
      current: 52,
      peak: 124,
    },
    streamUser: "source2",
    streamPassword: "hackme2",
    isPublic: true,
    status: "active",
  },
  {
    id: "3",
    name: "Low Bandwidth",
    point: "/mobile",
    type: "audio/mpeg",
    bitrate: 64,
    description: "Low bandwidth stream for mobile",
    genre: "Talk",
    streamUrl: "http://example.com/mobile",
    listeners: {
      current: 6,
      peak: 76,
    },
    streamUser: "source3",
    streamPassword: "hackme3",
    isPublic: false,
    status: "inactive",
  },
];

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
  const [stats, setStats] = useState<ServerStats>(mockStats);
  const [mountpoints, setMountpoints] = useState<MountPoint[]>(mockMountpoints);

  const handleEdit = (id: string) => {
    // Implement edit logic
    console.log(`Edit mountpoint ${id}`);
  };

  const handleDelete = (id: string) => {
    // Implement delete logic
    console.log(`Delete mountpoint ${id}`);
  };

  const handleToggleVisibility = (id: string, isPublic: boolean) => {
    // Implement visibility toggle logic
    console.log(`Toggle visibility of ${id} to ${isPublic}`);
    setMountpoints(
      mountpoints.map(mp => 
        mp.id === id ? { ...mp, isPublic } : mp
      )
    );
  };

  // Calculate totals
  const totalListeners = mountpoints.reduce(
    (sum, mp) => sum + mp.listeners.current, 0
  );

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
          value={totalListeners}
          icon={<Users size={18} />}
          description="Across all mountpoints"
          trend="up"
          trendValue="12%"
        />
        <StatsCard 
          title="Active Mountpoints"
          value={mountpoints.filter(mp => mp.status === "active").length}
          icon={<Radio size={18} />}
          description={`of ${mountpoints.length} total`}
        />
        <StatsCard 
          title="Outgoing Bandwidth"
          value={formatBytes(stats.bandwidth.outgoing) + "/s"}
          icon={<Activity size={18} />}
          trend="up"
          trendValue="3.2%"
          description="Current usage"
        />
        <StatsCard 
          title="Server Uptime"
          value={formatDuration(stats.uptime)}
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
                        <Progress value={60} className="h-2" />
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
                        <Progress value={45} className="h-2" />
                      </TooltipTrigger>
                      <TooltipContent>
                        Bandwidth: {formatBytes(stats.bandwidth.outgoing)}/s
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
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
                <p className="text-sm">Showing hourly listener counts for all mountpoints</p>
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
              {mountpoints
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
                ))}
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
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-1">
                  <div className="text-muted-foreground">Version</div>
                  <div className="font-medium">Icecast 2.4.4</div>
                </div>
                <div className="grid grid-cols-2 gap-1">
                  <div className="text-muted-foreground">Total Connections</div>
                  <div className="font-medium">{stats.totalConnections.toLocaleString()}</div>
                </div>
                <div className="grid grid-cols-2 gap-1">
                  <div className="text-muted-foreground">Current Connections</div>
                  <div className="font-medium">{stats.connections.current}</div>
                </div>
                <div className="grid grid-cols-2 gap-1">
                  <div className="text-muted-foreground">Peak Connections</div>
                  <div className="font-medium">{stats.connections.peak}</div>
                </div>
                <div className="grid grid-cols-2 gap-1">
                  <div className="text-muted-foreground">Incoming Bandwidth</div>
                  <div className="font-medium">{formatBytes(stats.bandwidth.incoming)}/s</div>
                </div>
                <div className="grid grid-cols-2 gap-1">
                  <div className="text-muted-foreground">Server Type</div>
                  <div className="font-medium">Local Instance</div>
                </div>
              </div>
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
