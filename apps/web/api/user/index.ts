import { apiClient } from 'api/client';
import { APIResponse, IMeResponse } from 'api/type';
import { handleApiError } from 'utils/apiErrorHandler';

export const user = {
  me: async (): Promise<APIResponse<IMeResponse>> => {
    try {
      const response = await apiClient.get(`/auth/me`);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to fetch user, please try again later');
    }
  },
};
