import { BaseEntity } from '../../types';

export interface User extends BaseEntity {
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
  isActive: boolean;
  lastLogin?: Date;
  avatar?: string;
}

export interface UserPermission {
  id: string;
  name: string;
  description?: string;
}

export interface UserRole {
  id: string;
  name: string;
  description?: string;
  permissions: UserPermission[];
}
