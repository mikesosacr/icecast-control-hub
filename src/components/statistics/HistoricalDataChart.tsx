
import { Activity } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function HistoricalDataChart() {
  return (
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
  );
}
