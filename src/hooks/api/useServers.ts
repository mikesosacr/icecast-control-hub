
import { useQuery, useMutation } from '@tanstack/react-query';
import * as api from '@/services/api';
import { IcecastServer } from '@/services/api';
import { createMutationHandlers, queryClient } from './useApiBase';

// Servers list
export function useServers() {
  return useQuery({
    queryKey: ['servers'],
    queryFn: () => api.getServers(),
  });
}

// Server mutations (add, update, delete)
export function useServerMutations() {
  // queryClient is now imported from useApiBase
  
  const addMutation = useMutation({
    mutationFn: (server: Omit<IcecastServer, 'id' | 'status'>) => api.addServer(server),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['servers'] });
    },
  });
  
  const updateMutation = useMutation({
    mutationFn: ({ serverId, server }: { serverId: string, server: Partial<IcecastServer> }) => 
      api.updateServer(serverId, server),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['servers'] });
    },
  });
  
  const deleteMutation = useMutation({
    mutationFn: (serverId: string) => api.deleteServer(serverId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['servers'] });
    },
  });
  
  return {
    addServer: (server: Omit<IcecastServer, 'id' | 'status'>) => {
      addMutation.mutate(server, createMutationHandlers('Server added successfully'));
    },
    updateServer: (params: { serverId: string, server: Partial<IcecastServer> }) => {
      updateMutation.mutate(params, createMutationHandlers('Server updated successfully'));
    },
    deleteServer: (serverId: string) => {
      deleteMutation.mutate(serverId, createMutationHandlers('Server removed successfully'));
    },
    isAdding: addMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
