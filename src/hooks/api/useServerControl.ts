
import { useQuery, useMutation } from '@tanstack/react-query';
import * as api from '@/services/api';
import { handleApiSuccess, queryClient } from './useApiBase';
import { ServerStatus } from '@/types/icecast';

// Server statistics
export function useServerStats(serverId = 'local') {
  return useQuery({
    queryKey: ['serverStats', serverId],
    queryFn: () => api.getServerStats(serverId),
    refetchInterval: 5000, // Refresh every 5 seconds
  });
}

// Server control
export function useServerControl() {
  // queryClient is now imported from useApiBase
  
  const startMutation = useMutation({
    mutationFn: (serverId: string = 'local') => api.startServer(serverId),
    onSuccess: (data, serverId) => {
      queryClient.invalidateQueries({ queryKey: ['serverStats', serverId] });
      handleApiSuccess('Server started successfully');
    },
    onError: (error) => {
      console.error(`Failed to start server:`, error);
    },
  });
  
  const stopMutation = useMutation({
    mutationFn: (serverId: string = 'local') => api.stopServer(serverId),
    onSuccess: (data, serverId) => {
      queryClient.invalidateQueries({ queryKey: ['serverStats', serverId] });
      handleApiSuccess('Server stopped successfully');
    },
    onError: (error) => {
      console.error(`Failed to stop server:`, error);
    },
  });
  
  const restartMutation = useMutation({
    mutationFn: (serverId: string = 'local') => api.restartServer(serverId),
    onSuccess: (data, serverId) => {
      queryClient.invalidateQueries({ queryKey: ['serverStats', serverId] });
      handleApiSuccess('Server restarted successfully');
    },
    onError: (error) => {
      console.error(`Failed to restart server:`, error);
    },
  });
  
  return {
    startServer: startMutation.mutate,
    stopServer: stopMutation.mutate,
    restartServer: restartMutation.mutate,
    isStarting: startMutation.isPending,
    isStopping: stopMutation.isPending,
    isRestarting: restartMutation.isPending,
  };
}
