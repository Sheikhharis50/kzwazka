import { apiClient } from 'api/client';
import { CreateMessagePayload, GetMessagesQueryParams, IMessage } from './type';
import { handleApiError } from 'utils/apiErrorHandler';
import { APIListResponse, APIResponse } from 'api/type';
import { toFormData } from 'axios';

export const message = {
  getAll: async (
    queryParams: GetMessagesQueryParams = {}
  ): Promise<APIListResponse<IMessage>> => {
    try {
      const response = await apiClient.get(`/message`, { params: queryParams });
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to fetch messages, please try again later');
    }
  },

  create: async (payload: CreateMessagePayload): Promise<APIResponse<null>> => {
    try {
      const form = toFormData(payload);
      const response = await apiClient.post('/message', form);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to send message, try again later');
    }
  },
};
