import { API_URL } from '@config';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { APIResponse } from './type';

const apiClient = axios.create({ baseURL: API_URL });

apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      config.headers['Content-Type'] = 'application/json';
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    // Handle the error
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<APIResponse<null>>) => {
    const removeSession = (response: AxiosResponse) => {
      if (response?.data) {
        response.data.message = 'Session expired';
      }

      setTimeout(() => {
        localStorage.removeItem('token');
        window.location.href = `/login?next=${location.pathname}`;
      }, 500);

      return response;
    };

    if (
      window &&
      (error.status === 401 || error.response?.status === 401) &&
      !location.pathname.includes('login')
    ) {
      if (error.response) error.response = removeSession(error.response);
    }
    return Promise.reject(error);
  }
);

export { apiClient };
