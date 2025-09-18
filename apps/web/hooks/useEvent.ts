import { useQuery } from '@tanstack/react-query';
import * as api from 'api';
import { EventQueryParams } from 'api/type';

export function useEvent(queryParams: EventQueryParams = {}) {
  const getAllEvents = useQuery({
    queryKey: ['events', queryParams],
    queryFn: async () => await api.event.getAll(queryParams),
  });

  return { getAllEvents };
}
