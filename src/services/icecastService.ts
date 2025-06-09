
import { toast } from "sonner";

export const icecastService = {
  async checkServerAvailability(): Promise<boolean> {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/server-health`);
      return response.ok;
    } catch (error) {
      console.error("Error checking server availability:", error);
      return false;
    }
  },

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
        body: JSON.stringify({
          port: options.serverPort,
          adminUsername: options.adminUser,
          adminPassword: options.adminPassword,
          autoStart: true,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      return { 
        success: true, 
        message: result.message || 'Icecast server installed and configured successfully' 
      };
    } catch (error) {
      console.error("Error installing built-in server:", error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Unknown error occurred during installation' 
      };
    }
  },
  
  async getInstallationStatus(): Promise<{ 
    installed: boolean; 
    version?: string;
    configPath?: string;
    port?: number;
    status?: string;
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
  },

  async updateInstallation(): Promise<{ success: boolean, message?: string }> {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/update-installation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      return { 
        success: true, 
        message: result.message || 'Installation updated successfully' 
      };
    } catch (error) {
      console.error("Error updating installation:", error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Unknown error occurred during update' 
      };
    }
  }
};
