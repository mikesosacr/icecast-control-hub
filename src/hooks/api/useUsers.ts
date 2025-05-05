
import { useQuery, useMutation } from '@tanstack/react-query';
import * as api from '@/services/api';
import { User } from '@/types/icecast';
import { createMutationHandlers, queryClient } from './useApiBase';

// Users list
export function useUsers(serverId = 'local') {
  return useQuery({
    queryKey: ['users', serverId],
    queryFn: () => api.getUsers(serverId),
  });
}

// Single user
export function useUser(serverId = 'local', userId: string) {
  return useQuery({
    queryKey: ['user', serverId, userId],
    queryFn: () => api.getUser(serverId, userId),
    enabled: !!userId,
  });
}

// User mutations (create, update, delete)
export function useUserMutations() {
  // queryClient is now imported from useApiBase
  
  const createMutation = useMutation({
    mutationFn: ({ serverId = 'local', user }: { serverId?: string, user: Omit<User, 'id'> }) => 
      api.createUser(serverId, user),
    onSuccess: (data, { serverId }) => {
      queryClient.invalidateQueries({ queryKey: ['users', serverId] });
    },
  });
  
  const updateMutation = useMutation({
    mutationFn: ({ serverId = 'local', userId, user }: 
      { serverId?: string, userId: string, user: Partial<User> }) => 
      api.updateUser(serverId, userId, user),
    onSuccess: (data, { serverId, userId }) => {
      queryClient.invalidateQueries({ queryKey: ['users', serverId] });
      queryClient.invalidateQueries({ queryKey: ['user', serverId, userId] });
    },
  });
  
  const deleteMutation = useMutation({
    mutationFn: ({ serverId = 'local', userId }: { serverId?: string, userId: string }) => 
      api.deleteUser(serverId, userId),
    onSuccess: (data, { serverId }) => {
      queryClient.invalidateQueries({ queryKey: ['users', serverId] });
    },
  });
  
  return {
    createUser: (params: { serverId?: string, user: Omit<User, 'id'> }) => {
      createMutation.mutate(params, createMutationHandlers('User created successfully'));
    },
    updateUser: (params: { serverId?: string, userId: string, user: Partial<User> }) => {
      updateMutation.mutate(params, createMutationHandlers('User updated successfully'));
    },
    deleteUser: (params: { serverId?: string, userId: string }) => {
      deleteMutation.mutate(params, createMutationHandlers('User deleted successfully'));
    },
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
