
import { toast } from 'sonner';
import { QueryClient } from '@tanstack/react-query';
import { ApiResponse } from '@/types/icecast';

// Shared utility for handling API error responses in mutations
export const handleApiError = (error: unknown): string => {
  const errorMessage = error instanceof Error ? error.message : String(error);
  toast.error(errorMessage);
  return errorMessage;
};

// Shared utility for handling API success responses in mutations
export const handleApiSuccess = (message: string): void => {
  toast.success(message);
};

// Create a handler for mutation options with success/error callbacks
export const createMutationHandlers = <T>(
  successMessage: string,
  options?: { 
    onSuccess?: (data: T) => void, 
    onError?: (error: unknown) => void 
  }
) => {
  return {
    onSuccess: (data: T) => {
      handleApiSuccess(successMessage);
      options?.onSuccess?.(data);
    },
    onError: (error: unknown) => {
      const errorMessage = handleApiError(error);
      options?.onError?.(errorMessage);
    },
  };
};

// Export the shared queryClient
export { queryClient } from '@/lib/react-query';
