
import { fetchApi } from './apiUtils';
import { ApiResponse } from '@/types/icecast';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  user?: {
    username: string;
    role: string;
  };
}

export async function login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
  const encoded = btoa(`${credentials.username}:${credentials.password}`);
  
  return fetchApi<LoginResponse>('/auth/login', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${encoded}`,
    },
  });
}

export async function validateAuth(): Promise<ApiResponse<{ valid: boolean }>> {
  const auth = localStorage.getItem('icecast_auth');
  
  if (!auth) {
    return {
      success: false,
      error: 'No authentication token found'
    };
  }

  return fetchApi<{ valid: boolean }>('/auth/validate', {
    headers: {
      'Authorization': `Basic ${auth}`,
    },
  });
}
