import { apiClient } from 'api/client';
import {
  APIListResponse,
  APIResponse,
  EventQueryParams,
  IEvent,
} from 'api/type';
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

  create: async (payload: object): Promise<APIResponse<null>> => {
    try {
      const response = await apiClient.post('event', payload);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to create event, please try again later');
    }
  },
};
