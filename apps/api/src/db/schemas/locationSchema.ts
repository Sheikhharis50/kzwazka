import {
  pgTable,
  text,
  varchar,
  timestamp,
  boolean,
  time,
  integer,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { eventSchema } from './eventSchema';
import { coachSchema } from './coachSchema';
import { groupSchema } from './groupSchema';

export const locationSchema = pgTable('locations', {
  id: integer('id').primaryKey().notNull().generatedAlwaysAsIdentity(),
  name: varchar('name', { length: 200 }),
  address1: varchar('address1', { length: 500 }).notNull(),
  address2: varchar('address2', { length: 500 }),
  city: varchar('city', { length: 100 }).notNull(),
  state: varchar('state', { length: 100 }).notNull(),
  photo_url: text('photo_url'),
  url: text('url'),
  country: varchar('country', { length: 100 }).notNull(),
  opening_time: time('opening_time'),
  closing_time: time('closing_time'),
  description: text('description'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at'),
  is_active: boolean('is_active').default(true).notNull(),
});

export const locationRelations = relations(locationSchema, ({ many }) => ({
  events: many(eventSchema),
  coaches: many(coachSchema),
  groups: many(groupSchema),
}));

export type Location = typeof locationSchema.$inferSelect;
export type NewLocation = typeof locationSchema.$inferInsert;
