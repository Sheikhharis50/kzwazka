import { PaginationParams } from 'api/common.types';

export enum ContentType {
  TEXT = 'text',
  IMAGE = 'image',
  DOCUMENT = 'document',
}

export type IMessage = {
  id: number;
  content: string;
  content_type: ContentType;
  group_id: number;
  created_at: string;
  updated_at: string;
  created_by: { id: number; name: string; photo_url: string };
};

export type CreateMessagePayload = {
  content?: string;
  content_type: ContentType;
  file?: File;
  group_id?: number;
};

export type GetMessagesQueryParams = { group_id?: string } & PaginationParams;
