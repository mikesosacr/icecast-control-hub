
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Listener, MountPoint } from "@/types/icecast";
import { formatDuration } from "@/utils/formatters";

interface ListenersTableProps {
  listeners: Listener[];
  mountpoints: MountPoint[] | undefined;
  isLoading: boolean;
}

export function ListenersTable({ listeners, mountpoints, isLoading }: ListenersTableProps) {
  const [selectedMountpoint, setSelectedMountpoint] = useState<string>("all");
  
  // Filter listeners based on selected mountpoint
  const filteredListeners = selectedMountpoint === "all" 
    ? listeners 
    : listeners.filter((listener) => listener.mountpoint === selectedMountpoint);

  return (
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
                {mountpoints?.filter(mp => mp.status === "active").map(mp => (
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
  );
}
