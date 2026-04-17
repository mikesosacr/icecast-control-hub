
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useServerStats, useListeners, useMountpoints } from "@/hooks/useIcecastApi";

import { StatisticsHeader } from "@/components/statistics/StatisticsHeader";
import { StatsSummary } from "@/components/statistics/StatsSummary";
import { ListenersTable } from "@/components/statistics/ListenersTable";
import { BandwidthChart } from "@/components/statistics/BandwidthChart";
import { HistoricalDataChart } from "@/components/statistics/HistoricalDataChart";

const Statistics = () => {
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
  
  const activeMountpoints = mountpointsData?.success 
    ? (mountpointsData.data || []).filter(mp => mp.status === "active").length 
    : 0;
    
  const totalMountpoints = mountpointsData?.success 
    ? (mountpointsData.data || []).length 
    : 0;

  // Handle loading and error states
  const isLoading = statsLoading || mountpointsLoading || listenersLoading;
  const hasError = statsError || mountpointsError || listenersError;

  // Ensure listeners data is an array of Listener objects
  const listeners = listenersData?.success && Array.isArray(listenersData.data) 
    ? listenersData.data 
    : [];

  if (hasError) {
    return (
      <>
        <StatisticsHeader />
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
      <StatisticsHeader />

      <StatsSummary 
        totalListeners={totalListeners}
        peakListeners={peakListeners}
        activeMountpoints={activeMountpoints}
        totalMountpoints={totalMountpoints}
        totalBandwidth={totalBandwidth}
        isLoading={isLoading}
      />

      <Tabs defaultValue="listeners">
        <TabsList>
          <TabsTrigger value="listeners">Listeners</TabsTrigger>
          <TabsTrigger value="bandwidth">Bandwidth</TabsTrigger>
          <TabsTrigger value="history">Historical Data</TabsTrigger>
        </TabsList>
        
        <TabsContent value="listeners" className="mt-6">
          <ListenersTable 
            listeners={listeners} 
            mountpoints={mountpointsData?.success ? mountpointsData.data : undefined}
            isLoading={isLoading}
          />
        </TabsContent>
        
        <TabsContent value="bandwidth" className="mt-6">
          <BandwidthChart />
        </TabsContent>
        
        <TabsContent value="history" className="mt-6">
          <HistoricalDataChart />
        </TabsContent>
      </Tabs>
    </>
  );
};

export default Statistics;
