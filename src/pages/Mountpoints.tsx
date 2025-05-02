
import { useState } from "react";
import { MountPoint } from "@/types/icecast";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MountpointCard } from "@/components/mountpoints/MountpointCard";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Sample data (to be replaced with API calls)
const mockMountpoints: MountPoint[] = [
  {
    id: "1",
    name: "Main Stream",
    point: "/stream",
    type: "audio/mpeg",
    bitrate: 128,
    description: "Main radio stream",
    genre: "Various",
    streamUrl: "http://example.com/stream",
    listeners: {
      current: 87,
      peak: 156,
    },
    streamUser: "source",
    streamPassword: "hackme",
    isPublic: true,
    status: "active",
  },
  {
    id: "2",
    name: "High Quality",
    point: "/high",
    type: "audio/aac",
    bitrate: 256,
    description: "High quality AAC stream",
    genre: "Electronic",
    streamUrl: "http://example.com/high",
    listeners: {
      current: 52,
      peak: 124,
    },
    streamUser: "source2",
    streamPassword: "hackme2",
    isPublic: true,
    status: "active",
  },
  {
    id: "3",
    name: "Low Bandwidth",
    point: "/mobile",
    type: "audio/mpeg",
    bitrate: 64,
    description: "Low bandwidth stream for mobile",
    genre: "Talk",
    streamUrl: "http://example.com/mobile",
    listeners: {
      current: 6,
      peak: 76,
    },
    streamUser: "source3",
    streamPassword: "hackme3",
    isPublic: false,
    status: "inactive",
  },
  {
    id: "4",
    name: "Test Stream",
    point: "/test",
    type: "audio/ogg",
    bitrate: 96,
    description: "Test stream",
    genre: "Test",
    streamUrl: "http://example.com/test",
    listeners: {
      current: 0,
      peak: 12,
    },
    streamUser: "source4",
    streamPassword: "hackme4",
    isPublic: false,
    status: "inactive",
  },
];

const Mountpoints = () => {
  const [mountpoints, setMountpoints] = useState<MountPoint[]>(mockMountpoints);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  const handleEdit = (id: string) => {
    // Implement edit logic
    console.log(`Edit mountpoint ${id}`);
  };

  const handleDelete = (id: string) => {
    // Implement delete logic
    console.log(`Delete mountpoint ${id}`);
    setMountpoints(mountpoints.filter(mp => mp.id !== id));
  };

  const handleToggleVisibility = (id: string, isPublic: boolean) => {
    // Implement visibility toggle logic
    console.log(`Toggle visibility of ${id} to ${isPublic}`);
    setMountpoints(
      mountpoints.map(mp => 
        mp.id === id ? { ...mp, isPublic } : mp
      )
    );
  };

  const filteredMountpoints = mountpoints.filter(mp => {
    const matchesSearch = mp.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          mp.point.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          mp.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (statusFilter === "all") return matchesSearch;
    return matchesSearch && mp.status === statusFilter;
  });

  return (
    <DashboardLayout>
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

      {filteredMountpoints.length > 0 ? (
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
    </DashboardLayout>
  );
};

export default Mountpoints;
