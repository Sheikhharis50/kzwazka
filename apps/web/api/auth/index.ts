import { apiClient } from 'api/client';
import {
  RegisterPayload,
  IUser,
  IRegisterResponse,
  ILoginResponse,
} from './type';
import { API_BASE_URL } from '@config';
import { handleApiError } from 'utils/apiErrorHandler';
import { APIResponse } from 'api/type';

export const auth = {
  register: async (
    payload: RegisterPayload
  ): Promise<APIResponse<IRegisterResponse>> => {
    try {
      console.log(API_BASE_URL);

      const response = await apiClient.post(`/auth/signup`, payload);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to create user, please try again later');
    }
  },

  login: async (payload: {
    email: string;
    password: string;
  }): Promise<{ access_token: string; user: IUser }> => {
    try {
      const response = await apiClient.post(`/auth/login`, payload);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to login, please try again later');
    }
  },

  verifyOtp: async ({
    userId,
    otp,
  }: {
    userId: string;
    otp: string;
  }): Promise<APIResponse<ILoginResponse>> => {
    try {
      const response = await apiClient.post(`/auth/verify-otp/${userId}`, {
        otp,
      });
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to verify OTP, please try again later');
    }
  },
};
