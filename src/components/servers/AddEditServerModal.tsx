
import React from "react";
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import { IcecastServer } from "@/types/icecast";

interface AddEditServerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  server?: IcecastServer | null;
  onSubmit: (data: ServerFormData) => void;
  isLoading: boolean;
}

const serverSchema = z.object({
  name: z.string().min(1, "Server name is required"),
  host: z.string().min(1, "Host is required"),
  port: z.coerce.number().int().min(1).max(65535, "Port must be between 1 and 65535"),
  adminUsername: z.string().min(1, "Admin username is required"),
  adminPassword: z.string().min(1, "Admin password is required"),
  isLocal: z.boolean().default(false),
});

export type ServerFormData = z.infer<typeof serverSchema>;

export const AddEditServerModal = ({
  open,
  onOpenChange,
  server,
  onSubmit,
  isLoading,
}: AddEditServerModalProps) => {
  const isEdit = !!server;

  const form = useForm<ServerFormData>({
    resolver: zodResolver(serverSchema),
    defaultValues: {
      name: server?.name || "",
      host: server?.host || "",
      port: server?.port || 8000,
      adminUsername: server?.adminUsername || "admin",
      adminPassword: server?.adminPassword || "",
      isLocal: server?.isLocal || false,
    },
  });

  React.useEffect(() => {
    if (server && open) {
      form.reset({
        name: server.name,
        host: server.host,
        port: server.port,
        adminUsername: server.adminUsername,
        adminPassword: server.adminPassword,
        isLocal: server.isLocal,
      });
    } else if (!server && open) {
      form.reset({
        name: "",
        host: "",
        port: 8000,
        adminUsername: "admin",
        adminPassword: "",
        isLocal: false,
      });
    }
  }, [server, open, form]);

  const handleSubmit = (data: ServerFormData) => {
    onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Server" : "Add New Server"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update the server configuration" : "Add a new Icecast server to manage"}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Server Name</FormLabel>
                  <FormControl>
                    <Input placeholder="My Icecast Server" {...field} />
                  </FormControl>
                  <FormDescription>
                    A friendly name for this server
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="host"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Host</FormLabel>
                    <FormControl>
                      <Input placeholder="localhost" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="port"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Port</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="8000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="adminUsername"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Admin Username</FormLabel>
                  <FormControl>
                    <Input placeholder="admin" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="adminPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Admin Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Enter password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="isLocal"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Local Server</FormLabel>
                    <FormDescription>
                      Mark this as a local server instance
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                type="button"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEdit ? "Updating..." : "Adding..."}
                  </>
                ) : (
                  isEdit ? "Update Server" : "Add Server"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
