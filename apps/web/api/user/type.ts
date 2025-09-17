import { IChild, IUserWithPermissions } from 'api/type';

export type IMeResponse = {
  user: IUserWithPermissions;
  children: IChild;
};
