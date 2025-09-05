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
    id: 1;
    name: string;
    email: string;
    phone: string;
    photo_url: string;
  };
};
