import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as api from 'api';
import { EventQueryParams } from 'api/type';
import { toast } from 'react-toastify';

export function useEvent(queryParams: EventQueryParams = {}) {
  const queryClient = useQueryClient();

  const getAllEvents = useQuery({
    queryKey: ['events', queryParams],
    queryFn: async () => await api.event.getAll(queryParams),
  });

  const createEventMutation = useMutation({
    mutationFn: async (payload: object) => await api.event.create(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast(data.message, { type: 'success' });
    },
    onError: (data) => {
      toast(data.message, { type: 'error' });
    },
  });

  return { getAllEvents, createEventMutation };
}
