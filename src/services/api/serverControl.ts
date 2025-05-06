
import { fetchApi } from './apiUtils';
import { ServerStats, ApiResponse } from '@/types/icecast';

export interface ServerStatus {
  status: 'running' | 'stopped';
}

export async function getServerStatus(serverId: string = 'local'): Promise<ApiResponse<ServerStatus>> {
  return fetchApi<ServerStatus>(`/servers/${serverId}/status`);
}

export async function startServer(serverId: string = 'local'): Promise<ApiResponse<void>> {
  return fetchApi<void>(`/servers/${serverId}/start`, { method: 'POST' });
}

export async function stopServer(serverId: string = 'local'): Promise<ApiResponse<void>> {
  return fetchApi<void>(`/servers/${serverId}/stop`, { method: 'POST' });
}

export async function restartServer(serverId: string = 'local'): Promise<ApiResponse<void>> {
  return fetchApi<void>(`/servers/${serverId}/restart`, { method: 'POST' });
}

export async function getServerStats(serverId: string = 'local'): Promise<ApiResponse<ServerStats>> {
  return fetchApi<ServerStats>(`/servers/${serverId}/stats`);
}
