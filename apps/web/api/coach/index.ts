'use client';

import { apiClient } from 'api/client';
import { APIListResponse, APIResponse, ICoach } from 'api/type';
import { handleApiError } from 'utils/apiErrorHandler';

export const coach = {
  getAll: async ({
    search = '',
    sort_by = '',
  }: {
    search?: string;
    sort_by?: string;
  } = {}): Promise<APIListResponse<ICoach>> => {
    try {
      const params: Record<string, string> = {};

      if (search) params.search = search;
      if (sort_by) params.sort_by = sort_by;

      const response = await apiClient.get(`/coach`, { params: params });
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to fetch coaches, please try again later');
    }
  },

  delete: async (id: number): Promise<APIResponse<null>> => {
    try {
      const response = await apiClient.delete(`/coach/${id}`);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to delete coach, please try again later');
    }
  },
};
