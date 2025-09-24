import { useMutation } from '@tanstack/react-query';
import * as api from 'api';
import { APIError } from 'api/type';
import { LoginFormData } from 'app/(authentication)/login/schema';
import { redirect } from 'next/navigation';
import { toast } from 'react-toastify';

export function useLoginMutation() {
  return useMutation({
    mutationFn: (credentials: LoginFormData) => api.auth.login(credentials),
    onSuccess: (data) => {
      localStorage.setItem('token', data.data?.access_token || '');
      const isVerified = data.data?.user.is_verified;
      if (isVerified) {
        toast(data.message, { type: 'success' });
        setTimeout(() => {
          redirect('/dashboard');
        }, 1000);
      } else {
        toast(data.message, { type: 'info' });
        setTimeout(() => {
          redirect(`/verify-email`);
        }, 1000);
      }
    },
    onError: (error: APIError) => {
      console.error('Login failed:', error);
      toast(error.message, { type: 'error' });
    },
  });
}
