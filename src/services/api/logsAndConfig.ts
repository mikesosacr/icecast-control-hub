
import { fetchApi } from './apiUtils';
import { LogEntry } from '@/types/icecast';

// Logs
export async function getLogs(serverId: string = 'local', filters?: {
  level?: 'info' | 'warning' | 'error',
  source?: string,
  query?: string
}): Promise<ApiResponse<LogEntry[]>> {
  const queryParams = new URLSearchParams();
  
  if (filters) {
    if (filters.level) queryParams.append('level', filters.level);
    if (filters.source) queryParams.append('source', filters.source);
    if (filters.query) queryParams.append('query', filters.query);
  }

  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
  
  return fetchApi<LogEntry[]>(`/servers/${serverId}/logs${queryString}`);
}

// Server configuration
export async function getConfig(serverId: string = 'local'): Promise<ApiResponse<string>> {
  return fetchApi<string>(`/servers/${serverId}/config`);
}

export async function updateConfig(serverId: string = 'local', config: string): Promise<ApiResponse<void>> {
  return fetchApi<void>(`/servers/${serverId}/config`, {
    method: 'PUT',
    body: JSON.stringify({ config }),
  });
}
