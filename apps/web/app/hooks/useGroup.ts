import { useQuery } from '@tanstack/react-query';
import { IGroup, PaginationParams } from 'api/type';
import * as api from 'api';

export function useGroup(queryParams: PaginationParams = {}) {
  const getAllGroups = useQuery({
    queryKey: ['groups', queryParams],
    queryFn: async () => await api.group.getAll(queryParams),
  });

  const groupOptions =
    getAllGroups.data?.data?.map((group: IGroup) => ({
      value: group?.id,
      label: `${group?.name}`,
    })) || [];

  return { getAllGroups, groupOptions };
}
