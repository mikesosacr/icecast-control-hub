
import DashboardLayout from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { RefreshCw } from "lucide-react";

const configXmlExample = `<icecast>
  <location>Earth</location>
  <admin>icemaster@example.com</admin>
  <limits>
    <clients>100</clients>
    <sources>10</sources>
    <queue-size>524288</queue-size>
    <client-timeout>30</client-timeout>
    <header-timeout>15</header-timeout>
    <source-timeout>10</source-timeout>
  </limits>
  <authentication>
    <source-password>hackme</source-password>
    <relay-password>hackme</relay-password>
    <admin-user>admin</admin-user>
    <admin-password>hackme</admin-password>
  </authentication>
  <listen-socket>
    <port>8000</port>
    <bind-address>127.0.0.1</bind-address>
  </listen-socket>
  <mount>
    <mount-name>/example</mount-name>
    <max-listeners>100</max-listeners>
    <fallback-mount>/example2.mp3</fallback-mount>
  </mount>
</icecast>`;

const Configuration = () => {
  const [xmlConfig, setXmlConfig] = useState(configXmlExample);
  const [isEditing, setIsEditing] = useState(false);
  const [xmlBackup, setXmlBackup] = useState("");
  
  const handleEdit = () => {
    setXmlBackup(xmlConfig);
    setIsEditing(true);
  };

  const handleSave = () => {
    // Here we would send the updated config to the backend
    console.log("Saving configuration:", xmlConfig);
    // API call would go here to save the config
    setIsEditing(false);
  };

  const handleCancel = () => {
    setXmlConfig(xmlBackup);
    setIsEditing(false);
  };

  const handleRestart = () => {
    console.log("Restarting Icecast server");
    // API call would go here to restart the server
  };

  return (
    <DashboardLayout>
      <PageHeader 
        heading="Configuration" 
        text="Manage your Icecast server configuration"
      >
        <Button onClick={handleRestart} variant="outline">
          <RefreshCw className="mr-1 h-4 w-4" />
          Restart Server
        </Button>
      </PageHeader>

      <Tabs defaultValue="xml">
        <TabsList>
          <TabsTrigger value="xml">XML Configuration</TabsTrigger>
          <TabsTrigger value="wizard">Configuration Wizard</TabsTrigger>
        </TabsList>
        <TabsContent value="xml" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>icecast.xml</CardTitle>
              <CardDescription>
                Edit the raw XML configuration file for your Icecast server
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="relative">
                  <Textarea 
                    value={xmlConfig}
                    onChange={(e) => setXmlConfig(e.target.value)}
                    className="min-h-[60vh] font-mono text-sm whitespace-pre"
                    disabled={!isEditing}
                  />
                </div>
                
                <div className="flex justify-end gap-2">
                  {isEditing ? (
                    <>
                      <Button variant="outline" onClick={handleCancel}>Cancel</Button>
                      <Button onClick={handleSave}>Save Changes</Button>
                    </>
                  ) : (
                    <Button onClick={handleEdit}>Edit Configuration</Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
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
              <div className="flex flex-col items-center justify-center min-h-[400px]">
                <p className="text-muted-foreground text-center">
                  Configuration wizard will be available in a future update.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default Configuration;
