export interface APIListResponse<T> {
  detail: string;
  status: number;
  count: number;
  page?: number;
  data: T[];
}

export interface APIResponse<T> {
  detail: string;
  status: number;
  data?: T;
}

export interface APIError {
  message: string;
  statusCode: number;
}
