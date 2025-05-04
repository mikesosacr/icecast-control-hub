
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ConfigurationWizard from "@/components/configuration/ConfigurationWizard";
import { XmlConfigEditor } from "@/components/configuration/XmlConfigEditor";

interface ConfigurationTabsProps {
  xmlConfig: string;
  isUpdating: boolean;
  onXmlChange: (xmlConfig: string) => void;
  onWizardSave: () => void;
}

export const ConfigurationTabs = ({ 
  xmlConfig, 
  isUpdating, 
  onXmlChange, 
  onWizardSave 
}: ConfigurationTabsProps) => {
  const [activeTab, setActiveTab] = useState<string>("xml");

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange}>
      <TabsList>
        <TabsTrigger value="xml">XML Configuration</TabsTrigger>
        <TabsTrigger value="wizard">Configuration Wizard</TabsTrigger>
      </TabsList>

      <TabsContent value="xml" className="mt-6 space-y-6">
        <XmlConfigEditor 
          xmlConfig={xmlConfig} 
          isUpdating={isUpdating}
          onSave={onXmlChange}
        />
      </TabsContent>
      
      <TabsContent value="wizard" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Configuration Wizard</CardTitle>
            <CardDescription>
              Configure your server through a user-friendly interface
            </CardDescription>
          </CardHeader>
          <CardContent>
            {xmlConfig ? (
              <ConfigurationWizard currentConfig={xmlConfig} onSave={onWizardSave} />
            ) : (
              <div className="flex flex-col items-center justify-center min-h-[400px]">
                <p className="text-muted-foreground text-center">
                  Could not load configuration data. Please refresh and try again.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};
