import { pgTable, text, timestamp, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { groupSchema } from './groupSchema';
import { userSchema } from './userSchema';

export const messageSchema = pgTable('message', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  content: text('content').notNull(),
  content_type: text('content_type').notNull(),
  group_id: integer('group_id').references(() => groupSchema.id, {
    onDelete: 'cascade',
  }),
  created_by: integer('created_by').references(() => userSchema.id, {
    onDelete: 'cascade',
  }),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
});

export const messageRelations = relations(messageSchema, ({ one }) => ({
  group: one(groupSchema, {
    fields: [messageSchema.group_id],
    references: [groupSchema.id],
  }),
  created_by: one(userSchema, {
    fields: [messageSchema.created_by],
    references: [userSchema.id],
  }),
}));

export type Message = typeof messageSchema.$inferSelect;
export type NewMessage = typeof messageSchema.$inferInsert;
export type MessageWithGroup = Message & {
  group: typeof groupSchema.$inferSelect;
};
