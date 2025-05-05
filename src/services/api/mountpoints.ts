
import { fetchApi } from './apiUtils';
import { MountPoint, ApiResponse } from '@/types/icecast';

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

export async function getListeners(serverId: string = 'local', mountpointId: string): Promise<ApiResponse<{ current: number; peak: number }>> {
  return fetchApi<{ current: number; peak: number }>(`/servers/${serverId}/mountpoints/${mountpointId}/listeners`);
}

export async function disconnectListener(serverId: string = 'local', mountpointId: string, listenerId: string): Promise<ApiResponse<void>> {
  return fetchApi<void>(`/servers/${serverId}/mountpoints/${mountpointId}/listeners/${listenerId}`, {
    method: 'DELETE',
  });
}
