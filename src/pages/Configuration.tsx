
import { useState, useEffect } from "react";
import { useConfig, useConfigMutation, useServerControl } from "@/hooks/useIcecastApi";
import { toast } from "sonner";
import { InstallIcecastModal } from "@/components/configuration/InstallIcecastModal";
import { ServerStatusSection } from "@/components/configuration/ServerStatusSection";
import { ConfigurationTabs } from "@/components/configuration/ConfigurationTabs";
import { ConfigurationPageHeader } from "@/components/configuration/PageHeader";
import { ConfigurationLoadingState } from "@/components/configuration/LoadingState";
import { ErrorAlert } from "@/components/configuration/ErrorAlert";

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
    restartServer('local');
  };
  
  const handleRefresh = () => {
    refetch();
  };
  
  const handleWizardSave = () => {
    refetch();
  };
  
  const handleXmlUpdate = (newXmlConfig: string) => {
    updateConfig({ config: newXmlConfig, serverId: 'local' });
    setXmlConfig(newXmlConfig);
  };
  
  const handleInstallComplete = () => {
    toast.success("Icecast server has been installed successfully");
    refetch();
  };

  if (isLoading) {
    return <ConfigurationLoadingState />;
  }

  return (
    <>
      <ConfigurationPageHeader 
        isLoading={isLoading}
        isRestarting={isRestarting}
        onRefresh={handleRefresh}
        onRestart={handleRestart}
        showRestartButton={configData?.success}
      />

      <ServerStatusSection onInstallClick={() => setInstallModalOpen(true)} />

      {error && <ErrorAlert error={error} />}

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
    </>
  );
};

export default Configuration;
