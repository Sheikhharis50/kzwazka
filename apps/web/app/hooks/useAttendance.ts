import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as api from 'api';
import {
  APIError,
  AttendanceQueryParams,
  MarkAllPresentPayload,
  MarkAttendancePayload,
} from 'api/type';
import { ApiError } from 'next/dist/server/api-utils';
import { toast } from 'react-toastify';

export function useAttendance(queryParams: AttendanceQueryParams) {
  const queryClient = useQueryClient();

  const getAttendance = useQuery({
    queryKey: ['attendance', queryParams],
    queryFn: async () => await api.attendance.getAll(queryParams),
    staleTime: 60 * 60 * 60,
  });

  const markAttendanceMutation = useMutation({
    mutationFn: async (payload: MarkAttendancePayload) =>
      await api.attendance.markAttendance(payload),
    onSuccess: () => queryClient.refetchQueries({ queryKey: ['attendance'] }),
    onError: (error: APIError) => {
      queryClient.refetchQueries({ queryKey: ['attendance'] });
      toast(error.message, { type: 'error' });
    },
  });

  const markAllPresentMutation = useMutation({
    mutationFn: async (payload: MarkAllPresentPayload) =>
      await api.attendance.markAllPresent(payload),
    onSuccess: () => queryClient.refetchQueries({ queryKey: ['attendance'] }),
    onError: (error: ApiError) => {
      toast(error.message, {
        type: 'error',
      });
    },
  });

  return { getAttendance, markAttendanceMutation, markAllPresentMutation };
}
