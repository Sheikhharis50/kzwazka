import { API_URL } from '@config';
import axios, { AxiosError, AxiosHeaders, AxiosResponse } from 'axios';
import { APIResponse } from './type';
import { publicRoutes } from '@/constants/public-routes';

const apiClient = axios.create({ baseURL: API_URL });

apiClient.interceptors.request.use(
  (config) => {
    if (!config.headers) config.headers = new AxiosHeaders();
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
      typeof window !== 'undefined' &&
      (error.status === 401 || error.response?.status === 401) &&
      !publicRoutes.includes(location.pathname)
    ) {
      if (error.response) error.response = removeSession(error.response);
    }
    return Promise.reject(error);
  }
);

export { apiClient };
