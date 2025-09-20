import {
  pgTable,
  text,
  timestamp,
  integer,
  varchar,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { locationSchema } from './locationSchema';
import { coachSchema } from './coachSchema';
import { messageSchema } from './messageSchema';
import { childrenSchema } from './childrenSchema';
import { childrenInvoiceSchema } from './childrenInvoiceSchema';
import { groupSessionSchema } from './groupSessionSchema';
import { eventSchema } from './eventSchema';

export const groupSchema = pgTable('group', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  name: text('name').notNull(),
  description: text('description'),
  min_age: integer('min_age').notNull(),
  max_age: integer('max_age').notNull(),
  skill_level: text('skill_level').notNull(),
  max_group_size: integer('max_group_size').notNull(),
  location_id: integer('location_id').references(() => locationSchema.id, {
    onDelete: 'cascade',
  }),
  coach_id: integer('coach_id').references(() => coachSchema.id, {
    onDelete: 'cascade',
  }),
  external_id: varchar('external_id', { length: 255 }),
  amount: integer('amount'),
  photo_url: text('photo_url'),
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
  messages: many(messageSchema),
  children: many(childrenSchema),
  invoices: many(childrenInvoiceSchema),
  sessions: many(groupSessionSchema),
  events: many(eventSchema),
}));

export type Group = typeof groupSchema.$inferSelect;
export type NewGroup = typeof groupSchema.$inferInsert;
export type GroupWithLocation = Group & {
  location: typeof locationSchema.$inferSelect;
};
export type GroupWithCoach = Group & {
  coach: typeof coachSchema.$inferSelect;
};
export type GroupWithLocationAndCoachAndChildren = Group & {
  location: typeof locationSchema.$inferSelect;
  coach: typeof coachSchema.$inferSelect;
  children: typeof childrenSchema.$inferSelect;
};
