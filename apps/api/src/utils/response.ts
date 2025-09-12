import { HttpException } from '@nestjs/common';

export interface Pagination {
  count: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface APISuccessResponsePayload<T> {
  data?: T;
  message: string;
  statusCode: number;
  pagination?: Pagination;
}

export interface APIErrorResponsePayload<T> {
  data?: T;
  message: string;
  statusCode: number;
}

export class APIResponse<T> {
  public readonly message: string;
  public readonly statusCode: number;
  public readonly data?: T;
  public readonly pagination?: Pagination;

  constructor({
    data,
    message,
    statusCode,
    pagination,
  }: APISuccessResponsePayload<T>) {
    this.data = data;
    this.message = message;
    this.statusCode = statusCode;
    if (pagination) {
      this.pagination = pagination;
    }
  }

  static success<T>({
    data,
    message = 'Success',
    statusCode = 200,
    pagination = undefined,
  }: APISuccessResponsePayload<T>): APIResponse<T> {
    return new APIResponse({ data, message, statusCode, ...pagination });
  }

  static error<T>({
    message = 'Error',
    statusCode = 500,
    data,
  }: APIErrorResponsePayload<T | undefined>): APIResponse<T | undefined> {
    const response = new APIResponse({ data, message, statusCode });
    throw new HttpException(response, response.statusCode);
  }
}
