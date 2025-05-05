
import { fetchApi } from './apiUtils';
import { IcecastServer, ApiResponse } from '@/types/icecast';

// Export IcecastServer type to fix type error in useIcecastApi
export type { IcecastServer };

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
