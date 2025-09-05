import { useQuery } from '@tanstack/react-query';
import * as api from 'api';

export function useLocation() {
  const getAllLocations = useQuery({
    queryKey: ['locations'],
    queryFn: async () => await api.location.getAll(),
  });

  return { getAllLocations };
}
