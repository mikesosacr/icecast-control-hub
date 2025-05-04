
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useConfigMutation } from "@/hooks/useIcecastApi";
import { IcecastConfig, configToXml, parseXmlToConfig } from "@/lib/xml-config";
import { toast } from "sonner";
import { ConfigFormValues, configSchema } from "./schema/config-schema";
import { ServerSection } from "./sections/ServerSection";
import { LimitsSection } from "./sections/LimitsSection";
import { AuthenticationSection } from "./sections/AuthenticationSection";
import { ListenSection } from "./sections/ListenSection";
import { MountPointsSection } from "./sections/MountPointsSection";

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
      // Ensure data matches the IcecastConfig interface
      const config: IcecastConfig = {
        server: {
          location: data.server.location,
          admin: data.server.admin,
        },
        limits: {
          clients: data.limits.clients,
          sources: data.limits.sources,
          queueSize: data.limits.queueSize,
          clientTimeout: data.limits.clientTimeout,
          headerTimeout: data.limits.headerTimeout,
          sourceTimeout: data.limits.sourceTimeout,
        },
        authentication: {
          sourcePassword: data.authentication.sourcePassword,
          relayPassword: data.authentication.relayPassword,
          adminUser: data.authentication.adminUser,
          adminPassword: data.authentication.adminPassword,
        },
        listen: {
          port: data.listen.port,
          bindAddress: data.listen.bindAddress,
        },
        // Make sure mountPoints is always an array and all mount points have required fields
        mountPoints: data.mountPoints?.filter(mp => mp.mountName) || [],
      };
      
      const xmlConfig = configToXml(config);
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
              <ServerSection form={form} />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="limits">
            <AccordionTrigger>Connection Limits</AccordionTrigger>
            <AccordionContent>
              <LimitsSection form={form} />
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="authentication">
            <AccordionTrigger>Authentication</AccordionTrigger>
            <AccordionContent>
              <AuthenticationSection form={form} />
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="listen">
            <AccordionTrigger>Listening Socket</AccordionTrigger>
            <AccordionContent>
              <ListenSection form={form} />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="mountpoints">
            <AccordionTrigger>Mount Points</AccordionTrigger>
            <AccordionContent>
              <MountPointsSection form={form} />
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
