
import { fetchApi } from './apiUtils';
import { ServerStats, ApiResponse } from '@/types/icecast';

export async function getServerStats(serverId: string = 'local'): Promise<ApiResponse<ServerStats>> {
  return fetchApi<ServerStats>(`/server/stats`);
}

export async function startServer(serverId: string = 'local'): Promise<ApiResponse<void>> {
  return fetchApi<void>(`/server/start`, {
    method: 'POST',
  });
}

export async function stopServer(serverId: string = 'local'): Promise<ApiResponse<void>> {
  return fetchApi<void>(`/server/stop`, {
    method: 'POST',
  });
}

export async function restartServer(serverId: string = 'local'): Promise<ApiResponse<void>> {
  return fetchApi<void>(`/server/restart`, {
    method: 'POST',
  });
}

export async function getServerHealth(): Promise<ApiResponse<{ status: string; available: boolean; configPath?: string; port?: number }>> {
  return fetchApi<{ status: string; available: boolean; configPath?: string; port?: number }>(`/server-health`);
}
