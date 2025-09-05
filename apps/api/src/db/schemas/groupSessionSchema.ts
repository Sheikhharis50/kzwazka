import {
  integer,
  pgTable,
  timestamp,
  varchar,
  time,
} from 'drizzle-orm/pg-core';
import { groupSchema } from './groupSchema';
import { relations } from 'drizzle-orm';

export const groupSessionSchema = pgTable('group_session', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  group_id: integer('group_id')
    .notNull()
    .references(() => groupSchema.id, {
      onDelete: 'cascade',
    }),
  day: varchar('day', { length: 10 }).notNull(),
  start_time: time('start_time').notNull(),
  end_time: time('end_time').notNull(),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
});

export type GroupSession = typeof groupSessionSchema.$inferSelect;

export const groupSessionRelations = relations(
  groupSessionSchema,
  ({ one }) => ({
    group: one(groupSchema, {
      fields: [groupSessionSchema.group_id],
      references: [groupSchema.id],
    }),
  })
);

export type GroupSessionWithGroup = GroupSession & {
  group: typeof groupSchema.$inferSelect;
};
