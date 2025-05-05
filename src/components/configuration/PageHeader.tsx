
import { ReactNode } from "react";
import { PageHeader as BasePageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface ConfigurationPageHeaderProps {
  isLoading: boolean;
  isRestarting: boolean;
  onRefresh: () => void;
  onRestart: () => void;
  showRestartButton: boolean;
}

export const ConfigurationPageHeader = ({
  isLoading,
  isRestarting,
  onRefresh,
  onRestart,
  showRestartButton,
}: ConfigurationPageHeaderProps) => {
  return (
    <BasePageHeader 
      heading="Configuration" 
      text="Manage your Icecast server configuration"
    >
      <div className="flex gap-2">
        <Button onClick={onRefresh} variant="outline" disabled={isLoading}>
          <RefreshCw className={`mr-1 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
        
        {showRestartButton && (
          <Button onClick={onRestart} variant="outline" disabled={isRestarting}>
            <RefreshCw className={`mr-1 h-4 w-4 ${isRestarting ? 'animate-spin' : ''}`} />
            {isRestarting ? "Restarting..." : "Restart Server"}
          </Button>
        )}
      </div>
    </BasePageHeader>
  );
};
