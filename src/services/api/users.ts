
import { fetchApi } from './apiUtils';
import { User, ApiResponse } from '@/types/icecast';

export async function getUsers(serverId: string = 'local'): Promise<ApiResponse<User[]>> {
  const auth = localStorage.getItem('icecast_auth');
  return fetchApi<User[]>(`/users`, {
    headers: auth ? { 'Authorization': `Basic ${auth}` } : {},
  });
}

export async function getUser(serverId: string = 'local', userId: string): Promise<ApiResponse<User>> {
  const auth = localStorage.getItem('icecast_auth');
  return fetchApi<User>(`/users/${userId}`, {
    headers: auth ? { 'Authorization': `Basic ${auth}` } : {},
  });
}

export async function createUser(serverId: string = 'local', user: Omit<User, 'id'>): Promise<ApiResponse<User>> {
  const auth = localStorage.getItem('icecast_auth');
  return fetchApi<User>(`/users`, {
    method: 'POST',
    headers: auth ? { 'Authorization': `Basic ${auth}` } : {},
    body: JSON.stringify(user),
  });
}

export async function updateUser(serverId: string = 'local', userId: string, user: Partial<User>): Promise<ApiResponse<User>> {
  const auth = localStorage.getItem('icecast_auth');
  return fetchApi<User>(`/users/${userId}`, {
    method: 'PUT',
    headers: auth ? { 'Authorization': `Basic ${auth}` } : {},
    body: JSON.stringify(user),
  });
}

export async function deleteUser(serverId: string = 'local', userId: string): Promise<ApiResponse<void>> {
  const auth = localStorage.getItem('icecast_auth');
  return fetchApi<void>(`/users/${userId}`, {
    method: 'DELETE',
    headers: auth ? { 'Authorization': `Basic ${auth}` } : {},
  });
}
