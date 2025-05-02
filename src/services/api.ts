
import { 
  IcecastServer, 
  MountPoint, 
  User, 
  Listener, 
  LogEntry, 
  ServerStats, 
  ServerStatus,
  ApiResponse 
} from '@/types/icecast';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Utility function for making API requests
async function fetchApi<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
    };

    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || `Error: ${response.status} ${response.statusText}`,
      };
    }

    return {
      success: true,
      data: data as T,
    };
  } catch (error) {
    console.error('API request failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

// Server management
export async function getServerStatus(serverId: string = 'local'): Promise<ApiResponse<{ status: ServerStatus }>> {
  return fetchApi<{ status: ServerStatus }>(`/servers/${serverId}/status`);
}

export async function startServer(serverId: string = 'local'): Promise<ApiResponse<{ status: ServerStatus }>> {
  return fetchApi<{ status: ServerStatus }>(`/servers/${serverId}/start`, { method: 'POST' });
}

export async function stopServer(serverId: string = 'local'): Promise<ApiResponse<{ status: ServerStatus }>> {
  return fetchApi<{ status: ServerStatus }>(`/servers/${serverId}/stop`, { method: 'POST' });
}

export async function restartServer(serverId: string = 'local'): Promise<ApiResponse<{ status: ServerStatus }>> {
  return fetchApi<{ status: ServerStatus }>(`/servers/${serverId}/restart`, { method: 'POST' });
}

// Statistics
export async function getServerStats(serverId: string = 'local'): Promise<ApiResponse<ServerStats>> {
  return fetchApi<ServerStats>(`/servers/${serverId}/stats`);
}

// Mountpoints
export async function getMountpoints(serverId: string = 'local'): Promise<ApiResponse<MountPoint[]>> {
  return fetchApi<MountPoint[]>(`/servers/${serverId}/mountpoints`);
}

export async function getMountpoint(serverId: string = 'local', mountpointId: string): Promise<ApiResponse<MountPoint>> {
  return fetchApi<MountPoint>(`/servers/${serverId}/mountpoints/${mountpointId}`);
}

export async function createMountpoint(serverId: string = 'local', mountpoint: Omit<MountPoint, 'id'>): Promise<ApiResponse<MountPoint>> {
  return fetchApi<MountPoint>(`/servers/${serverId}/mountpoints`, {
    method: 'POST',
    body: JSON.stringify(mountpoint),
  });
}

export async function updateMountpoint(serverId: string = 'local', mountpointId: string, mountpoint: Partial<MountPoint>): Promise<ApiResponse<MountPoint>> {
  return fetchApi<MountPoint>(`/servers/${serverId}/mountpoints/${mountpointId}`, {
    method: 'PUT',
    body: JSON.stringify(mountpoint),
  });
}

export async function deleteMountpoint(serverId: string = 'local', mountpointId: string): Promise<ApiResponse<void>> {
  return fetchApi<void>(`/servers/${serverId}/mountpoints/${mountpointId}`, {
    method: 'DELETE',
  });
}

export async function toggleMountpointVisibility(serverId: string = 'local', mountpointId: string, isPublic: boolean): Promise<ApiResponse<MountPoint>> {
  return fetchApi<MountPoint>(`/servers/${serverId}/mountpoints/${mountpointId}/visibility`, {
    method: 'PUT',
    body: JSON.stringify({ isPublic }),
  });
}

// Listeners
export async function getListeners(serverId: string = 'local', mountpointId?: string): Promise<ApiResponse<Listener[]>> {
  const endpoint = mountpointId 
    ? `/servers/${serverId}/mountpoints/${mountpointId}/listeners` 
    : `/servers/${serverId}/listeners`;
  
  return fetchApi<Listener[]>(endpoint);
}

// Users
export async function getUsers(serverId: string = 'local'): Promise<ApiResponse<User[]>> {
  return fetchApi<User[]>(`/servers/${serverId}/users`);
}

export async function getUser(serverId: string = 'local', userId: string): Promise<ApiResponse<User>> {
  return fetchApi<User>(`/servers/${serverId}/users/${userId}`);
}

export async function createUser(serverId: string = 'local', user: Omit<User, 'id'>): Promise<ApiResponse<User>> {
  return fetchApi<User>(`/servers/${serverId}/users`, {
    method: 'POST',
    body: JSON.stringify(user),
  });
}

export async function updateUser(serverId: string = 'local', userId: string, user: Partial<User>): Promise<ApiResponse<User>> {
  return fetchApi<User>(`/servers/${serverId}/users/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(user),
  });
}

export async function deleteUser(serverId: string = 'local', userId: string): Promise<ApiResponse<void>> {
  return fetchApi<void>(`/servers/${serverId}/users/${userId}`, {
    method: 'DELETE',
  });
}

// Logs
export async function getLogs(serverId: string = 'local', filters?: {
  level?: 'info' | 'warning' | 'error',
  source?: string,
  query?: string
}): Promise<ApiResponse<LogEntry[]>> {
  const queryParams = new URLSearchParams();
  
  if (filters) {
    if (filters.level) queryParams.append('level', filters.level);
    if (filters.source) queryParams.append('source', filters.source);
    if (filters.query) queryParams.append('query', filters.query);
  }

  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
  
  return fetchApi<LogEntry[]>(`/servers/${serverId}/logs${queryString}`);
}

// Server configuration
export async function getConfig(serverId: string = 'local'): Promise<ApiResponse<string>> {
  return fetchApi<string>(`/servers/${serverId}/config`);
}

export async function updateConfig(serverId: string = 'local', config: string): Promise<ApiResponse<void>> {
  return fetchApi<void>(`/servers/${serverId}/config`, {
    method: 'PUT',
    body: JSON.stringify({ config }),
  });
}

// Remote servers
export async function getServers(): Promise<ApiResponse<IcecastServer[]>> {
  return fetchApi<IcecastServer[]>('/servers');
}

export async function addServer(server: Omit<IcecastServer, 'id' | 'status'>): Promise<ApiResponse<IcecastServer>> {
  return fetchApi<IcecastServer>('/servers', {
    method: 'POST',
    body: JSON.stringify(server),
  });
}

export async function updateServer(serverId: string, server: Partial<IcecastServer>): Promise<ApiResponse<IcecastServer>> {
  return fetchApi<IcecastServer>(`/servers/${serverId}`, {
    method: 'PUT',
    body: JSON.stringify(server),
  });
}

export async function deleteServer(serverId: string): Promise<ApiResponse<void>> {
  return fetchApi<void>(`/servers/${serverId}`, {
    method: 'DELETE',
  });
}
