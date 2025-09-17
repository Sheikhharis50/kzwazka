import { APIResponse } from 'api/type';
import { IAttendance, IAttendanceResponse } from 'api/type';
// import { apiClient } from 'api/client';
import * as api from 'api';
import { handleApiError } from 'utils/apiErrorHandler';

export const attendance = {
  getAll: async (): Promise<APIResponse<IAttendanceResponse>> => {
    try {
      const response = await api.children.getAll();
      const attendanceData: IAttendance[] = response.data.map((rec) => ({
        children: { ...rec },
        status: null,
      }));
      const data: IAttendanceResponse = {
        group_id: null,
        date: '',
        attendance: attendanceData,
      };

      return {
        data: data,
        message: '',
        status: 200,
      };
    } catch (error) {
      handleApiError(
        error,
        'Failed to fetch attendance, please try again later'
      );
    }
  },
};
