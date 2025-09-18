import { createGroupFormData } from 'components/dashboard/group/create-group/schema';

export type ISession = {
  id: number;
  group_id: number;
  day: string;
  start_time: string;
  end_time: string;
  created_at: string;
  updated_at: string;
};

export type IGroup = {
  id: number;
  name: string;
  description: string;
  min_age: number;
  max_age: number;
  skill_level: string;
  max_group_size: number;
  photo_url: string;
  status: string;
  created_at: string;
  updated_at: string;
  location: {
    id: number;
    name: string;
    address1: string;
    city: string;
    state: string;
  };
  coach: {
    id: number;
    user_id: number;
    first_name: string;
    last_name: string;
    email: string;
    photo_url: string;
  };
  sessions: ISession[];
};

export type CreateGroupPayload = createGroupFormData & {
  photo_url: File | undefined;
};
