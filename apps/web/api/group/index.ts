import { apiClient } from 'api/client';
import { APIListResponse, IGroup, PaginationParams } from 'api/type';
import { handleApiError } from 'utils/apiErrorHandler';

export const group = {
  getAll: async (
    queryParams: PaginationParams = {}
  ): Promise<APIListResponse<IGroup>> => {
    try {
      const response = await apiClient.get(`/group`, { params: queryParams });
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to fetch groups, please try again later');
    }
  },
};
