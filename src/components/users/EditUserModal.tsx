import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useMountpoints } from "@/hooks/api/useMountpoints";

interface User {
  id: string;
  username: string;
  role: string;
  allowedMountpoints: string[];
  active: boolean;
}

interface EditUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserUpdated: () => void;
  user: User | null;
}

const editUserSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters").optional().or(z.literal("")),
  role: z.enum(["admin", "streamer"]),
  allowedMountpoints: z.array(z.string()),
  active: z.boolean(),
});

type EditUserFormValues = z.infer<typeof editUserSchema>;

export const EditUserModal = ({
  open,
  onOpenChange,
  onUserUpdated,
  user,
}: EditUserModalProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const { data: mountpointsResponse } = useMountpoints();
  const mountpoints = mountpointsResponse?.success ? mountpointsResponse.data || [] : [];

  const form = useForm<EditUserFormValues>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      username: "",
      password: "",
      role: "streamer",
      allowedMountpoints: [],
      active: true,
    },
  });

  const selectedRole = form.watch("role");

  useEffect(() => {
    if (user) {
      form.reset({
        username: user.username,
        password: "",
        role: user.role as "admin" | "streamer",
        allowedMountpoints: user.allowedMountpoints || [],
        active: user.active,
      });
    }
  }, [user, form]);

  const handleUpdateUser = async (data: EditUserFormValues) => {
    if (!user) return;
    setIsUpdating(true);
    try {
      const auth = localStorage.getItem('icecast_auth');
      if (!auth) {
        toast.error('Please login first');
        return;
      }

      const payload: any = {
        username: data.username,
        role: data.role,
        allowedMountpoints: data.role === "admin" ? [] : data.allowedMountpoints,
        active: data.active,
      };

      if (data.password && data.password.length > 0) {
        payload.password = data.password;
      }

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${auth}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success('User updated successfully');
        onUserUpdated();
        onOpenChange(false);
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to update user');
      }
    } catch (error) {
      toast.error('Failed to update user. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Update user details and mountpoint permissions.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleUpdateUser)} className="space-y-4 py-2">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter username" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password <span className="text-muted-foreground text-xs">(leave blank to keep current)</span></FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Enter new password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="streamer">Streamer</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="active"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="cursor-pointer">Active account</FormLabel>
                </FormItem>
              )}
            />

            {selectedRole === "streamer" && (
              <FormField
                control={form.control}
                name="allowedMountpoints"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Allowed Mountpoints</FormLabel>
                    {mountpoints.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No mountpoints created yet.</p>
                    ) : (
                      <div className="space-y-2 border rounded-md p-3">
                        {mountpoints.map((mp) => (
                          <div key={mp.id} className="flex items-center gap-2">
                            <Checkbox
                              id={`mp-${mp.id}`}
                              checked={field.value.includes(mp.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  field.onChange([...field.value, mp.id]);
                                } else {
                                  field.onChange(field.value.filter((id) => id !== mp.id));
                                }
                              }}
                            />
                            <label htmlFor={`mp-${mp.id}`} className="text-sm cursor-pointer">
                              <span className="font-medium">{mp.name}</span>
                              <span className="text-muted-foreground ml-2 font-mono text-xs">{mp.point || mp.mount}</span>
                            </label>
                          </div>
                        ))}
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <DialogFooter className="pt-2">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                type="button"
                disabled={isUpdating}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isUpdating}>
                {isUpdating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
