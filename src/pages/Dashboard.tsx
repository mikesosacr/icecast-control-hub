
import DashboardLayout from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { StatsCard } from "@/components/statistics/StatsCard";
import { Activity, Radio, Users, Server } from "lucide-react";
import { Link } from "react-router-dom";
import { useServerStats, useMountpoints, useMountpointMutations } from "@/hooks/useIcecastApi";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ResourceUsage } from "@/components/dashboard/ResourceUsage";
import { ServerInfo } from "@/components/dashboard/ServerInfo";
import { ActiveMountpoints } from "@/components/dashboard/ActiveMountpoints";
import { formatBytes, formatDuration } from "@/utils/formatters";

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
        <ResourceUsage stats={stats} isLoading={isLoading} />
        <div className="space-y-6">
          <ActiveMountpoints 
            mountpoints={mountpoints}
            isLoading={isLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleVisibility={handleToggleVisibility}
          />
          <ServerInfo stats={stats} isLoading={isLoading} />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
