import { useQuery } from '@tanstack/react-query';
import * as api from 'api';
import { GetChildrenQueryParams } from 'api/type';

export function useChildren(queryParams: GetChildrenQueryParams = {}) {
  const getAllChildren = useQuery({
    queryKey: ['children', queryParams],
    queryFn: async () => await api.children.getAll(queryParams),
    staleTime: 5 * 60 * 1000,
  });

  return { getAllChildren };
}
