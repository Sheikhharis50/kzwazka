import { pgTable, integer, timestamp, varchar } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { locationSchema } from './locationSchema';
import { userSchema } from './userSchema';

export const eventSchema = pgTable('event', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  title: varchar('title', { length: 255 }).notNull(),
  location_id: integer().references(() => locationSchema.id),
  min_age: integer().notNull(),
  max_age: integer().notNull(),
  event_date: timestamp().notNull(),
  opening_time: timestamp().notNull(),
  closing_time: timestamp().notNull(),
  status: varchar('status', { length: 255 }).notNull(),
  created_by: integer().references(() => userSchema.id),
  amount: integer().notNull(),
  created_at: timestamp().notNull().defaultNow(),
  updated_at: timestamp().notNull().defaultNow(),
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
