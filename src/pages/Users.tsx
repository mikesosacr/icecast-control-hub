
import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { User } from "@/types/icecast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash, Plus, Users as UsersIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

// Sample data
const mockUsers: User[] = [
  {
    id: "1",
    username: "admin",
    password: "********",
    role: "admin",
    allowedMountpoints: [],
  },
  {
    id: "2",
    username: "dj_main",
    password: "********",
    role: "streamer",
    allowedMountpoints: ["1", "2"],
  },
  {
    id: "3",
    username: "dj_weekend",
    password: "********",
    role: "streamer",
    allowedMountpoints: ["1"],
  }
];

const Users = () => {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchQuery, setSearchQuery] = useState("");

  const handleEdit = (id: string) => {
    console.log(`Edit user ${id}`);
  };

  const handleDelete = (id: string) => {
    console.log(`Delete user ${id}`);
    setUsers(users.filter(user => user.id !== id));
  };

  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <PageHeader 
        heading="User Management" 
        text="Manage admin and streamer accounts"
      >
        <Button>
          <Plus className="mr-1 h-4 w-4" />
          <span>New User</span>
        </Button>
      </PageHeader>

      <Card className="mb-6">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Users</CardTitle>
            <UsersIcon size={16} className="text-muted-foreground" />
          </div>
          <CardDescription>Manage user accounts for your Icecast server</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {filteredUsers.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Allowed Mountpoints</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.username}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === "admin" ? "default" : "outline"}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.role === "admin" ? (
                        <span className="text-muted-foreground">All</span>
                      ) : (
                        <span>
                          {user.allowedMountpoints.length > 0 
                            ? `${user.allowedMountpoints.length} mountpoint(s)`
                            : "None"}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(user.id)}>
                          <Edit size={16} />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleDelete(user.id)}>
                          <Trash size={16} />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              No users found matching your search
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default Users;
