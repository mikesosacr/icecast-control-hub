
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertCircle, Loader2 } from "lucide-react";
import { useConfig, useConfigMutation, useServerControl } from "@/hooks/useIcecastApi";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InstallIcecastModal } from "@/components/configuration/InstallIcecastModal";
import { toast } from "sonner";
import { ServerStatusSection } from "@/components/configuration/ServerStatusSection";
import { ConfigurationTabs } from "@/components/configuration/ConfigurationTabs";

const Configuration = () => {
  const { data: configData, isLoading, error, refetch } = useConfig('local');
  const { updateConfig, isUpdating } = useConfigMutation();
  const { restartServer, isRestarting } = useServerControl();
  
  const [xmlConfig, setXmlConfig] = useState("");
  const [installModalOpen, setInstallModalOpen] = useState(false);
  
  useEffect(() => {
    if (configData?.success && configData.data) {
      setXmlConfig(configData.data);
    }
  }, [configData]);
  
  const handleRestart = () => {
    restartServer();
  };
  
  const handleRefresh = () => {
    refetch();
  };
  
  const handleWizardSave = () => {
    refetch();
  };
  
  const handleXmlUpdate = (newXmlConfig: string) => {
    updateConfig({ config: newXmlConfig });
    setXmlConfig(newXmlConfig);
  };
  
  const handleInstallComplete = () => {
    toast.success("Icecast server has been installed successfully");
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
          
          {configData?.success && (
            <Button onClick={handleRestart} variant="outline" disabled={isRestarting}>
              <RefreshCw className={`mr-1 h-4 w-4 ${isRestarting ? 'animate-spin' : ''}`} />
              {isRestarting ? "Restarting..." : "Restart Server"}
            </Button>
          )}
        </div>
      </PageHeader>

      <ServerStatusSection onInstallClick={() => setInstallModalOpen(true)} />

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load configuration: {String(error)}
          </AlertDescription>
        </Alert>
      )}

      <ConfigurationTabs
        xmlConfig={xmlConfig}
        isUpdating={isUpdating}
        onXmlChange={handleXmlUpdate}
        onWizardSave={handleWizardSave}
      />
      
      <InstallIcecastModal 
        open={installModalOpen}
        onOpenChange={setInstallModalOpen}
        onInstallComplete={handleInstallComplete}
      />
    </DashboardLayout>
  );
};

export default Configuration;
