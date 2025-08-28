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
  phone: string;
  role: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string | null;
};

export type IUserWithPermissions = IUser & { permissions: string[] };

type IChildUser = Omit<
  IUser,
  'is_active' | 'is_verified' | 'created_at' | 'updated_at'
> & { photo_url: string | null };

export type IChild = {
  id: number;
  user: IChildUser;
  dob: string;
  parent_first_name: string;
  parent_last_name: string;
  location: number | null;
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
