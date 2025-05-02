import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '@/services/api';
import { toast } from 'sonner';
import { MountPoint, User, ServerStatus, IcecastServer } from '@/types/icecast';

// Server status
export function useServerStatus(serverId = 'local') {
  return useQuery({
    queryKey: ['serverStatus', serverId],
    queryFn: () => api.getServerStatus(serverId),
    refetchInterval: 10000, // Refresh every 10 seconds
  });
}

// Server control
export function useServerControl() {
  const queryClient = useQueryClient();
  
  const startMutation = useMutation({
    mutationFn: (serverId: string = 'local') => api.startServer(serverId),
    onSuccess: (data, serverId) => {
      queryClient.invalidateQueries({ queryKey: ['serverStatus', serverId] });
      toast.success('Server started successfully');
    },
    onError: (error) => {
      toast.error(`Failed to start server: ${error}`);
    },
  });
  
  const stopMutation = useMutation({
    mutationFn: (serverId: string = 'local') => api.stopServer(serverId),
    onSuccess: (data, serverId) => {
      queryClient.invalidateQueries({ queryKey: ['serverStatus', serverId] });
      toast.success('Server stopped successfully');
    },
    onError: (error) => {
      toast.error(`Failed to stop server: ${error}`);
    },
  });
  
  const restartMutation = useMutation({
    mutationFn: (serverId: string = 'local') => api.restartServer(serverId),
    onSuccess: (data, serverId) => {
      queryClient.invalidateQueries({ queryKey: ['serverStatus', serverId] });
      toast.success('Server restarted successfully');
    },
    onError: (error) => {
      toast.error(`Failed to restart server: ${error}`);
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

// Server statistics
export function useServerStats(serverId = 'local') {
  return useQuery({
    queryKey: ['serverStats', serverId],
    queryFn: () => api.getServerStats(serverId),
    refetchInterval: 5000, // Refresh every 5 seconds
  });
}

// Mountpoints
export function useMountpoints(serverId = 'local') {
  return useQuery({
    queryKey: ['mountpoints', serverId],
    queryFn: () => api.getMountpoints(serverId),
    refetchInterval: 10000, // Refresh every 10 seconds
  });
}

export function useMountpoint(serverId = 'local', mountpointId: string) {
  return useQuery({
    queryKey: ['mountpoint', serverId, mountpointId],
    queryFn: () => api.getMountpoint(serverId, mountpointId),
    enabled: !!mountpointId,
  });
}

export function useMountpointMutations() {
  const queryClient = useQueryClient();
  
  const createMutation = useMutation({
    mutationFn: ({ serverId = 'local', mountpoint }: { serverId?: string, mountpoint: Omit<MountPoint, 'id'> }) => 
      api.createMountpoint(serverId, mountpoint),
    onSuccess: (data, { serverId }) => {
      queryClient.invalidateQueries({ queryKey: ['mountpoints', serverId] });
      toast.success('Mountpoint created successfully');
    },
    onError: (error) => {
      toast.error(`Failed to create mountpoint: ${error}`);
    },
  });
  
  const updateMutation = useMutation({
    mutationFn: ({ serverId = 'local', mountpointId, mountpoint }: 
      { serverId?: string, mountpointId: string, mountpoint: Partial<MountPoint> }) => 
      api.updateMountpoint(serverId, mountpointId, mountpoint),
    onSuccess: (data, { serverId, mountpointId }) => {
      queryClient.invalidateQueries({ queryKey: ['mountpoints', serverId] });
      queryClient.invalidateQueries({ queryKey: ['mountpoint', serverId, mountpointId] });
      toast.success('Mountpoint updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update mountpoint: ${error}`);
    },
  });
  
  const deleteMutation = useMutation({
    mutationFn: ({ serverId = 'local', mountpointId }: { serverId?: string, mountpointId: string }) => 
      api.deleteMountpoint(serverId, mountpointId),
    onSuccess: (data, { serverId }) => {
      queryClient.invalidateQueries({ queryKey: ['mountpoints', serverId] });
      toast.success('Mountpoint deleted successfully');
    },
    onError: (error) => {
      toast.error(`Failed to delete mountpoint: ${error}`);
    },
  });
  
  const toggleVisibilityMutation = useMutation({
    mutationFn: ({ serverId = 'local', mountpointId, isPublic }: 
      { serverId?: string, mountpointId: string, isPublic: boolean }) => 
      api.toggleMountpointVisibility(serverId, mountpointId, isPublic),
    onSuccess: (data, { serverId, mountpointId }) => {
      queryClient.invalidateQueries({ queryKey: ['mountpoints', serverId] });
      queryClient.invalidateQueries({ queryKey: ['mountpoint', serverId, mountpointId] });
      toast.success(`Mountpoint visibility updated`);
    },
    onError: (error) => {
      toast.error(`Failed to update mountpoint visibility: ${error}`);
    },
  });
  
  return {
    createMountpoint: createMutation.mutate,
    updateMountpoint: updateMutation.mutate,
    deleteMountpoint: deleteMutation.mutate,
    toggleMountpointVisibility: toggleVisibilityMutation.mutate,
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

// Users
export function useUsers(serverId = 'local') {
  return useQuery({
    queryKey: ['users', serverId],
    queryFn: () => api.getUsers(serverId),
  });
}

export function useUser(serverId = 'local', userId: string) {
  return useQuery({
    queryKey: ['user', serverId, userId],
    queryFn: () => api.getUser(serverId, userId),
    enabled: !!userId,
  });
}

export function useUserMutations() {
  const queryClient = useQueryClient();
  
  const createMutation = useMutation({
    mutationFn: ({ serverId = 'local', user }: { serverId?: string, user: Omit<User, 'id'> }) => 
      api.createUser(serverId, user),
    onSuccess: (data, { serverId }) => {
      queryClient.invalidateQueries({ queryKey: ['users', serverId] });
      toast.success('User created successfully');
    },
    onError: (error) => {
      toast.error(`Failed to create user: ${error}`);
    },
  });
  
  const updateMutation = useMutation({
    mutationFn: ({ serverId = 'local', userId, user }: 
      { serverId?: string, userId: string, user: Partial<User> }) => 
      api.updateUser(serverId, userId, user),
    onSuccess: (data, { serverId, userId }) => {
      queryClient.invalidateQueries({ queryKey: ['users', serverId] });
      queryClient.invalidateQueries({ queryKey: ['user', serverId, userId] });
      toast.success('User updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update user: ${error}`);
    },
  });
  
  const deleteMutation = useMutation({
    mutationFn: ({ serverId = 'local', userId }: { serverId?: string, userId: string }) => 
      api.deleteUser(serverId, userId),
    onSuccess: (data, { serverId }) => {
      queryClient.invalidateQueries({ queryKey: ['users', serverId] });
      toast.success('User deleted successfully');
    },
    onError: (error) => {
      toast.error(`Failed to delete user: ${error}`);
    },
  });
  
  return {
    createUser: createMutation.mutate,
    updateUser: updateMutation.mutate,
    deleteUser: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

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
  const queryClient = useQueryClient();
  
  const updateMutation = useMutation({
    mutationFn: ({ serverId = 'local', config }: { serverId?: string, config: string }) => 
      api.updateConfig(serverId, config),
    onSuccess: (data, { serverId }) => {
      queryClient.invalidateQueries({ queryKey: ['config', serverId] });
      toast.success('Configuration updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update configuration: ${error}`);
    },
  });
  
  return {
    updateConfig: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
  };
}

// Servers
export function useServers() {
  return useQuery({
    queryKey: ['servers'],
    queryFn: () => api.getServers(),
  });
}

export function useServerMutations() {
  const queryClient = useQueryClient();
  
  const addMutation = useMutation({
    mutationFn: (server: Omit<IcecastServer, 'id' | 'status'>) => api.addServer(server),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['servers'] });
      toast.success('Server added successfully');
    },
    onError: (error) => {
      toast.error(`Failed to add server: ${error}`);
    },
  });
  
  const updateMutation = useMutation({
    mutationFn: ({ serverId, server }: { serverId: string, server: Partial<IcecastServer> }) => 
      api.updateServer(serverId, server),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['servers'] });
      toast.success('Server updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update server: ${error}`);
    },
  });
  
  const deleteMutation = useMutation({
    mutationFn: (serverId: string) => api.deleteServer(serverId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['servers'] });
      toast.success('Server removed successfully');
    },
    onError: (error) => {
      toast.error(`Failed to remove server: ${error}`);
    },
  });
  
  return {
    addServer: addMutation.mutate,
    updateServer: updateMutation.mutate,
    deleteServer: deleteMutation.mutate,
    isAdding: addMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
