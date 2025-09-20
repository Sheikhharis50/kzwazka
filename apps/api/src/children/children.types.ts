export type IChildrenResponse = {
  id: number;
  dob: string;
  parent_first_name: string | null;
  parent_last_name: string | null;
  created_at: Date;
  updated_at: Date | null;
  external_id: string | null;
  user: {
    id: number;
    first_name: string;
    last_name: string | null;
    photo_url?: string | null;
    email: string;
    phone?: string | null;
  };
  group: {
    id: number;
    name?: string | null;
  } | null;
};
