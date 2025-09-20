export type IMessageResponse = {};

export type CreateMessagePayload = {
  content?: string;
  content_type: 'text' | 'image' | 'document';
  file?: File;
  group_id?: number;
};
