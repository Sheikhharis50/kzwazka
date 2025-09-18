import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from 'api';
import { APIError, UpdateProfilePayload } from 'api/type';
import { toast } from 'react-toastify';

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (credentials: UpdateProfilePayload) =>
      api.auth.updateProfile(credentials),
    onSuccess: (data) => {
      toast(data.message, { type: 'success' });
      queryClient.refetchQueries({
        queryKey: ['me', localStorage.getItem('token')],
      });
    },
    onError: (error: APIError) => {
      console.error('Failed to update profile:', error);
      toast(error.message, { type: 'error' });
    },
  });
}
