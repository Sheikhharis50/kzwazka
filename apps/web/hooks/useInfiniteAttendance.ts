import { useInfiniteQuery } from '@tanstack/react-query';
import * as api from 'api';
import { AttendanceQueryParams } from 'api/type';

export function useInfiniteAttendance(queryParams: AttendanceQueryParams) {
  return useInfiniteQuery({
    queryKey: ['infinite-attendance', queryParams],
    queryFn: async ({ pageParam = 1 }) =>
      await api.attendance.getAll({
        ...queryParams,
        page: pageParam,
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
    staleTime: 5 * 60 * 60,
  });
}
