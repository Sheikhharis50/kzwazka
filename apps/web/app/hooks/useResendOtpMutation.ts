import { useMutation } from '@tanstack/react-query';
import * as api from 'api';
import { APIError } from 'api/type';
import { toast } from 'react-toastify';

export function useResendOtpMutation() {
  return useMutation({
    mutationFn: () => api.auth.resendOtp(),
    onSuccess: (data) => {
      toast(data.message, { type: 'success' });
    },
    onError: (error: APIError) => {
      console.error('Failed to resend otp:', error);
      toast(error.message, { type: 'error' });
    },
  });
}
