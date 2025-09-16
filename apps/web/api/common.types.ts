export interface APIListResponse<T> {
  message: string;
  status: number;
  data: T[];
  pagination: {
    count: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface APIResponse<T> {
  message: string;
  status: number;
  data?: T;
}

export interface APIError {
  message: string;
  status: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}
