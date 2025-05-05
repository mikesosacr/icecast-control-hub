
import { useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MountpointCard } from "@/components/mountpoints/MountpointCard";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMountpoints, useMountpointMutations } from "@/hooks/useIcecastApi";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const Mountpoints = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  
  const { data: mountpointsResponse, isLoading, error } = useMountpoints();
  const { deleteMountpoint, toggleMountpointVisibility } = useMountpointMutations();

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

  const mountpoints = mountpointsResponse?.success ? mountpointsResponse.data || [] : [];

  const filteredMountpoints = mountpoints.filter(mp => {
    const matchesSearch = mp.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          mp.point.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (mp.description && mp.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (statusFilter === "all") return matchesSearch;
    return matchesSearch && mp.status === statusFilter;
  });

  if (error) {
    return (
      <>
        <PageHeader 
          heading="Mountpoints" 
          text="Create and manage streaming mountpoints"
        />
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {String(error)}
          </AlertDescription>
        </Alert>
      </>
    );
  }

  return (
    <>
      <PageHeader 
        heading="Mountpoints" 
        text="Create and manage streaming mountpoints"
      >
        <Button asChild>
          <Link to="/mountpoints/new">
            <Plus className="mr-1 h-4 w-4" />
            <span>New Mountpoint</span>
          </Link>
        </Button>
      </PageHeader>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Search mountpoints..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="w-full md:w-[180px]">
          <Select value={statusFilter} onValueChange={(value: "all" | "active" | "inactive") => setStatusFilter(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-xl border p-6">
              <Skeleton className="h-6 w-1/2 mb-4" />
              <Skeleton className="h-4 w-3/4 mb-2" />
              <div className="space-y-2 mt-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredMountpoints.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMountpoints.map((mountpoint) => (
            <MountpointCard 
              key={mountpoint.id}
              mountpoint={mountpoint}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleVisibility={handleToggleVisibility}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center min-h-[200px] bg-muted/30 rounded-md border border-dashed p-8 text-center">
          <h3 className="text-lg font-semibold mb-2">No mountpoints found</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery || statusFilter !== "all" 
              ? "Try adjusting your search or filters" 
              : "Create your first mountpoint to start streaming"}
          </p>
          <Button asChild>
            <Link to="/mountpoints/new">
              <Plus className="mr-1 h-4 w-4" />
              <span>Create Mountpoint</span>
            </Link>
          </Button>
        </div>
      )}
    </>
  );
};

export default Mountpoints;
