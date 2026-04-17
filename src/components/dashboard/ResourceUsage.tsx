
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatBytes } from "@/utils/formatters";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart } from "lucide-react";

interface ServerStats {
  cpu: number;
  memory: number;
  bandwidth: {
    incoming: number;
    outgoing: number;
  };
}

interface ResourceUsageProps {
  stats: ServerStats | null;
  isLoading: boolean;
}

export const ResourceUsage = ({ stats, isLoading }: ResourceUsageProps) => {
  return (
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
  );
};
