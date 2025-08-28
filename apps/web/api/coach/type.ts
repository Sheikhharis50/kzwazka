import { IUser } from 'api/type';

export type ICoach = {
  id: number;
  created_at: string;
  updated_at: string;
  user: IUser & {
    photo_url: string | null;
  };
  location: null;
};
