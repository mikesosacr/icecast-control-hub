
import DashboardLayout from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsCard } from "@/components/statistics/StatsCard";
import { Activity, BarChart, Radio, Users } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { MountPoint, Listener } from "@/types/icecast";

// Sample data
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

const mockListeners: Listener[] = [
  { id: "1", ip: "192.168.1.101", userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)", connectedAt: "2023-09-15T12:34:56", duration: 1523, mountpoint: "/stream" },
  { id: "2", ip: "192.168.1.102", userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)", connectedAt: "2023-09-15T12:36:12", duration: 1429, mountpoint: "/stream" },
  { id: "3", ip: "192.168.1.103", userAgent: "Mozilla/5.0 (Android 12; Mobile)", connectedAt: "2023-09-15T12:40:23", duration: 1156, mountpoint: "/high" },
  { id: "4", ip: "192.168.1.104", userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)", connectedAt: "2023-09-15T12:41:55", duration: 1074, mountpoint: "/stream" },
  { id: "5", ip: "192.168.1.105", userAgent: "VLC/3.0.16 LibVLC/3.0.16", connectedAt: "2023-09-15T12:45:32", duration: 865, mountpoint: "/high" },
  { id: "6", ip: "192.168.1.106", userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)", connectedAt: "2023-09-15T12:50:08", duration: 621, mountpoint: "/mobile" },
  { id: "7", ip: "192.168.1.107", userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)", connectedAt: "2023-09-15T12:53:41", duration: 498, mountpoint: "/stream" },
];

// Helper function for formatting duration
const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  
  let result = "";
  if (hours > 0) result += `${hours}h `;
  if (minutes > 0 || hours > 0) result += `${minutes}m `;
  result += `${remainingSeconds}s`;
  
  return result;
};

const Statistics = () => {
  const [selectedMountpoint, setSelectedMountpoint] = useState<string>("all");
  
  // Calculate total listeners
  const totalListeners = mockMountpoints.reduce(
    (sum, mp) => sum + mp.listeners.current, 0
  );

  // Calculate peak listeners
  const peakListeners = mockMountpoints.reduce(
    (max, mp) => Math.max(max, mp.listeners.peak), 0
  );

  // Calculate total bandwidth (assuming average bitrate per listener)
  const totalBandwidth = mockMountpoints.reduce(
    (sum, mp) => sum + (mp.listeners.current * mp.bitrate), 0
  );
  
  // Filter listeners based on selected mountpoint
  const filteredListeners = selectedMountpoint === "all" 
    ? mockListeners
    : mockListeners.filter(listener => listener.mountpoint === selectedMountpoint);

  return (
    <DashboardLayout>
      <PageHeader 
        heading="Statistics" 
        text="Track your server usage and listener activity"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard 
          title="Current Listeners"
          value={totalListeners}
          icon={<Users size={18} />}
          description="Across all mountpoints"
        />
        <StatsCard 
          title="Peak Listeners"
          value={peakListeners}
          icon={<Activity size={18} />}
          description="All-time high"
        />
        <StatsCard 
          title="Active Mountpoints"
          value={mockMountpoints.filter(mp => mp.status === "active").length}
          icon={<Radio size={18} />}
          description={`of ${mockMountpoints.length} total`}
        />
        <StatsCard 
          title="Total Bandwidth"
          value={`${(totalBandwidth / 1024).toFixed(2)} Mbps`}
          icon={<Activity size={18} />}
          description="Current usage"
        />
      </div>

      <Tabs defaultValue="listeners">
        <TabsList>
          <TabsTrigger value="listeners">Listeners</TabsTrigger>
          <TabsTrigger value="bandwidth">Bandwidth</TabsTrigger>
          <TabsTrigger value="history">Historical Data</TabsTrigger>
        </TabsList>
        
        <TabsContent value="listeners" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle>Current Listeners</CardTitle>
                  <CardDescription>Real-time list of connected listeners</CardDescription>
                </div>
                <div className="w-full md:w-[240px]">
                  <Select value={selectedMountpoint} onValueChange={setSelectedMountpoint}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select mountpoint" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All mountpoints</SelectItem>
                      {mockMountpoints.filter(mp => mp.status === "active").map(mp => (
                        <SelectItem key={mp.point} value={mp.point}>{mp.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredListeners.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>IP Address</TableHead>
                      <TableHead>Mountpoint</TableHead>
                      <TableHead>Connected</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>User Agent</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredListeners.map(listener => (
                      <TableRow key={listener.id}>
                        <TableCell className="font-mono">{listener.ip}</TableCell>
                        <TableCell>{listener.mountpoint}</TableCell>
                        <TableCell>{new Date(listener.connectedAt).toLocaleTimeString()}</TableCell>
                        <TableCell>{formatDuration(listener.duration)}</TableCell>
                        <TableCell className="max-w-[300px] truncate" title={listener.userAgent}>
                          {listener.userAgent}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  No active listeners for the selected mountpoint
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="bandwidth" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Bandwidth Usage</CardTitle>
              <CardDescription>Current and historical bandwidth consumption</CardDescription>
            </CardHeader>
            <CardContent className="min-h-[300px]">
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-muted-foreground">
                  <BarChart className="h-8 w-8 mx-auto mb-2" />
                  <p>Bandwidth charts will be displayed here</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="history" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Historical Data</CardTitle>
              <CardDescription>Long-term statistics and trends</CardDescription>
            </CardHeader>
            <CardContent className="min-h-[300px]">
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-muted-foreground">
                  <Activity className="h-8 w-8 mx-auto mb-2" />
                  <p>Historical statistics will be displayed here</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default Statistics;
