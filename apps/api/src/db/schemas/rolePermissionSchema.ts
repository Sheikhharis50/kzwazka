import { pgTable, text, timestamp, primaryKey } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { roleSchema } from './roleSchema';
import { permissionSchema } from './permissionSchema';

export const rolePermissionSchema = pgTable(
  'role_permission',
  {
    role_id: text('role_id')
      .notNull()
      .references(() => roleSchema.id),
    permission_id: text('permission_id')
      .notNull()
      .references(() => permissionSchema.id),
    created_at: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [primaryKey({ columns: [table.role_id, table.permission_id] })]
);

export const rolePermissionRelations = relations(
  rolePermissionSchema,
  ({ one }) => ({
    role: one(roleSchema, {
      fields: [rolePermissionSchema.role_id],
      references: [roleSchema.id],
    }),
    permission: one(permissionSchema, {
      fields: [rolePermissionSchema.permission_id],
      references: [permissionSchema.id],
    }),
  })
);

export type RolePermission = typeof rolePermissionSchema.$inferSelect;
export type NewRolePermission = typeof rolePermissionSchema.$inferInsert;
