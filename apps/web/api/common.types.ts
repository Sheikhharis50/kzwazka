export interface APIListResponse<T> {
  message: string;
  status: number;
  count: number;
  page?: number;
  data: T[];
}

export interface APIResponse<T> {
  message: string;
  status: number;
  data?: T;
}

export interface APIError {
  message: string;
  statusCode: number;
}
