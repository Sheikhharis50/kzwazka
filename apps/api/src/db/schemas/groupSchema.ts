import { pgTable, text, timestamp, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { locationSchema } from './locationSchema';
import { coachSchema } from './coachSchema';
import { childrenGroupSchema } from './childrenGroupSchema';
import { messageSchema } from './messageSchema';

export const groupSchema = pgTable('group', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  name: text('name').notNull(),
  description: text('description'),
  min_age: integer('min_age').notNull(),
  max_age: integer('max_age').notNull(),
  skill_level: text('skill_level').notNull(),
  max_group_size: integer('max_group_size').notNull(),
  location_id: integer('location_id').references(() => locationSchema.id),
  coach_id: integer('coach_id').references(() => coachSchema.id),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
});

export const groupRelations = relations(groupSchema, ({ one, many }) => ({
  location: one(locationSchema, {
    fields: [groupSchema.location_id],
    references: [locationSchema.id],
  }),
  coach: one(coachSchema, {
    fields: [groupSchema.coach_id],
    references: [coachSchema.id],
  }),
  childrenGroups: many(childrenGroupSchema),
  messages: many(messageSchema),
}));

export type Group = typeof groupSchema.$inferSelect;
export type NewGroup = typeof groupSchema.$inferInsert;
export type GroupWithLocation = Group & {
  location: typeof locationSchema.$inferSelect;
};
export type GroupWithCoach = Group & {
  coach: typeof coachSchema.$inferSelect;
};
export type GroupWithLocationAndCoach = Group & {
  location: typeof locationSchema.$inferSelect;
  coach: typeof coachSchema.$inferSelect;
};
