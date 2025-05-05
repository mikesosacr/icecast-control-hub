
import { fetchApi } from './apiUtils';
import { ServerStatus, ServerStats } from '@/types/icecast';

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
