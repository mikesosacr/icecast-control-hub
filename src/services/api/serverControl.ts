
import { fetchApi } from './apiUtils';
import { ServerStats, ApiResponse } from '@/types/icecast';

const getAuthHeaders = (): Record<string, string> => {
  const auth = localStorage.getItem('icecast_auth');
  return auth ? { 'Authorization': `Basic ${auth}` } : {};
};

export async function getServerStats(serverId: string = 'local'): Promise<ApiResponse<ServerStats>> {
  return fetchApi<ServerStats>(`/servers/${serverId}/stats`, {
    headers: getAuthHeaders(),
  });
}

export async function startServer(serverId: string = 'local'): Promise<ApiResponse<void>> {
  return fetchApi<void>(`/servers/${serverId}/start`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
}

export async function stopServer(serverId: string = 'local'): Promise<ApiResponse<void>> {
  return fetchApi<void>(`/servers/${serverId}/stop`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
}

export async function restartServer(serverId: string = 'local'): Promise<ApiResponse<void>> {
  return fetchApi<void>(`/servers/${serverId}/restart`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
}

export async function getServerHealth(): Promise<ApiResponse<{ status: string; available: boolean; configPath?: string; port?: number }>> {
  return fetchApi<{ status: string; available: boolean; configPath?: string; port?: number }>('/server-health');
}

export async function installServer(): Promise<ApiResponse<{ message: string; installed: boolean }>> {
  return fetchApi<{ message: string; installed: boolean }>('/install-server', {
    method: 'POST',
    headers: getAuthHeaders(),
  });
}
