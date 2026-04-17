
import { BarChart } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function BandwidthChart() {
  return (
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
  );
}
