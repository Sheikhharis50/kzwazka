import { pgTable, text } from "drizzle-orm/pg-core";
import { relations } from 'drizzle-orm';
import { rolePermissionSchema } from "./rolePermissionSchema";

export const permissionSchema = pgTable('permission', {
  id: text('id').primaryKey().notNull(),
  name: text('name').notNull(),
  action: text('action').notNull(),
  module: text('module').notNull(),
  description: text('description'),
});

export const permissionRelations = relations(permissionSchema, ({ many }) => ({
  rolePermissions: many(rolePermissionSchema),
}));

export type Permission = typeof permissionSchema.$inferSelect;
export type NewPermission = typeof permissionSchema.$inferInsert;