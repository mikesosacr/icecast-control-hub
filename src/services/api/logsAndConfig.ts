
import { fetchApi } from './apiUtils';
import { LogEntry, ApiResponse } from '@/types/icecast';

interface LogFilters {
  level?: 'info' | 'warning' | 'error';
  source?: string;
  query?: string;
}

export async function getLogs(serverId: string = 'local', filters?: LogFilters): Promise<ApiResponse<LogEntry[]>> {
  // Build query parameters
  const params = new URLSearchParams();
  if (filters?.level) params.append('level', filters.level);
  if (filters?.source) params.append('source', filters.source);
  if (filters?.query) params.append('query', filters.query);

  const queryString = params.toString() ? `?${params.toString()}` : '';
  
  return fetchApi<LogEntry[]>(`/servers/${serverId}/logs${queryString}`);
}

export async function getConfig(serverId: string = 'local'): Promise<ApiResponse<string>> {
  return fetchApi<string>(`/servers/${serverId}/config`);
}

export async function updateConfig(serverId: string = 'local', config: string): Promise<ApiResponse<void>> {
  return fetchApi<void>(`/servers/${serverId}/config`, {
    method: 'PUT',
    body: JSON.stringify({ config }),
  });
}
