import { User } from 'src/db/schemas';

export interface APIRequest extends Request {
  user: User;
}
