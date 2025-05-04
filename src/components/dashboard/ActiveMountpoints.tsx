
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MountpointCard } from "@/components/mountpoints/MountpointCard";
import { Mountpoint } from "@/types/icecast";

interface ActiveMountpointsProps {
  mountpoints: Mountpoint[];
  isLoading: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleVisibility: (id: string, isPublic: boolean) => void;
}

export const ActiveMountpoints = ({ 
  mountpoints, 
  isLoading,
  onEdit,
  onDelete,
  onToggleVisibility
}: ActiveMountpointsProps) => {
  const activeMountpoints = mountpoints.filter(mp => mp.status === "active");
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Mountpoints</CardTitle>
        <CardDescription>
          Recent activity on your streams
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        ) : activeMountpoints.length > 0 ? (
          activeMountpoints
            .slice(0, 2)
            .map(mountpoint => (
              <MountpointCard 
                key={mountpoint.id} 
                mountpoint={mountpoint} 
                onEdit={onEdit}
                onDelete={onDelete}
                onToggleVisibility={onToggleVisibility}
              />
            ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No active mountpoints found
          </div>
        )}
      </CardContent>
      <CardFooter className="border-t pt-4">
        <Button variant="ghost" size="sm" className="w-full" asChild>
          <Link to="/mountpoints">View All Mountpoints</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};
