import { pgTable, text, timestamp, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { groupSchema } from './groupSchema';

export const messageSchema = pgTable('message', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  content: text('content').notNull(),
  content_type: text('content_type').notNull(),
  group_id: integer('group_id').references(() => groupSchema.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const messageRelations = relations(messageSchema, ({ one }) => ({
  group: one(groupSchema, {
    fields: [messageSchema.group_id],
    references: [groupSchema.id],
  }),
}));

export type Message = typeof messageSchema.$inferSelect;
export type NewMessage = typeof messageSchema.$inferInsert;
export type MessageWithGroup = Message & {
  group: typeof groupSchema.$inferSelect;
};
