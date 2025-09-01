import { IChild, IUserWithPermissions } from 'api/type';

export type IMeResponse = {
  user: IUserWithPermissions;
  child: IChild;
};
