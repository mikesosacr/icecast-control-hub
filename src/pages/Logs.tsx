
import DashboardLayout from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogEntry } from "@/types/icecast";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { RefreshCw } from "lucide-react";

// Sample log data
const mockLogs: LogEntry[] = [
  { id: "1", timestamp: "2023-09-15T12:30:00", level: "info", message: "Server started", source: "system" },
  { id: "2", timestamp: "2023-09-15T12:32:15", level: "info", message: "Source client connected: /stream", source: "connection" },
  { id: "3", timestamp: "2023-09-15T12:32:16", level: "info", message: "Mountpoint /stream active", source: "stream" },
  { id: "4", timestamp: "2023-09-15T12:34:21", level: "info", message: "New client connection from 192.168.1.101", source: "connection" },
  { id: "5", timestamp: "2023-09-15T12:35:30", level: "info", message: "New client connection from 192.168.1.102", source: "connection" },
  { id: "6", timestamp: "2023-09-15T12:37:45", level: "info", message: "Source client connected: /high", source: "connection" },
  { id: "7", timestamp: "2023-09-15T12:37:46", level: "info", message: "Mountpoint /high active", source: "stream" },
  { id: "8", timestamp: "2023-09-15T12:40:10", level: "warning", message: "Client 192.168.1.102 timed out", source: "connection" },
  { id: "9", timestamp: "2023-09-15T12:42:18", level: "info", message: "New client connection from 192.168.1.103", source: "connection" },
  { id: "10", timestamp: "2023-09-15T12:46:22", level: "error", message: "Failed to read from source: /mobile", source: "stream" },
  { id: "11", timestamp: "2023-09-15T12:46:23", level: "error", message: "Source client disconnected: /mobile", source: "connection" },
  { id: "12", timestamp: "2023-09-15T12:46:24", level: "info", message: "Mountpoint /mobile inactive", source: "stream" },
  { id: "13", timestamp: "2023-09-15T12:50:00", level: "warning", message: "High CPU usage: 85%", source: "system" },
  { id: "14", timestamp: "2023-09-15T12:52:10", level: "info", message: "New client connection from 192.168.1.104", source: "connection" },
  { id: "15", timestamp: "2023-09-15T12:55:45", level: "info", message: "New client connection from 192.168.1.105", source: "connection" },
];

const Logs = () => {
  const [logs] = useState<LogEntry[]>(mockLogs);
  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState<"all" | "info" | "warning" | "error">("all");
  const [sourceFilter, setSourceFilter] = useState<"all" | "connection" | "stream" | "system">("all");

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.message.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = levelFilter === "all" || log.level === levelFilter;
    const matchesSource = sourceFilter === "all" || log.source === sourceFilter;
    
    return matchesSearch && matchesLevel && matchesSource;
  });

  const handleRefresh = () => {
    console.log("Refreshing logs...");
    // In a real implementation, this would fetch the latest logs from the server
  };

  const getBadgeVariant = (level: "info" | "warning" | "error") => {
    switch (level) {
      case "info":
        return "default";
      case "warning":
        return "outline";
      case "error":
        return "destructive";
    }
  };

  const getSourceClass = (source: string) => {
    switch (source) {
      case "connection":
        return "text-blue-600";
      case "stream":
        return "text-green-600";
      case "system":
        return "text-purple-600";
      default:
        return "text-foreground";
    }
  };

  return (
    <DashboardLayout>
      <PageHeader 
        heading="System Logs" 
        text="View and analyze server logs"
      >
        <Button variant="outline" onClick={handleRefresh}>
          <RefreshCw className="mr-1 h-4 w-4" />
          <span>Refresh Logs</span>
        </Button>
      </PageHeader>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Log Viewer</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Select value={levelFilter} onValueChange={(value: "all" | "info" | "warning" | "error") => setLevelFilter(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sourceFilter} onValueChange={(value: "all" | "connection" | "stream" | "system") => setSourceFilter(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  <SelectItem value="connection">Connection</SelectItem>
                  <SelectItem value="stream">Stream</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="border rounded-md overflow-hidden">
            <div className="bg-muted px-4 py-2 border-b grid grid-cols-12 gap-4 text-sm font-medium">
              <div className="col-span-2">Time</div>
              <div className="col-span-1">Level</div>
              <div className="col-span-2">Source</div>
              <div className="col-span-7">Message</div>
            </div>
            
            <div className="max-h-[600px] overflow-y-auto">
              {filteredLogs.length > 0 ? (
                <div>
                  {filteredLogs.map(log => (
                    <div 
                      key={log.id}
                      className={cn(
                        "px-4 py-2.5 grid grid-cols-12 gap-4 text-sm border-b last:border-0 hover:bg-muted/50",
                        log.level === "error" && "bg-red-50 dark:bg-red-950/10",
                        log.level === "warning" && "bg-amber-50 dark:bg-amber-950/10"
                      )}
                    >
                      <div className="col-span-2 font-mono text-xs text-muted-foreground">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </div>
                      <div className="col-span-1">
                        <Badge variant={getBadgeVariant(log.level)}>
                          {log.level}
                        </Badge>
                      </div>
                      <div className={cn("col-span-2 font-medium", getSourceClass(log.source))}>
                        {log.source}
                      </div>
                      <div className="col-span-7">{log.message}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex justify-center items-center py-10 text-muted-foreground">
                  No logs matching your filters
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default Logs;
