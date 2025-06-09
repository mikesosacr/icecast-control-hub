
import { fetchApi } from './apiUtils';
import { ServerStats, ApiResponse } from '@/types/icecast';

export async function getServerStats(serverId: string = 'local'): Promise<ApiResponse<ServerStats>> {
  const auth = localStorage.getItem('icecast_auth');
  return fetchApi<ServerStats>(`/server/stats`, {
    headers: auth ? { 'Authorization': `Basic ${auth}` } : {},
  });
}

export async function startServer(serverId: string = 'local'): Promise<ApiResponse<void>> {
  const auth = localStorage.getItem('icecast_auth');
  return fetchApi<void>(`/server/start`, {
    method: 'POST',
    headers: auth ? { 'Authorization': `Basic ${auth}` } : {},
  });
}

export async function stopServer(serverId: string = 'local'): Promise<ApiResponse<void>> {
  const auth = localStorage.getItem('icecast_auth');
  return fetchApi<void>(`/server/stop`, {
    method: 'POST',
    headers: auth ? { 'Authorization': `Basic ${auth}` } : {},
  });
}

export async function restartServer(serverId: string = 'local'): Promise<ApiResponse<void>> {
  const auth = localStorage.getItem('icecast_auth');
  return fetchApi<void>(`/server/restart`, {
    method: 'POST',
    headers: auth ? { 'Authorization': `Basic ${auth}` } : {},
  });
}

export async function getServerHealth(): Promise<ApiResponse<{ status: string; available: boolean; configPath?: string; port?: number }>> {
  return fetchApi<{ status: string; available: boolean; configPath?: string; port?: number }>(`/server-health`);
}

export async function installServer(): Promise<ApiResponse<{ message: string; installed: boolean }>> {
  const auth = localStorage.getItem('icecast_auth');
  return fetchApi<{ message: string; installed: boolean }>('/server/install', {
    method: 'POST',
    headers: auth ? { 'Authorization': `Basic ${auth}` } : {},
  });
}
