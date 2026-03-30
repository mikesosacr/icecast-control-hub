
import { fetchApi } from './apiUtils';
import { User, ApiResponse } from '@/types/icecast';

const getAuthHeaders = (): Record<string, string> => {
  const auth = localStorage.getItem('icecast_auth');
  return auth ? { 'Authorization': `Basic ${auth}` } : {};
};

export async function getUsers(serverId: string = 'local'): Promise<ApiResponse<User[]>> {
  return fetchApi<User[]>('/users', {
    headers: getAuthHeaders(),
  });
}

export async function getUser(serverId: string = 'local', userId: string): Promise<ApiResponse<User>> {
  return fetchApi<User>(`/users/${userId}`, {
    headers: getAuthHeaders(),
  });
}

export async function createUser(serverId: string = 'local', user: Omit<User, 'id'>): Promise<ApiResponse<User>> {
  return fetchApi<User>('/users', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(user),
  });
}

export async function updateUser(serverId: string = 'local', userId: string, user: Partial<User>): Promise<ApiResponse<User>> {
  return fetchApi<User>(`/users/${userId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(user),
  });
}

export async function deleteUser(serverId: string = 'local', userId: string): Promise<ApiResponse<void>> {
  return fetchApi<void>(`/users/${userId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
}
