import { pgTable, integer, timestamp, varchar } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { locationSchema } from './locationSchema';
import { groupSchema } from './groupSchema';
import { coachSchema } from './coachSchema';

export const eventSchema = pgTable('event', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  title: varchar('title', { length: 255 }).notNull(),
  location_id: integer('location_id').references(() => locationSchema.id, {
    onDelete: 'cascade',
  }),
  start_date: timestamp('start_date').notNull(),
  end_date: timestamp('end_date'),
  opening_time: timestamp('opening_time'),
  closing_time: timestamp('closing_time'),
  event_type: varchar('event_type', { length: 255 }).notNull(),
  group_id: integer('group_id')
    .references(() => groupSchema.id, {
      onDelete: 'cascade',
    })
    .notNull(),
  coach_id: integer('coach_id').references(() => coachSchema.id, {
    onDelete: 'cascade',
  }),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
});

export const eventRelations = relations(eventSchema, ({ one }) => ({
  location: one(locationSchema, {
    fields: [eventSchema.location_id],
    references: [locationSchema.id],
  }),
  group: one(groupSchema, {
    fields: [eventSchema.group_id],
    references: [groupSchema.id],
  }),
  coach: one(coachSchema, {
    fields: [eventSchema.coach_id],
    references: [coachSchema.id],
  }),
}));

export type Event = typeof eventSchema.$inferSelect;
export type NewEvent = typeof eventSchema.$inferInsert;
export type EventWithLocation = Event & {
  location: typeof locationSchema.$inferSelect;
};
export type EventWithLocationAndGroup = Event & {
  location: typeof locationSchema.$inferSelect;
  group: typeof groupSchema.$inferSelect;
};
