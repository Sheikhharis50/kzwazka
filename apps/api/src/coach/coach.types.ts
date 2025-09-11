export type CoachWithUserAndLocationGroup = {
  id: number;
  created_at: Date;
  updated_at: Date;
  user: {
    id: number | null;
    email: string;
    first_name: string;
    last_name: string | null;
    phone: string | null;
    is_active: boolean;
    is_verified: boolean;
    photo_url: string | null;
  };
  location: {
    id: number;
    name: string | null;
    address1: string | null;
    city: string | null;
    state: string | null;
  } | null;
  groups:
    | {
        id: number;
        name: string;
        description: string | null;
        created_at: Date;
        updated_at: Date;
      }[]
    | null;
};
