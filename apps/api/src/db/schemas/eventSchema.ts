import { pgTable, integer, timestamp, varchar } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { locationSchema } from './locationSchema';
import { userSchema } from './userSchema';

export const eventSchema = pgTable('event', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  title: varchar('title', { length: 255 }).notNull(),
  location_id: integer('location_id').references(() => locationSchema.id),
  min_age: integer('min_age').notNull(),
  max_age: integer('max_age').notNull(),
  event_date: timestamp('event_date').notNull(),
  opening_time: timestamp('opening_time').notNull(),
  closing_time: timestamp('closing_time').notNull(),
  status: varchar('status', { length: 255 }).notNull(),
  created_by: integer('created_by').references(() => userSchema.id),
  amount: integer('amount').notNull(),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
});

export const eventRelations = relations(eventSchema, ({ one }) => ({
  location: one(locationSchema, {
    fields: [eventSchema.location_id],
    references: [locationSchema.id],
  }),
  creator: one(userSchema, {
    fields: [eventSchema.created_by],
    references: [userSchema.id],
  }),
}));

export type Event = typeof eventSchema.$inferSelect;
export type NewEvent = typeof eventSchema.$inferInsert;
export type EventWithLocation = Event & {
  location: typeof locationSchema.$inferSelect;
};
export type EventWithCreator = Event & {
  creator: typeof userSchema.$inferSelect;
};
export type EventWithLocationAndCreator = Event & {
  location: typeof locationSchema.$inferSelect;
  creator: typeof userSchema.$inferSelect;
};
