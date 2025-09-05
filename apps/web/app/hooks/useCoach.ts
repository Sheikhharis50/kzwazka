import { useQuery } from '@tanstack/react-query';
import * as api from 'api';

export function useCoach() {
  const getAllCoaches = useQuery({
    queryKey: ['coaches'],
    queryFn: async () => await api.coach.getAll(),
  });

  return { getAllCoaches };
}
