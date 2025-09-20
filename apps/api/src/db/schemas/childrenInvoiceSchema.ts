import { pgTable, text, timestamp, integer, jsonb } from 'drizzle-orm/pg-core';
import { childrenSchema } from './childrenSchema';
import { groupSchema } from './groupSchema';
import { relations } from 'drizzle-orm';

export const childrenInvoiceSchema = pgTable('children_invoice', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  group_id: integer('group_id').references(() => groupSchema.id, {
    onDelete: 'cascade',
  }),
  children_id: integer('children_id').references(() => childrenSchema.id, {
    onDelete: 'cascade',
  }),
  external_id: text('external_id'),
  amount: integer('amount').notNull(),
  status: text('status').notNull(),
  metadata: jsonb('metadata').notNull(),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
});

export const childrenInvoiceRelations = relations(
  childrenInvoiceSchema,
  ({ one }) => ({
    group: one(groupSchema, {
      fields: [childrenInvoiceSchema.group_id],
      references: [groupSchema.id],
    }),
    children: one(childrenSchema, {
      fields: [childrenInvoiceSchema.children_id],
      references: [childrenSchema.id],
    }),
  })
);

export type ChildrenInvoice = typeof childrenInvoiceSchema.$inferSelect;
export type NewChildrenInvoice = typeof childrenInvoiceSchema.$inferInsert;
