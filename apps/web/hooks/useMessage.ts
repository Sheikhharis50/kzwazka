import { useMutation } from '@tanstack/react-query';
import * as api from 'api';
import { APIError, CreateMessagePayload } from 'api/type';
import { toast } from 'react-toastify';

export function useMessage() {
  const sendMessageMutation = useMutation({
    mutationFn: async (payload: CreateMessagePayload) =>
      await api.message.create(payload),
    onError: (error: APIError) => {
      toast(error.message, { type: 'error' });
    },
  });

  return { sendMessageMutation };
}
