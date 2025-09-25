import { IUser } from 'api/type';
import { SortBy, SortOrder } from 'types';

export type ICoach = {
  id: number;
  created_at: string;
  updated_at: string;
  group: { id: string; name: string }[];
  user: IUser & {
    photo_url: string | null;
  };
  location: null;
};

export type AddCoachPayload = {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  phone: string;
  photo_url: File | undefined;
};

export type EditCoachPayload = {
  first_name: string;
  last_name: string;
  phone: string;
  photo_url: File | null;
};

export type GetCoachQueryParams = {
  search?: string;
  location_id?: number;
  group_id?: number;
  sort_order?: SortOrder;
  sort_by?: SortBy.CREATED_AT | SortBy.NAME;
  page?: number;
  limit?: number;
};
