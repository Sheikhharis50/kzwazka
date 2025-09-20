import { apiClient } from 'api/client';
import { CreateMessagePayload } from './type';
import { handleApiError } from 'utils/apiErrorHandler';
import { APIResponse } from 'api/common.types';
import { toFormData } from 'axios';

export const message = {
  // getAll: async (
  //   queryParams: PaginationParams = {}
  // ): Promise<APIListResponse<IGroup>> => {
  //   try {
  //     const response = await apiClient.get(`/group`, { params: queryParams });
  //     return response.data;
  //   } catch (error) {
  //     handleApiError(error, 'Failed to fetch groups, please try again later');
  //   }
  // },

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
