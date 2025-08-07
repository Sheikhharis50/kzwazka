export type RegisterPayload = {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  dob: string;
  parent_first_name: string;
  parent_last_name: string;
};

export type IUser = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  is_verified: boolean;
};
