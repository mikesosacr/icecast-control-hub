
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatBytes } from "@/utils/formatters";

interface ServerStats {
  version?: string;
  connections?: {
    current: number;
    peak: number;
  };
  totalConnections?: number;
  bandwidth?: {
    incoming: number;
    outgoing: number;
  };
}

interface ServerInfoProps {
  stats: ServerStats | null;
  isLoading: boolean;
}

export const ServerInfo = ({ stats, isLoading }: ServerInfoProps) => {
  return (
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
  );
};
