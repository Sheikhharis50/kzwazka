import {
  Injectable,
  CanActivate,
  ExecutionContext,
  SetMetadata,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { DatabaseService } from '../../db/drizzle.service';
import { eq, and, inArray } from 'drizzle-orm';
import { roleSchema, rolePermissionSchema, userSchema } from '../../db/schemas';

export const PERMISSION_KEY = 'permission';

export interface PermissionMetadata {
  permissionIds: string[]; // e.g., ['user_create', 'location_read']
}

export const RequirePermission = (permissionIds: string[]) =>
  SetMetadata(PERMISSION_KEY, { permissionIds });

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private dbService: DatabaseService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const permissionMetadata =
      this.reflector.getAllAndOverride<PermissionMetadata>(PERMISSION_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);

    if (!permissionMetadata) {
      return true; // No permission required
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user?.id) {
      return false;
    }

    const { permissionIds } = permissionMetadata;

    // Single optimized database call
    const hasPermission = await this.checkUserPermission(
      user.id,
      permissionIds
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        `Access denied. You don't have the required permissions`
      );
    }

    return true;
  }

  private async checkUserPermission(
    userId: number,
    permissionIds: string[]
  ): Promise<boolean> {
    try {
      // Single optimized query joining user -> role -> role_permission -> permission
      const result = await this.dbService.db
        .select({
          hasPermission: rolePermissionSchema.role_id,
        })
        .from(userSchema)
        .innerJoin(roleSchema, eq(userSchema.role_id, roleSchema.id))
        .innerJoin(
          rolePermissionSchema,
          eq(roleSchema.id, rolePermissionSchema.role_id)
        )
        .where(
          and(
            eq(userSchema.id, userId),
            inArray(rolePermissionSchema.permission_id, permissionIds)
          )
        )
        .limit(1);

      return result.length > 0;
    } catch (error) {
      console.error('Error checking permission:', error);
      return false;
    }
  }
}
