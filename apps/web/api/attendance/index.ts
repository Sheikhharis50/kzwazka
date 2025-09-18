import {
  APIListResponse,
  APIResponse,
  AttendanceQueryParams,
  IMarkAttendanceResponse,
  MarkAllPresentPayload,
  MarkAttendancePayload,
} from 'api/type';
import { IAttendance } from 'api/type';
import { handleApiError } from 'utils/apiErrorHandler';
import { apiClient } from 'api/client';

export const attendance = {
  getAll: async (
    queryParams: AttendanceQueryParams
  ): Promise<APIListResponse<IAttendance>> => {
    try {
      const response = await apiClient.get('/attendance', {
        params: queryParams,
      });
      return response.data;
    } catch (error) {
      handleApiError(
        error,
        'Failed to fetch attendance, please try again later'
      );
    }
  },

  markAttendance: async (
    payload: MarkAttendancePayload
  ): Promise<APIResponse<IMarkAttendanceResponse>> => {
    try {
      const response = await apiClient.post('/attendance', payload);
      return response.data;
    } catch (error) {
      handleApiError(
        error,
        'Failed to mark attendance, please try again later'
      );
    }
  },

  markAllPresent: async (
    payload: MarkAllPresentPayload
  ): Promise<APIResponse<IMarkAttendanceResponse>> => {
    try {
      const response = await apiClient.post(
        '/attendance/mark-all-as-present',
        payload
      );
      return response.data;
    } catch (error) {
      handleApiError(
        error,
        'Failed to mark all as present, please try again later'
      );
    }
  },
};
