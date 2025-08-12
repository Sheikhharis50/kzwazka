export type RegisterPayload = {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  dob: string;
  parent_first_name: string;
  parent_last_name: string;
  photo_url?: string;
  phone: string;
};

export type IUser = {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  is_verified: boolean;
};

export type IChild = {
  id: number;
  user_id: number;
  dob: string;
  photo_url: string;
  parent_first_name: string;
  parent_last_name: string;
  location_id: number | null;
  created_at: string;
  updated_at: string | null;
};

export type IRegisterResponse = {
  access_token: string;
  user: IUser;
  child: IChild;
};

export type ILoginResponse = {
  access_token: string;
  user: IUser;
};

export type IVerifyOtpResponse = {
  user: IUser;
};
