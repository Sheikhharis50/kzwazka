import { apiClient } from 'api/client';
import { APIListResponse, EventQueryParams, IEvent } from 'api/type';
import { handleApiError } from 'utils/apiErrorHandler';

export const event = {
  getAll: async (
    queryParams: EventQueryParams = {}
  ): Promise<APIListResponse<IEvent>> => {
    try {
      const response = await apiClient.get(`/event`, { params: queryParams });
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to fetch events, please try again later');
    }
  },
};
