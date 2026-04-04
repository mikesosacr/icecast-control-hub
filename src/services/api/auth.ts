
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
    username: string;
    role: string;
  };
}

const DEFAULT_USERNAME = 'admin';
const DEFAULT_PASSWORD = 'admin';

export function getStoredCredentials(): { username: string; password: string } | null {
  const custom = localStorage.getItem('icecast_custom_credentials');
  if (custom) {
    try {
      return JSON.parse(custom);
    } catch {
      return null;
    }
  }
  return null;
}

export function isFirstLogin(): boolean {
  return !localStorage.getItem('icecast_custom_credentials');
}

export function updateCredentials(username: string, password: string): void {
  localStorage.setItem('icecast_custom_credentials', JSON.stringify({ username, password }));
}

export async function login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
  // Try backend first
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
      return {
        success: true,
        data: {
          success: true,
          message: 'Login successful',
          user: { username: credentials.username, role: 'admin' },
        },
      };
    }
  } catch {
    // Backend not available, fall through to local auth
  }

  // Local auth fallback
  const stored = getStoredCredentials();
  const validUser = stored ? stored.username : DEFAULT_USERNAME;
  const validPass = stored ? stored.password : DEFAULT_PASSWORD;

  if (credentials.username === validUser && credentials.password === validPass) {
    return {
      success: true,
      data: {
        success: true,
        message: 'Login successful',
        user: { username: credentials.username, role: 'admin' },
      },
    };
  }

  return {
    success: false,
    error: 'Credenciales inválidas',
  };
}

export async function validateAuth(): Promise<ApiResponse<{ valid: boolean }>> {
  const auth = localStorage.getItem('icecast_auth');
  if (!auth) {
    return { success: false, error: 'No authentication token found' };
  }
  return { success: true, data: { valid: true } };
}
