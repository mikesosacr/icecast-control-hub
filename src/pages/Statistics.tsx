
import { useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsCard } from "@/components/statistics/StatsCard";
import { Activity, BarChart, Radio, Users } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useServerStats, useListeners, useMountpoints } from "@/hooks/useIcecastApi";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ErrorAlert } from "@/components/configuration/ErrorAlert";
import { ConfigurationLoadingState } from "@/components/configuration/LoadingState";
import { Listener } from "@/types/icecast";

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
  
  const { data: statsData, isLoading: statsLoading, error: statsError } = useServerStats();
  const { data: mountpointsData, isLoading: mountpointsLoading, error: mountpointsError } = useMountpoints();
  const { data: listenersData, isLoading: listenersLoading, error: listenersError } = useListeners();

  // Calculate stats from real data
  const totalListeners = mountpointsData?.success 
    ? mountpointsData.data?.reduce((sum, mp) => sum + mp.listeners.current, 0) || 0
    : 0;

  const peakListeners = mountpointsData?.success
    ? mountpointsData.data?.reduce((max, mp) => Math.max(max, mp.listeners.peak), 0) || 0
    : 0;

  const totalBandwidth = mountpointsData?.success
    ? mountpointsData.data?.reduce((sum, mp) => sum + (mp.listeners.current * mp.bitrate), 0) || 0
    : 0;
  
  // Fix the filtering of listeners
  const filteredListeners = listenersData?.success && listenersData.data
    ? selectedMountpoint === "all" 
      ? listenersData.data 
      : listenersData.data.filter((listener: Listener) => listener.mountpoint === selectedMountpoint)
    : [];

  // Handle loading and error states
  const isLoading = statsLoading || mountpointsLoading || listenersLoading;
  const hasError = statsError || mountpointsError || listenersError;

  if (hasError) {
    return (
      <>
        <PageHeader 
          heading="Statistics" 
          text="Track your server usage and listener activity"
        />
        <Alert variant="destructive">
          <AlertTitle>Error loading statistics</AlertTitle>
          <AlertDescription>
            {String(statsError || mountpointsError || listenersError || "Failed to load data. Please check your connection.")}
          </AlertDescription>
        </Alert>
      </>
    );
  }

  return (
    <>
      <PageHeader 
        heading="Statistics" 
        text="Track your server usage and listener activity"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard 
          title="Current Listeners"
          value={isLoading ? undefined : totalListeners}
          icon={<Users size={18} />}
          description="Across all mountpoints"
        />
        <StatsCard 
          title="Peak Listeners"
          value={isLoading ? undefined : peakListeners}
          icon={<Activity size={18} />}
          description="All-time high"
        />
        <StatsCard 
          title="Active Mountpoints"
          value={isLoading 
            ? undefined
            : (mountpointsData?.success 
              ? (mountpointsData.data || []).filter(mp => mp.status === "active").length 
              : 0)
          }
          icon={<Radio size={18} />}
          description={isLoading 
            ? undefined 
            : `of ${mountpointsData?.success ? (mountpointsData.data || []).length : 0} total`
          }
        />
        <StatsCard 
          title="Total Bandwidth"
          value={isLoading 
            ? undefined
            : `${(totalBandwidth / 1024).toFixed(2)} Mbps`
          }
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
                  <Select 
                    value={selectedMountpoint} 
                    onValueChange={setSelectedMountpoint} 
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select mountpoint" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All mountpoints</SelectItem>
                      {mountpointsData?.success && mountpointsData.data?.filter(mp => mp.status === "active").map(mp => (
                        <SelectItem key={mp.point} value={mp.point}>{mp.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : filteredListeners.length > 0 ? (
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
                  <p>Bandwidth chart visualization will be added in a future update</p>
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
                  <p>Historical statistics will be added in a future update</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
};

export default Statistics;
