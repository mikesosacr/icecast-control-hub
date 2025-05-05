
import { useQuery, useMutation } from '@tanstack/react-query';
import * as api from '@/services/api';
import { MountPoint } from '@/types/icecast';
import { createMutationHandlers, queryClient } from './useApiBase';

// Mountpoints list
export function useMountpoints(serverId = 'local') {
  return useQuery({
    queryKey: ['mountpoints', serverId],
    queryFn: () => api.getMountpoints(serverId),
    refetchInterval: 10000, // Refresh every 10 seconds
  });
}

// Single mountpoint
export function useMountpoint(serverId = 'local', mountpointId: string) {
  return useQuery({
    queryKey: ['mountpoint', serverId, mountpointId],
    queryFn: () => api.getMountpoint(serverId, mountpointId),
    enabled: !!mountpointId,
  });
}

// Mountpoint mutations (create, update, delete, toggle visibility)
export function useMountpointMutations() {
  const queryClient = queryClient;
  
  const createMutation = useMutation({
    mutationFn: ({ serverId = 'local', mountpoint }: { serverId?: string, mountpoint: Omit<MountPoint, 'id'> }) => 
      api.createMountpoint(serverId, mountpoint),
    onSuccess: (data, { serverId }) => {
      queryClient.invalidateQueries({ queryKey: ['mountpoints', serverId] });
    },
  });
  
  const updateMutation = useMutation({
    mutationFn: ({ serverId = 'local', mountpointId, mountpoint }: 
      { serverId?: string, mountpointId: string, mountpoint: Partial<MountPoint> }) => 
      api.updateMountpoint(serverId, mountpointId, mountpoint),
    onSuccess: (data, { serverId, mountpointId }) => {
      queryClient.invalidateQueries({ queryKey: ['mountpoints', serverId] });
      queryClient.invalidateQueries({ queryKey: ['mountpoint', serverId, mountpointId] });
    },
  });
  
  const deleteMutation = useMutation({
    mutationFn: ({ serverId = 'local', mountpointId }: { serverId?: string, mountpointId: string }) => 
      api.deleteMountpoint(serverId, mountpointId),
    onSuccess: (data, { serverId }) => {
      queryClient.invalidateQueries({ queryKey: ['mountpoints', serverId] });
    },
  });
  
  const toggleVisibilityMutation = useMutation({
    mutationFn: ({ serverId = 'local', mountpointId, isPublic }: 
      { serverId?: string, mountpointId: string, isPublic: boolean }) => 
      api.toggleMountpointVisibility(serverId, mountpointId, isPublic),
    onSuccess: (data, { serverId, mountpointId }) => {
      queryClient.invalidateQueries({ queryKey: ['mountpoints', serverId] });
      queryClient.invalidateQueries({ queryKey: ['mountpoint', serverId, mountpointId] });
    },
  });
  
  return {
    createMountpoint: (params: { serverId?: string, mountpoint: Omit<MountPoint, 'id'> }, 
                       options?: { onSuccess?: () => void, onError?: (error: unknown) => void }) => {
      createMutation.mutate(params, createMutationHandlers('Mountpoint created successfully', options));
    },
    updateMountpoint: (params: { serverId?: string, mountpointId: string, mountpoint: Partial<MountPoint> }) => {
      updateMutation.mutate(params, createMutationHandlers('Mountpoint updated successfully'));
    },
    deleteMountpoint: (params: { serverId?: string, mountpointId: string }) => {
      deleteMutation.mutate(params, createMutationHandlers('Mountpoint deleted successfully'));
    },
    toggleMountpointVisibility: (params: { serverId?: string, mountpointId: string, isPublic: boolean }) => {
      toggleVisibilityMutation.mutate(params, createMutationHandlers('Mountpoint visibility updated'));
    },
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isTogglingVisibility: toggleVisibilityMutation.isPending,
  };
}

// Listeners
export function useListeners(serverId = 'local', mountpointId?: string) {
  return useQuery({
    queryKey: ['listeners', serverId, mountpointId].filter(Boolean),
    queryFn: () => api.getListeners(serverId, mountpointId),
    refetchInterval: 5000, // Refresh every 5 seconds
  });
}
