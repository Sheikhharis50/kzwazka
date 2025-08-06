import {
  pgTable,
  text,
  varchar,
  boolean,
  timestamp,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { Role, roleSchema } from './roleSchema';

export const userSchema = pgTable('user', {
  id: text('id').primaryKey().notNull(),
  first_name: varchar('first_name', { length: 100 }).notNull(),
  last_name: varchar('last_name', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  phone: varchar('phone', { length: 20 }),
  password: varchar('password', { length: 255 }),
  role_id: text('role_id')
    .notNull()
    .references(() => roleSchema.id),
  is_active: boolean('is_active').default(true).notNull(),
  is_verified: boolean('is_verified').default(false).notNull(),
  google_social_id: varchar('google_social_id', { length: 255 }),
  token: text('token'),
  otp: varchar('otp', { length: 10 }),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at'),
});

export const userRelations = relations(userSchema, ({ one }) => ({
  role: one(roleSchema, {
    fields: [userSchema.role_id],
    references: [roleSchema.id],
  }),
}));

export type User = typeof userSchema.$inferSelect;
export type NewUser = typeof userSchema.$inferInsert;
export type UserWithRole = User & {
  role: Role;
};
