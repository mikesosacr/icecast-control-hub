
import { Users, Activity, Radio } from "lucide-react";
import { StatsCard } from "@/components/statistics/StatsCard";
import { MountPoint } from "@/types/icecast";

interface StatsSummaryProps {
  totalListeners: number;
  peakListeners: number;
  activeMountpoints: number;
  totalMountpoints: number;
  totalBandwidth: number;
  isLoading: boolean;
}

export function StatsSummary({
  totalListeners,
  peakListeners,
  activeMountpoints,
  totalMountpoints,
  totalBandwidth,
  isLoading
}: StatsSummaryProps) {
  return (
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
        value={isLoading ? undefined : activeMountpoints}
        icon={<Radio size={18} />}
        description={isLoading ? undefined : `of ${totalMountpoints} total`}
      />
      <StatsCard 
        title="Total Bandwidth"
        value={isLoading ? undefined : `${(totalBandwidth / 1024).toFixed(2)} Mbps`}
        icon={<Activity size={18} />}
        description="Current usage"
      />
    </div>
  );
}
