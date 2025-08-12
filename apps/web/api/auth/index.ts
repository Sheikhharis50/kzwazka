import { apiClient } from 'api/client';
import {
  RegisterPayload,
  IRegisterResponse,
  ILoginResponse,
  IVerifyOtpResponse,
} from './type';
import { handleApiError } from 'utils/apiErrorHandler';
import { APIResponse } from 'api/type';

export const auth = {
  register: async (
    payload: RegisterPayload
  ): Promise<APIResponse<IRegisterResponse>> => {
    try {
      const response = await apiClient.post(`/auth/signup`, payload);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to create user, please try again later');
    }
  },

  login: async (payload: {
    email: string;
    password: string;
  }): Promise<APIResponse<ILoginResponse>> => {
    try {
      const response = await apiClient.post(`/auth/login`, payload);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to login, please try again later');
    }
  },

  verifyOtp: async ({
    otp,
  }: {
    otp: string;
  }): Promise<APIResponse<IVerifyOtpResponse>> => {
    try {
      const response = await apiClient.post(`/auth/verify-otp`, {
        otp,
      });
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to verify OTP, please try again later');
    }
  },

  resendOtp: async (): Promise<APIResponse<null>> => {
    try {
      const response = await apiClient.post(`/auth/resend-otp`);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to resend OTP, please try again later');
    }
  },
};
