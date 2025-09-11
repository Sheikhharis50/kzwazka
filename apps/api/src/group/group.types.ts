import { GroupSession } from '../db/schemas';

export type IGroupResponse = {
  id: number;
  name: string;
  description: string | null;
  min_age: number;
  max_age: number;
  skill_level: string;
  max_group_size: number;
  created_at: Date;
  updated_at: Date;
  photo_url: string | null;
  location: {
    id: number;
    name: string;
    address1: string;
    city: string;
    state: string;
  } | null;
  coach: {
    id: number | null;
    first_name: string;
    last_name: string | null;
    email: string;
    photo_url: string | null;
  } | null;
  sessions: GroupSession[];
};
