import { useMutation } from '@tanstack/react-query';
import * as api from 'api';
import { APIError } from 'api/type';
import { redirect } from 'next/navigation';
import { toast } from 'react-toastify';

export function useVerifyEmailMutation() {
  return useMutation({
    mutationFn: ({ otp }: { otp: string }) => api.auth.verifyOtp({ otp }),
    onSuccess: (data) => {
      toast(data.message, { type: 'success' });
      setTimeout(() => {
        redirect('/dashboard');
      }, 1000);
    },
    onError: (error: APIError) => {
      console.error('Verification failed:', error);
      toast(error.message, { type: 'error' });
    },
  });
}
