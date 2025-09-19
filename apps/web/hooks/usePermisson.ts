import { useUser } from './useUser';

interface PermissionPayload {
  requiredPermissions?: string[] | string;
  role?: 'admin' | 'children' | 'coach';
}

export const usePermission = ({
  requiredPermissions,
  role,
}: PermissionPayload) => {
  const { user, isLoading = true } = useUser();

  if (isLoading) {
    return {
      hasRole: false,
      hasAllPermissions: false,
      hasAnyPermission: false,
      permissions: [],
      requiredPermissions: [],
    };
  }

  if (!user || !user.permissions) {
    return {
      hasRole: false,
      hasAllPermissions: false,
      hasAnyPermission: false,
      permissions: [],
      requiredPermissions: Array.isArray(requiredPermissions)
        ? requiredPermissions
        : [requiredPermissions],
    };
  }

  const userPermissions = user.permissions;
  const userRole = user.role;

  const hasRole = userRole === role;

  if (role && !hasRole) {
    return {
      hasRole: false,
      hasAllPermissions: false,
      hasAnyPermission: false,
      permissions: userPermissions,
      requiredPermissions: [],
    };
  }

  if (!requiredPermissions) {
    return {
      hasRole,
      hasAllPermissions: true,
      hasAnyPermission: true,
      permissions: userPermissions,
      requiredPermissions: [],
    };
  }

  const permsToCheck = Array.isArray(requiredPermissions)
    ? requiredPermissions
    : [requiredPermissions];

  const hasAllPermissions = permsToCheck.every((perm) =>
    userPermissions.includes(perm)
  );

  const hasAnyPermission = permsToCheck.some((perm) =>
    userPermissions.includes(perm)
  );

  return {
    hasRole,
    hasAllPermissions,
    hasAnyPermission,
    permissions: userPermissions,
    requiredPermissions: permsToCheck,
  };
};
