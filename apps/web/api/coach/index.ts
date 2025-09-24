'use client';

import { apiClient } from 'api/client';
import {
  AddCoachPayload,
  APIListResponse,
  APIResponse,
  EditCoachPayload,
  GetCoachQueryParams,
  ICoach,
} from 'api/type';
import { toFormData } from 'axios';
import { handleApiError } from 'utils/apiErrorHandler';

export const coach = {
  getAll: async (
    queryParams: GetCoachQueryParams = {}
  ): Promise<APIListResponse<ICoach>> => {
    try {
      const response = await apiClient.get(`/coach`, { params: queryParams });
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to fetch coaches, please try again later');
    }
  },

  getOne: async (id: number): Promise<APIResponse<ICoach>> => {
    try {
      const response = await apiClient.get(`/coach/${id}`);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to fetch coach, please try again later');
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

  create: async (data: AddCoachPayload): Promise<APIResponse<ICoach>> => {
    try {
      const formData = toFormData(data);
      const response = await apiClient.post(`/coach`, formData);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to create coach, please try again later');
    }
  },

  update: async ({
    data,
    id,
  }: {
    data: EditCoachPayload;
    id: number;
  }): Promise<APIResponse<ICoach>> => {
    try {
      const formData = toFormData(data);
      const response = await apiClient.patch(`/coach/${id}`, formData);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to update coach, please try again later');
    }
  },
};
