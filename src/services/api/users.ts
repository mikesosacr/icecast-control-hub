
import { fetchApi } from './apiUtils';
import { User } from '@/types/icecast';

export async function getUsers(serverId: string = 'local'): Promise<ApiResponse<User[]>> {
  return fetchApi<User[]>(`/servers/${serverId}/users`);
}

export async function getUser(serverId: string = 'local', userId: string): Promise<ApiResponse<User>> {
  return fetchApi<User>(`/servers/${serverId}/users/${userId}`);
}

export async function createUser(serverId: string = 'local', user: Omit<User, 'id'>): Promise<ApiResponse<User>> {
  return fetchApi<User>(`/servers/${serverId}/users`, {
    method: 'POST',
    body: JSON.stringify(user),
  });
}

export async function updateUser(serverId: string = 'local', userId: string, user: Partial<User>): Promise<ApiResponse<User>> {
  return fetchApi<User>(`/servers/${serverId}/users/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(user),
  });
}

export async function deleteUser(serverId: string = 'local', userId: string): Promise<ApiResponse<void>> {
  return fetchApi<void>(`/servers/${serverId}/users/${userId}`, {
    method: 'DELETE',
  });
}
