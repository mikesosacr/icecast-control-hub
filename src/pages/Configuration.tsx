
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { RefreshCw, AlertCircle, Loader2, Server, Download } from "lucide-react";
import { useConfig, useConfigMutation, useServerControl } from "@/hooks/useIcecastApi";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import ConfigurationWizard from "@/components/configuration/ConfigurationWizard";
import { InstallIcecastModal } from "@/components/configuration/InstallIcecastModal";
import { icecastService } from "@/services/icecastService";
import { toast } from "sonner";

const Configuration = () => {
  const { data: configData, isLoading, error, refetch } = useConfig('local');
  const { updateConfig, isUpdating } = useConfigMutation();
  const { restartServer, isRestarting } = useServerControl();
  
  const [xmlConfig, setXmlConfig] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [xmlBackup, setXmlBackup] = useState("");
  const [activeTab, setActiveTab] = useState<string>("xml");
  
  // Built-in server management
  const [serverInstalled, setServerInstalled] = useState<boolean | undefined>(undefined);
  const [isCheckingServer, setIsCheckingServer] = useState(true);
  const [installModalOpen, setInstallModalOpen] = useState(false);
  
  // Check if Icecast is installed
  useEffect(() => {
    const checkServer = async () => {
      setIsCheckingServer(true);
      try {
        const status = await icecastService.getInstallationStatus();
        setServerInstalled(status.installed);
      } catch (error) {
        console.error("Failed to check server status:", error);
        setServerInstalled(false);
      } finally {
        setIsCheckingServer(false);
      }
    };
    
    checkServer();
  }, []);
  
  useEffect(() => {
    if (configData?.success && configData.data) {
      setXmlConfig(configData.data);
    }
  }, [configData]);
  
  const handleEdit = () => {
    setXmlBackup(xmlConfig);
    setIsEditing(true);
  };

  const handleSave = () => {
    updateConfig({ config: xmlConfig });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setXmlConfig(xmlBackup);
    setIsEditing(false);
  };

  const handleRestart = () => {
    restartServer();
  };
  
  const handleRefresh = () => {
    refetch();
  };
  
  const handleWizardSave = () => {
    refetch();
    setActiveTab("xml");
  };
  
  const handleInstallComplete = () => {
    toast.success("Icecast server has been installed successfully");
    setServerInstalled(true);
    refetch();
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-lg">Loading configuration...</span>
        </div>
      </DashboardLayout>
    );
  }

  const errorMessage = error ? String(error) : undefined;

  return (
    <DashboardLayout>
      <PageHeader 
        heading="Configuration" 
        text="Manage your Icecast server configuration"
      >
        <div className="flex gap-2">
          <Button onClick={handleRefresh} variant="outline" disabled={isLoading}>
            <RefreshCw className={`mr-1 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          {serverInstalled === false && !isCheckingServer && (
            <Button 
              onClick={() => setInstallModalOpen(true)} 
              variant="default"
            >
              <Download className="mr-1 h-4 w-4" />
              Install Built-in Server
            </Button>
          )}
          
          {serverInstalled && (
            <Button onClick={handleRestart} variant="outline" disabled={isRestarting}>
              <RefreshCw className={`mr-1 h-4 w-4 ${isRestarting ? 'animate-spin' : ''}`} />
              {isRestarting ? "Restarting..." : "Restart Server"}
            </Button>
          )}
        </div>
      </PageHeader>

      {isCheckingServer && (
        <Alert className="mb-6">
          <Loader2 className="h-4 w-4 animate-spin" />
          <AlertTitle>Checking server status...</AlertTitle>
          <AlertDescription>
            Verifying if the built-in Icecast server is available
          </AlertDescription>
        </Alert>
      )}

      {!isCheckingServer && serverInstalled === false && (
        <Alert className="mb-6">
          <Server className="h-4 w-4" />
          <AlertTitle>Icecast Server Not Installed</AlertTitle>
          <AlertDescription>
            The built-in Icecast server is not installed or cannot be detected. 
            You can install it for easier management or configure an external Icecast server.
          </AlertDescription>
        </Alert>
      )}

      {errorMessage && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load configuration: {errorMessage}
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
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
                      <Button variant="outline" onClick={handleCancel} disabled={isUpdating}>Cancel</Button>
                      <Button onClick={handleSave} disabled={isUpdating}>
                        {isUpdating ? "Saving..." : "Save Changes"}
                      </Button>
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
              {xmlConfig ? (
                <ConfigurationWizard currentConfig={xmlConfig} onSave={handleWizardSave} />
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
      
      <InstallIcecastModal 
        open={installModalOpen}
        onOpenChange={setInstallModalOpen}
        onInstallComplete={handleInstallComplete}
      />
    </DashboardLayout>
  );
};

export default Configuration;
