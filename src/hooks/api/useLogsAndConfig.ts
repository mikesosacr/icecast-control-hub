
import { useQuery, useMutation } from '@tanstack/react-query';
import * as api from '@/services/api';
import { createMutationHandlers, queryClient } from './useApiBase';

// Logs
export function useLogs(serverId = 'local', filters?: {
  level?: 'info' | 'warning' | 'error',
  source?: string,
  query?: string
}) {
  return useQuery({
    queryKey: ['logs', serverId, filters],
    queryFn: () => api.getLogs(serverId, filters),
    refetchInterval: 10000, // Refresh every 10 seconds
  });
}

// Configuration
export function useConfig(serverId = 'local') {
  return useQuery({
    queryKey: ['config', serverId],
    queryFn: () => api.getConfig(serverId),
  });
}

export function useConfigMutation() {
  const updateMutation = useMutation({
    mutationFn: ({ serverId = 'local', config }: { serverId?: string, config: string }) => 
      api.updateConfig(serverId, config),
    onSuccess: (data, { serverId }) => {
      queryClient.invalidateQueries({ queryKey: ['config', serverId] });
    },
  });
  
  return {
    updateConfig: (params: { serverId?: string, config: string }) => {
      updateMutation.mutate(params, createMutationHandlers('Configuration updated successfully'));
    },
    isUpdating: updateMutation.isPending,
  };
}
