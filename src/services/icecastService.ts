
import { toast } from "sonner";

/**
 * Provides integration with the built-in Icecast2 server
 */
export const icecastService = {
  /**
   * Check if the built-in Icecast server is available
   */
  async checkServerAvailability(): Promise<boolean> {
    try {
      // In a real implementation, this would check if the server binary exists
      // and if the service can be accessed
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/server-health`);
      return response.ok;
    } catch (error) {
      console.error("Error checking server availability:", error);
      return false;
    }
  },

  /**
   * Install Icecast2 as a built-in service
   */
  async installBuiltInServer(options: { 
    serverPort: number, 
    adminUser: string, 
    adminPassword: string 
  }): Promise<{ success: boolean, message?: string }> {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/install-server`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(options),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Installation failed');
      }
      
      return { 
        success: true, 
        message: 'Icecast server installed successfully' 
      };
    } catch (error) {
      console.error("Error installing built-in server:", error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Unknown error occurred during installation' 
      };
    }
  },
  
  /**
   * Get installation status
   */
  async getInstallationStatus(): Promise<{ 
    installed: boolean; 
    version?: string;
    configPath?: string;
    port?: number;
  }> {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/server-status`);
      if (!response.ok) {
        return { installed: false };
      }
      
      return await response.json();
    } catch (error) {
      console.error("Error checking installation status:", error);
      return { installed: false };
    }
  }
};
