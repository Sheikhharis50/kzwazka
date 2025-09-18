import { useMutation } from '@tanstack/react-query';
import { APIError, RegisterPayload } from 'api/type';
import * as api from 'api';
import { toast } from 'react-toastify';
import { redirect } from 'next/navigation';

export function useRegisterMutation() {
  return useMutation({
    mutationFn: (credentials: RegisterPayload) =>
      api.auth.register(credentials),
    onSuccess: (data) => {
      localStorage.setItem('token', data.data?.access_token || '');
      toast(data.message, { type: 'success' });
      setTimeout(() => {
        redirect('/verify-email');
      }, 1000);
    },
    onError: (error: APIError) => {
      console.error('Register failed:', error);
      toast(error.message, { type: 'error' });
    },
  });
}
