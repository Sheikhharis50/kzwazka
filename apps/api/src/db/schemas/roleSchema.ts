import { pgTable, text, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { rolePermissionSchema } from './rolePermissionSchema';
import { userSchema } from './userSchema';

export const roleSchema = pgTable('role', {
  id: text('id').primaryKey().notNull(),
  name: text('name').notNull(),
  description: text('description'),
  is_active: boolean('is_active').default(false).notNull(),
});

export const roleRelations = relations(roleSchema, ({ many }) => ({
  rolePermissions: many(rolePermissionSchema),
  users: many(userSchema),
}));

export type Role = typeof roleSchema.$inferSelect;
export type NewRole = typeof roleSchema.$inferInsert;