import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import * as api from 'api';
import {
  APIError,
  CreateMessagePayload,
  GetMessagesQueryParams,
} from 'api/type';
import { toast } from 'react-toastify';

export function useMessage(queryParams: GetMessagesQueryParams = {}) {
  const queryClient = useQueryClient();
  const sendMessageMutation = useMutation({
    mutationFn: async (payload: CreateMessagePayload) =>
      await api.message.create(payload),
    onSuccess: () => queryClient.refetchQueries({ queryKey: ['messages'] }),
    onError: (error: APIError) => {
      toast(error.message, { type: 'error' });
    },
  });

  const getMessages = useInfiniteQuery({
    queryKey: ['messages', queryParams?.group_id],
    queryFn: async ({ pageParam = 1 }) =>
      await api.message.getAll({
        group_id: queryParams?.group_id,
        page: pageParam,
        limit: 50,
      }),
    initialPageParam: 1,
    getNextPageParam: (data) => {
      const { page: currentPage, totalPages } = data.pagination;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    getPreviousPageParam: (data) => {
      const { page: currentPage } = data.pagination;
      return currentPage > 1 ? currentPage - 1 : undefined;
    },
    staleTime: 5 * 60 * 1000,
  });

  return { sendMessageMutation, getMessages };
}
