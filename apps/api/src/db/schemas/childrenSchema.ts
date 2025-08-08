import {
  pgTable,
  varchar,
  timestamp,
  date,
  integer,
  text,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { userSchema } from './userSchema';
import { locationSchema } from './locationSchema';

export const childrenSchema = pgTable('children', {
  id: integer('id').primaryKey().notNull().generatedAlwaysAsIdentity(),
  user_id: integer('user_id')
    .notNull()
    .references(() => userSchema.id),
  dob: date('dob').notNull(),
  photo_url: text('photo_url'),
  parent_first_name: varchar('parent_first_name', { length: 100 }),
  parent_last_name: varchar('parent_last_name', { length: 100 }),
  location_id: integer('location_id').references(() => locationSchema.id),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at'),
});

export const childrenRelations = relations(childrenSchema, ({ one }) => ({
  user: one(userSchema, {
    fields: [childrenSchema.user_id],
    references: [userSchema.id],
  }),
  location: one(locationSchema, {
    fields: [childrenSchema.location_id],
    references: [locationSchema.id],
  }),
}));

export type Children = typeof childrenSchema.$inferSelect;
export type NewChildren = typeof childrenSchema.$inferInsert;
export type ChildrenWithUser = Children & {
  user: typeof userSchema.$inferSelect;
};
export type ChildrenWithLocation = Children & {
  location: typeof locationSchema.$inferSelect;
};
export type ChildrenWithUserAndLocation = Children & {
  user: typeof userSchema.$inferSelect;
  location: typeof locationSchema.$inferSelect;
};
