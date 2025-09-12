import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { CreateGroupPayload, IGroup, PaginationParams } from 'api/type';
import * as api from 'api';
import { toast } from 'react-toastify';

export function useGroup(queryParams: PaginationParams = {}) {
  const queryClient = useQueryClient();

  const getAllGroups = useQuery({
    queryKey: ['groups', queryParams],
    queryFn: async () => await api.group.getAll(queryParams),
  });

  const getInfiniteGroups = useInfiniteQuery({
    queryKey: ['infinite-groups'],
    queryFn: async ({ pageParam = 1 }) =>
      await api.group.getAll({ page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (data) => {
      const { page: currentPage, totalPages } = data.pagination;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    getPreviousPageParam: (data) => {
      const { page: currentPage } = data.pagination;
      return currentPage > 1 ? currentPage - 1 : undefined;
    },
  });

  const createGroupMutation = useMutation({
    mutationFn: async (groupData: CreateGroupPayload) =>
      await api.group.create(groupData),
    onSuccess: (data) => {
      toast(data.message, { type: 'success' });
      queryClient.invalidateQueries({ queryKey: ['infinite-groups'] });
    },
    onError: (error) => {
      toast(error.message, { type: 'error' });
    },
  });

  const groupOptions =
    getAllGroups.data?.data?.map((group: IGroup) => ({
      value: group?.id,
      label: `${group?.name}`,
    })) || [];

  return { getAllGroups, groupOptions, getInfiniteGroups, createGroupMutation };
}
