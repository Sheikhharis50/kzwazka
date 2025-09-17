import { createGroupFormData } from '@/components/dashboard/group/create-group/schema';
import { apiClient } from 'api/client';
import {
  APIListResponse,
  APIResponse,
  IGroup,
  PaginationParams,
} from 'api/type';
import { toFormData } from 'axios';
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

  create: async (data: createGroupFormData): Promise<APIResponse<IGroup>> => {
    try {
      const formData = toFormData(data);
      const response = await apiClient.post(`/group`, formData);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to create group, please try again later');
    }
  },
};
