import {
  pgTable,
  text,
  varchar,
  timestamp,
  boolean,
  time,
  numeric,
  integer,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { childrenSchema } from './childrenSchema';
import { eventSchema } from './eventSchema';
import { coachSchema } from './coachSchema';
import { groupSchema } from './groupSchema';
import { childrenInvoiceSchema } from './childrenInvoiceSchema';

export const locationSchema = pgTable('locations', {
  id: integer('id').primaryKey().notNull().generatedAlwaysAsIdentity(),
  name: varchar('name', { length: 200 }),
  address1: varchar('address1', { length: 500 }).notNull(),
  address2: varchar('address2', { length: 500 }),
  city: varchar('city', { length: 100 }).notNull(),
  state: varchar('state', { length: 100 }).notNull(),
  country: varchar('country', { length: 100 }).notNull(),
  opening_time: time('opening_time'),
  closing_time: time('closing_time'),
  description: text('description'),
  amount: numeric('amount'),
  external_id: varchar('external_id', { length: 200 }),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at'),
  is_active: boolean('is_active').default(true).notNull(),
});

export const locationRelations = relations(locationSchema, ({ many }) => ({
  children: many(childrenSchema),
  events: many(eventSchema),
  coaches: many(coachSchema),
  groups: many(groupSchema),
  invoices: many(childrenInvoiceSchema),
}));

export type Location = typeof locationSchema.$inferSelect;
export type NewLocation = typeof locationSchema.$inferInsert;
