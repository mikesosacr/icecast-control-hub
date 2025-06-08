
import { fetchApi } from './apiUtils';
import { IcecastServer, ApiResponse } from '@/types/icecast';

// Export IcecastServer type to fix type error in useIcecastApi
export type { IcecastServer };

// Mock data for when backend is not available
const mockServers: IcecastServer[] = [
  {
    id: 'local',
    name: 'Local Icecast Server',
    host: 'localhost',
    port: 8000,
    adminUsername: 'admin',
    adminPassword: 'hackme',
    isLocal: true,
    status: 'online'
  },
  {
    id: 'remote-1',
    name: 'Production Server',
    host: 'radio.example.com',
    port: 8000,
    adminUsername: 'admin',
    adminPassword: 'secure123',
    isLocal: false,
    status: 'offline'
  }
];

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function getServers(): Promise<ApiResponse<IcecastServer[]>> {
  try {
    const result = await fetchApi<IcecastServer[]>('/servers');
    return result;
  } catch (error) {
    // Fallback to mock data when API is not available
    console.log('API not available, using mock data for servers');
    await delay(500); // Simulate network delay
    return {
      success: true,
      data: [...mockServers]
    };
  }
}

export async function addServer(server: Omit<IcecastServer, 'id' | 'status'>): Promise<ApiResponse<IcecastServer>> {
  try {
    const result = await fetchApi<IcecastServer>('/servers', {
      method: 'POST',
      body: JSON.stringify(server),
    });
    return result;
  } catch (error) {
    // Fallback: simulate adding to mock data
    console.log('API not available, simulating server addition');
    await delay(800);
    
    const newServer: IcecastServer = {
      ...server,
      id: `server-${Date.now()}`,
      status: 'offline' // Default status for new servers
    };
    
    mockServers.push(newServer);
    
    return {
      success: true,
      data: newServer
    };
  }
}

export async function updateServer(serverId: string, server: Partial<IcecastServer>): Promise<ApiResponse<IcecastServer>> {
  try {
    const result = await fetchApi<IcecastServer>(`/servers/${serverId}`, {
      method: 'PUT',
      body: JSON.stringify(server),
    });
    return result;
  } catch (error) {
    // Fallback: simulate updating mock data
    console.log('API not available, simulating server update');
    await delay(600);
    
    const serverIndex = mockServers.findIndex(s => s.id === serverId);
    if (serverIndex !== -1) {
      mockServers[serverIndex] = { ...mockServers[serverIndex], ...server };
      return {
        success: true,
        data: mockServers[serverIndex]
      };
    }
    
    return {
      success: false,
      error: 'Server not found'
    };
  }
}

export async function deleteServer(serverId: string): Promise<ApiResponse<void>> {
  try {
    const result = await fetchApi<void>(`/servers/${serverId}`, {
      method: 'DELETE',
    });
    return result;
  } catch (error) {
    // Fallback: simulate deleting from mock data
    console.log('API not available, simulating server deletion');
    await delay(400);
    
    const serverIndex = mockServers.findIndex(s => s.id === serverId);
    if (serverIndex !== -1) {
      mockServers.splice(serverIndex, 1);
      return {
        success: true
      };
    }
    
    return {
      success: false,
      error: 'Server not found'
    };
  }
}
