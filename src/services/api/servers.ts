
import { fetchApi } from './apiUtils';
import { IcecastServer, ApiResponse } from '@/types/icecast';

export type { IcecastServer };

export async function getServers(): Promise<ApiResponse<IcecastServer[]>> {
  const auth = localStorage.getItem('icecast_auth');
  return fetchApi<IcecastServer[]>('/servers', {
    headers: auth ? { 'Authorization': `Basic ${auth}` } : {},
  });
}

export async function addServer(server: Omit<IcecastServer, 'id' | 'status'>): Promise<ApiResponse<IcecastServer>> {
  const auth = localStorage.getItem('icecast_auth');
  return fetchApi<IcecastServer>('/servers', {
    method: 'POST',
    headers: auth ? { 'Authorization': `Basic ${auth}` } : {},
    body: JSON.stringify(server),
  });
}

export async function updateServer(serverId: string, server: Partial<IcecastServer>): Promise<ApiResponse<IcecastServer>> {
  const auth = localStorage.getItem('icecast_auth');
  return fetchApi<IcecastServer>(`/servers/${serverId}`, {
    method: 'PUT',
    headers: auth ? { 'Authorization': `Basic ${auth}` } : {},
    body: JSON.stringify(server),
  });
}

export async function deleteServer(serverId: string): Promise<ApiResponse<void>> {
  const auth = localStorage.getItem('icecast_auth');
  return fetchApi<void>(`/servers/${serverId}`, {
    method: 'DELETE',
    headers: auth ? { 'Authorization': `Basic ${auth}` } : {},
  });
}
