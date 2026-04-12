import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useConfigMutation } from "@/hooks/useIcecastApi";
import { parseXmlToConfig } from "@/lib/xml-config";
import { toast } from "sonner";
import { ConfigFormValues, configSchema } from "./schema/config-schema";
import { ServerSection } from "./sections/ServerSection";
import { LimitsSection } from "./sections/LimitsSection";
import { AuthenticationSection } from "./sections/AuthenticationSection";
import { ListenSection } from "./sections/ListenSection";

interface ConfigurationWizardProps {
  currentConfig: string;
  onSave: () => void;
}

function patchXmlValue(xml: string, tag: string, value: string): string {
  const regex = new RegExp(`(<${tag}>)[^<]*(</${tag}>)`, 'g');
  if (regex.test(xml)) {
    return xml.replace(new RegExp(`(<${tag}>)[^<]*(</${tag}>)`, 'g'), `$1${value}$2`);
  }
  return xml;
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
      // Partir del XML actual y solo parchear los valores cambiados
      // Esto preserva los bloques <mount>, <paths>, <logging>, etc.
      let xml = currentConfig;

      // Server
      xml = patchXmlValue(xml, 'location', data.server.location);
      xml = patchXmlValue(xml, 'admin', data.server.admin);

      // Limits
      xml = patchXmlValue(xml, 'clients', String(data.limits.clients));
      xml = patchXmlValue(xml, 'sources', String(data.limits.sources));
      xml = patchXmlValue(xml, 'queue-size', String(data.limits.queueSize));
      xml = patchXmlValue(xml, 'client-timeout', String(data.limits.clientTimeout));
      xml = patchXmlValue(xml, 'header-timeout', String(data.limits.headerTimeout));
      xml = patchXmlValue(xml, 'source-timeout', String(data.limits.sourceTimeout));

      // Authentication
      xml = patchXmlValue(xml, 'source-password', data.authentication.sourcePassword);
      xml = patchXmlValue(xml, 'relay-password', data.authentication.relayPassword);
      xml = patchXmlValue(xml, 'admin-user', data.authentication.adminUser);
      xml = patchXmlValue(xml, 'admin-password', data.authentication.adminPassword);

      // Listen
      xml = patchXmlValue(xml, 'port', String(data.listen.port));

      updateConfig({ config: xml, serverId: 'local' });
      toast.success("Configuración guardada correctamente");
      onSave();
    } catch (error) {
      console.error("Error saving config:", error);
      toast.error("Error al guardar la configuración");
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
        </Accordion>

        <div className="flex justify-end mt-6 space-x-2">
          <Button type="submit" disabled={isUpdating}>
            {isUpdating ? "Guardando..." : "Guardar Configuración"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ConfigurationWizard;
