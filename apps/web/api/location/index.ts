import { apiClient } from 'api/client';
import { APIListResponse, ILocation } from 'api/type';
import { handleApiError } from 'utils/apiErrorHandler';

export const location = {
  getAll: async ({
    search = '',
    sort_by = '',
  }: {
    search?: string;
    sort_by?: string;
  } = {}): Promise<APIListResponse<ILocation>> => {
    try {
      const params: Record<string, string> = {};

      if (search) params.search = search;
      if (sort_by) params.sort_by = sort_by;

      const response = await apiClient.get(`/location`, { params: params });
      return response.data;
    } catch (error) {
      handleApiError(
        error,
        'Failed to fetch Locations, please try again later'
      );
    }
  },
};
