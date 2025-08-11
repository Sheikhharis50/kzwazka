import { APIError } from 'api/type';
import { AxiosError } from 'axios';

export function handleApiError(error: unknown, fallback?: string): never {
  if ((error as AxiosError).isAxiosError) {
    const axiosError = error as AxiosError;

    if (axiosError.response) {
      const data = axiosError.response.data as {
        message?: string | string[];
        statusCode?: number;
      };

      throw {
        message: Array.isArray(data?.message)
          ? data.message.join(', ')
          : data?.message || 'Something went wrong',
        status: data?.statusCode || axiosError.response.status,
      } satisfies APIError;
    }
  }

  throw {
    message: fallback || 'Unexpected error occurred',
    status: 500,
  } satisfies APIError;
}
