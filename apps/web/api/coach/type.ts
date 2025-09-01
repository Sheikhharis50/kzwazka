import { IUser } from 'api/type';

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
