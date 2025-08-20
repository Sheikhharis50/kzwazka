import {
  pgTable,
  text,
  timestamp,
  integer,
  boolean,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { locationSchema } from './locationSchema';
import { userSchema } from './userSchema';
import { groupSchema } from './groupSchema';

export const coachSchema = pgTable('coach', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  user_id: integer('user_id').references(() => userSchema.id),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone').notNull(),
  status: boolean('status').notNull().default(true),
  location_id: integer('location_id').references(() => locationSchema.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const coachRelations = relations(coachSchema, ({ one, many }) => ({
  user: one(userSchema, {
    fields: [coachSchema.user_id],
    references: [userSchema.id],
  }),
  location: one(locationSchema, {
    fields: [coachSchema.location_id],
    references: [locationSchema.id],
  }),
  groups: many(groupSchema),
}));

export type Coach = typeof coachSchema.$inferSelect;
export type NewCoach = typeof coachSchema.$inferInsert;
export type CoachWithUser = Coach & {
  user: typeof userSchema.$inferSelect;
};
export type CoachWithLocation = Coach & {
  location: typeof locationSchema.$inferSelect;
};
export type CoachWithUserAndLocation = Coach & {
  user: typeof userSchema.$inferSelect;
  location: typeof locationSchema.$inferSelect;
};
