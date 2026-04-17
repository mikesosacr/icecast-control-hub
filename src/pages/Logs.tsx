
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { RefreshCw } from "lucide-react";
import { useLogs } from "@/hooks/useIcecastApi";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const Logs = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState<"all" | "info" | "warning" | "error">("all");
  const [sourceFilter, setSourceFilter] = useState<"all" | "connection" | "stream" | "system">("all");

  const filters = {
    ...(levelFilter !== "all" && { level: levelFilter as "info" | "warning" | "error" }),
    ...(sourceFilter !== "all" && { source: sourceFilter }),
    ...(searchQuery && { query: searchQuery }),
  };

  const { data: logsResponse, isLoading, error, refetch } = useLogs('local', Object.keys(filters).length > 0 ? filters : undefined);

  const logs = logsResponse?.success ? logsResponse.data || [] : [];

  const filteredLogs = logs.filter(log => {
    if (!searchQuery) return true;
    return log.message.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleRefresh = () => {
    refetch();
  };

  const getBadgeVariant = (level: "info" | "warning" | "error") => {
    switch (level) {
      case "info": return "default";
      case "warning": return "outline";
      case "error": return "destructive";
    }
  };

  const getSourceClass = (source: string) => {
    switch (source) {
      case "connection": return "text-blue-600";
      case "stream": return "text-green-600";
      case "system": return "text-purple-600";
      default: return "text-foreground";
    }
  };

  return (
    <>
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

          {error ? (
            <Alert variant="destructive">
              <AlertTitle>Error loading logs</AlertTitle>
              <AlertDescription>{String(error)}</AlertDescription>
            </Alert>
          ) : isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : (
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
                          log.level === "error" && "bg-destructive/5",
                          log.level === "warning" && "bg-accent/30"
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
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default Logs;
