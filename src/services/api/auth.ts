import { ApiResponse } from '@/types/icecast';
import { API_BASE_URL } from './apiUtils';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  user?: {
    id?: string;
    username: string;
    role: string;
    allowedMountpoints?: string[];
    mountpoints?: any[];
  };
}

export function isFirstLogin(): boolean {
  return !localStorage.getItem('icecast_custom_credentials');
}

export function updateCredentials(username: string, password: string): void {
  localStorage.setItem('icecast_custom_credentials', JSON.stringify({ username, password }));
}

export async function login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
  try {
    const encoded = btoa(`${credentials.username}:${credentials.password}`);
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${encoded}`,
        'Content-Type': 'application/json',
      },
    });
    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        data: {
          success: true,
          message: data.message || 'Login successful',
          user: data.user,
        },
      };
    }
  } catch {}
  return {
    success: false,
    error: 'Credenciales inválidas',
  };
}

export async function validateAuth(): Promise<ApiResponse<{ valid: boolean }>> {
  const auth = localStorage.getItem('icecast_auth');
  if (!auth) return { success: false, error: 'No authentication token found' };
  return { success: true, data: { valid: true } };
}
