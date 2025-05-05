
import { fetchApi } from './apiUtils';
import { MountPoint, Listener } from '@/types/icecast';

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
