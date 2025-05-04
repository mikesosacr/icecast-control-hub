
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useConfigMutation } from "@/hooks/useIcecastApi";
import { parseXmlToConfig, configToXml } from "@/lib/xml-config";
import { toast } from "sonner";

const configSchema = z.object({
  server: z.object({
    location: z.string().min(1, "Location is required"),
    admin: z.string().email("Must be a valid email"),
  }),
  limits: z.object({
    clients: z.coerce.number().int().positive().min(1),
    sources: z.coerce.number().int().positive().min(1),
    queueSize: z.coerce.number().int().positive().min(1024),
    clientTimeout: z.coerce.number().int().positive(),
    headerTimeout: z.coerce.number().int().positive(),
    sourceTimeout: z.coerce.number().int().positive(),
  }),
  authentication: z.object({
    sourcePassword: z.string().min(6, "Password must be at least 6 characters"),
    relayPassword: z.string().min(6, "Password must be at least 6 characters"),
    adminUser: z.string().min(3, "Username must be at least 3 characters"),
    adminPassword: z.string().min(6, "Password must be at least 6 characters"),
  }),
  listen: z.object({
    port: z.coerce.number().int().min(1).max(65535),
    bindAddress: z.string().min(1, "Bind address is required"),
  }),
  mountPoints: z.array(
    z.object({
      mountName: z.string().min(1, "Mount name is required"),
      maxListeners: z.coerce.number().int().positive().optional(),
      fallbackMount: z.string().optional(),
    })
  ).optional(),
});

type ConfigFormValues = z.infer<typeof configSchema>;

interface ConfigurationWizardProps {
  currentConfig: string;
  onSave: () => void;
}

const ConfigurationWizard = ({ currentConfig, onSave }: ConfigurationWizardProps) => {
  const { updateConfig, isUpdating } = useConfigMutation();
  const parsedConfig = React.useMemo(() => parseXmlToConfig(currentConfig), [currentConfig]);
  
  const form = useForm<ConfigFormValues>({
    resolver: zodResolver(configSchema),
    defaultValues: parsedConfig,
    mode: "onChange",
  });

  const handleSubmit = (data: ConfigFormValues) => {
    try {
      const xmlConfig = configToXml(data);
      updateConfig({ config: xmlConfig });
      toast.success("Configuration saved");
      onSave();
    } catch (error) {
      console.error("Error converting form data to XML:", error);
      toast.error("Failed to save configuration");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <Accordion type="single" collapsible defaultValue="server" className="w-full">
          <AccordionItem value="server">
            <AccordionTrigger>Server Settings</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="server.location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="Server location" {...field} />
                      </FormControl>
                      <FormDescription>Physical location of the server</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="server.admin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Admin Email</FormLabel>
                      <FormControl>
                        <Input placeholder="admin@example.com" type="email" {...field} />
                      </FormControl>
                      <FormDescription>Contact email for server administrator</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="limits">
            <AccordionTrigger>Connection Limits</AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="limits.clients"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Clients</FormLabel>
                      <FormControl>
                        <Input placeholder="100" type="number" {...field} />
                      </FormControl>
                      <FormDescription>Maximum number of connected clients</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="limits.sources"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Sources</FormLabel>
                      <FormControl>
                        <Input placeholder="10" type="number" {...field} />
                      </FormControl>
                      <FormDescription>Maximum number of source connections</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="limits.queueSize"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Queue Size</FormLabel>
                      <FormControl>
                        <Input placeholder="524288" type="number" {...field} />
                      </FormControl>
                      <FormDescription>Buffer size in bytes</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="limits.clientTimeout"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client Timeout</FormLabel>
                      <FormControl>
                        <Input placeholder="30" type="number" {...field} />
                      </FormControl>
                      <FormDescription>Seconds before disconnecting idle clients</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="limits.headerTimeout"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Header Timeout</FormLabel>
                      <FormControl>
                        <Input placeholder="15" type="number" {...field} />
                      </FormControl>
                      <FormDescription>Seconds to wait for client headers</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="limits.sourceTimeout"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Source Timeout</FormLabel>
                      <FormControl>
                        <Input placeholder="10" type="number" {...field} />
                      </FormControl>
                      <FormDescription>Seconds before dropping inactive sources</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="authentication">
            <AccordionTrigger>Authentication</AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="authentication.adminUser"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Admin Username</FormLabel>
                      <FormControl>
                        <Input placeholder="admin" {...field} />
                      </FormControl>
                      <FormDescription>Web interface admin username</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="authentication.adminPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Admin Password</FormLabel>
                      <FormControl>
                        <Input placeholder="password" type="password" {...field} />
                      </FormControl>
                      <FormDescription>Web interface admin password</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="authentication.sourcePassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Source Password</FormLabel>
                      <FormControl>
                        <Input placeholder="password" type="password" {...field} />
                      </FormControl>
                      <FormDescription>Password for source clients</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="authentication.relayPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Relay Password</FormLabel>
                      <FormControl>
                        <Input placeholder="password" type="password" {...field} />
                      </FormControl>
                      <FormDescription>Password for relay sources</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="listen">
            <AccordionTrigger>Listening Socket</AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="listen.port"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Port</FormLabel>
                      <FormControl>
                        <Input placeholder="8000" type="number" {...field} />
                      </FormControl>
                      <FormDescription>Port that Icecast will listen on</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="listen.bindAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bind Address</FormLabel>
                      <FormControl>
                        <Input placeholder="127.0.0.1" {...field} />
                      </FormControl>
                      <FormDescription>IP address to bind to (leave as 127.0.0.1 for localhost only)</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="flex justify-end mt-6 space-x-2">
          <Button type="submit" disabled={isUpdating}>
            {isUpdating ? "Saving..." : "Save Configuration"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ConfigurationWizard;
