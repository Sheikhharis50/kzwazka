'use client';
import { apiClient } from 'api/client';
import {
  APIListResponse,
  APIResponse,
  GetChildrenQueryParams,
  IChild,
} from 'api/type';
import { handleApiError } from 'utils/apiErrorHandler';

export const children = {
  getAll: async (
    queryParams: GetChildrenQueryParams = {}
  ): Promise<APIListResponse<IChild>> => {
    try {
      const response = await apiClient.get(`/children`, {
        params: queryParams,
      });
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to fetch kids, please try again later');
    }
  },

  delete: async (id: number): Promise<APIResponse<null>> => {
    try {
      const response = await apiClient.delete(`/children/${id}`);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to delete kid, please try again later');
    }
  },
};
