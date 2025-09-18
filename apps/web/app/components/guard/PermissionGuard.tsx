'use client';

import { usePermission } from 'hooks/usePermisson';
import Heading from '../Heading';

interface PermissionGuardProps {
  children: React.ReactNode;
  permissions?: string | string[];
  requireAll?: boolean;
  fallback?: boolean;
  role?: 'admin' | 'children' | 'coach';
}

const PermissionGuard = ({
  children,
  permissions: requiredPermissions,
  requireAll = true,
  fallback = true,
  role,
}: PermissionGuardProps) => {
  const { hasAllPermissions, hasAnyPermission, hasRole } = usePermission({
    requiredPermissions,
    role,
  });

  const hasAccess =
    hasRole || (requireAll ? hasAllPermissions : hasAnyPermission);

  return hasAccess ? (
    children
  ) : fallback ? (
    <div className="size-full flex items-center justify-center">
      <Heading small text="Access Denied" />
    </div>
  ) : null;
};

export default PermissionGuard;
