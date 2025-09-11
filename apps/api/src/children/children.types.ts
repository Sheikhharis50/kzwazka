export type ChildrenWithUserAndLocationAndGroup = {
  id: number;
  dob: string;
  parent_first_name: string | null;
  parent_last_name: string | null;
  created_at: Date;
  updated_at: Date | null;
  user: {
    id: number;
    first_name: string;
    last_name: string | null;
    photo_url?: string | null;
    email: string;
    phone?: string | null;
  };
  location: {
    id: number;
    name?: string | null;
    address1?: string | null;
    address2?: string | null;
    city?: string | null;
    state?: string | null;
  } | null;
  group: {
    id: number;
    name?: string | null;
  } | null;
};
export interface ChildrenGroupUpdateValues {
  children_id?: number;
  group_id?: number;
  status?: boolean;
  updated_at: Date;
}

export interface ChildrenGroup {
  id: number;
  children_id: number;
  group_id: number;
  status: boolean;
  created_at: Date;
  updated_at: Date;
}
