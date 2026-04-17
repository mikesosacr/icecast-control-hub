
import { fetchApi } from './apiUtils';
import { MountPoint, ApiResponse } from '@/types/icecast';

const getAuthHeaders = (): Record<string, string> => {
  const auth = localStorage.getItem('icecast_auth');
  return auth ? { 'Authorization': `Basic ${auth}` } : {};
};

export async function getMountpoints(serverId: string = 'local'): Promise<ApiResponse<MountPoint[]>> {
  return fetchApi<MountPoint[]>(`/servers/${serverId}/mountpoints`, {
    headers: getAuthHeaders(),
  });
}

export async function getMountpoint(serverId: string = 'local', mountpointId: string): Promise<ApiResponse<MountPoint>> {
  return fetchApi<MountPoint>(`/servers/${serverId}/mountpoints/${mountpointId}`, {
    headers: getAuthHeaders(),
  });
}

export async function createMountpoint(serverId: string = 'local', mountpoint: Omit<MountPoint, 'id'>): Promise<ApiResponse<MountPoint>> {
  return fetchApi<MountPoint>(`/servers/${serverId}/mountpoints`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(mountpoint),
  });
}

export async function updateMountpoint(serverId: string = 'local', mountpointId: string, mountpoint: Partial<MountPoint>): Promise<ApiResponse<MountPoint>> {
  return fetchApi<MountPoint>(`/servers/${serverId}/mountpoints/${mountpointId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(mountpoint),
  });
}

export async function deleteMountpoint(serverId: string = 'local', mountpointId: string): Promise<ApiResponse<void>> {
  return fetchApi<void>(`/servers/${serverId}/mountpoints/${mountpointId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
}

export async function toggleMountpointVisibility(serverId: string = 'local', mountpointId: string, isPublic: boolean): Promise<ApiResponse<MountPoint>> {
  return updateMountpoint(serverId, mountpointId, { isPublic });
}

export async function getListeners(serverId: string = 'local', mountpointId?: string): Promise<ApiResponse<{ current: number; peak: number }>> {
  const path = mountpointId 
    ? `/servers/${serverId}/mountpoints/${mountpointId}/listeners`
    : `/servers/${serverId}/listeners`;
  return fetchApi<{ current: number; peak: number }>(path, {
    headers: getAuthHeaders(),
  });
}

export async function disconnectListener(serverId: string = 'local', mountpointId: string, listenerId: string): Promise<ApiResponse<void>> {
  return fetchApi<void>(`/servers/${serverId}/mountpoints/${mountpointId}/listeners/${listenerId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
}
