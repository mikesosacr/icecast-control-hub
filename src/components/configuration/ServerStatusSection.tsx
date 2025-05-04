
import { useState, useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Download, Loader2, Server } from "lucide-react";
import { icecastService } from "@/services/icecastService";

interface ServerStatusSectionProps {
  onInstallClick: () => void;
}

export const ServerStatusSection = ({ onInstallClick }: ServerStatusSectionProps) => {
  const [serverInstalled, setServerInstalled] = useState<boolean | undefined>(undefined);
  const [isCheckingServer, setIsCheckingServer] = useState(true);
  
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

  if (isCheckingServer) {
    return (
      <Alert className="mb-6">
        <Loader2 className="h-4 w-4 animate-spin" />
        <AlertTitle>Checking server status...</AlertTitle>
        <AlertDescription>
          Verifying if the built-in Icecast server is available
        </AlertDescription>
      </Alert>
    );
  }

  if (serverInstalled === false) {
    return (
      <Alert className="mb-6">
        <Server className="h-4 w-4" />
        <AlertTitle>Icecast Server Not Installed</AlertTitle>
        <AlertDescription>
          The built-in Icecast server is not installed or cannot be detected. 
          You can install it for easier management or configure an external Icecast server.
          
          <div className="mt-2">
            <Button 
              onClick={onInstallClick} 
              variant="default"
              size="sm"
            >
              <Download className="mr-1 h-4 w-4" />
              Install Built-in Server
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  return null;
};
