import { pgTable, text, timestamp, integer, jsonb } from 'drizzle-orm/pg-core';
import { childrenSchema } from './childrenSchema';
import { locationSchema } from './locationSchema';

export const childrenInvoiceSchema = pgTable('children_invoice', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  location_id: integer('location_id').references(() => locationSchema.id),
  children_id: integer('children_id').references(() => childrenSchema.id),
  external_id: text('external_id').notNull(),
  amount: integer('amount').notNull(),
  status: text('status').notNull(),
  metadata: jsonb('metadata').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
