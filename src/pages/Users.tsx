
import { useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash, Plus, Users as UsersIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useUsers, useUserMutations } from "@/hooks/useIcecastApi";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CreateUserModal } from "@/components/users/CreateUserModal";

const Users = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { data: usersResponse, isLoading, error, refetch } = useUsers();
  const { deleteUser } = useUserMutations();

  const handleEdit = (id: string) => {
    console.log(`Edit user ${id}`);
  };

  const handleDelete = (id: string) => {
    deleteUser({ userId: id });
  };

  const handleUserCreated = () => {
    refetch();
  };

  const users = usersResponse?.success ? usersResponse.data || [] : [];

  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <PageHeader 
        heading="User Management" 
        text="Manage admin and streamer accounts"
      >
        <Button onClick={() => setShowCreateModal(true)}>
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

          {error ? (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{String(error)}</AlertDescription>
            </Alert>
          ) : isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : filteredUsers.length > 0 ? (
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

      <CreateUserModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onUserCreated={handleUserCreated}
      />
    </>
  );
};

export default Users;
