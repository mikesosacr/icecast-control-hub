
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
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import { icecastService } from "@/services/icecastService";
import { toast } from "sonner";

interface InstallIcecastModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInstallComplete: () => void;
}

const installSchema = z.object({
  serverPort: z.coerce.number().int().min(1024).max(65535),
  adminUser: z.string().min(3, "Username must be at least 3 characters"),
  adminPassword: z.string().min(6, "Password must be at least 6 characters"),
});

type InstallFormValues = z.infer<typeof installSchema>;

export const InstallIcecastModal = ({
  open,
  onOpenChange,
  onInstallComplete,
}: InstallIcecastModalProps) => {
  const [isInstalling, setIsInstalling] = React.useState(false);

  const form = useForm<InstallFormValues>({
    resolver: zodResolver(installSchema),
    defaultValues: {
      serverPort: 8000,
      adminUser: "admin",
      adminPassword: "",
    },
  });

  const handleInstall = async (data: InstallFormValues) => {
    setIsInstalling(true);
    try {
      const result = await icecastService.installBuiltInServer({
        serverPort: data.serverPort,
        adminUser: data.adminUser,
        adminPassword: data.adminPassword,
      });
      
      if (result.success) {
        toast.success(result.message || "Icecast server installed successfully");
        onInstallComplete();
        onOpenChange(false);
      } else {
        toast.error(result.message || "Installation failed");
      }
    } catch (error) {
      toast.error("Installation failed. Please try again.");
      console.error("Installation error:", error);
    } finally {
      setIsInstalling(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Install Icecast Server</DialogTitle>
          <DialogDescription>
            Configure and install a built-in Icecast2 server that will be managed by this panel.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleInstall)} className="space-y-6 py-4">
            <FormField
              control={form.control}
              name="serverPort"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Server Port</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="8000" {...field} />
                  </FormControl>
                  <FormDescription>
                    The port where Icecast will listen for connections (default: 8000)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="adminUser"
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
                    <Input type="password" placeholder="Secure password" {...field} />
                  </FormControl>
                  <FormDescription>
                    Choose a strong password for the Icecast admin interface
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                type="button"
                disabled={isInstalling}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isInstalling}>
                {isInstalling ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Installing...
                  </>
                ) : (
                  "Install"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
