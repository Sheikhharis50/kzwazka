import { pgTable, text, timestamp, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { childrenSchema } from './childrenSchema';

export const insuranceSchema = pgTable('insurance', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  children_id: integer('children_id').references(() => childrenSchema.id),
  name: text('name').notNull(),
  policy_id: text('policy_id').notNull(),
  start_date: timestamp('start_date').notNull(),
  end_date: timestamp('end_date').notNull(),
  status: text('status').notNull(),
  coverage_type: text('coverage_type'),
  content: text('content'),
  coverage_amount: integer('coverage_amount'),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
});

export const insuranceRelations = relations(insuranceSchema, ({ one }) => ({
  children: one(childrenSchema, {
    fields: [insuranceSchema.children_id],
    references: [childrenSchema.id],
  }),
}));

export type Insurance = typeof insuranceSchema.$inferSelect;
export type NewInsurance = typeof insuranceSchema.$inferInsert;
export type InsuranceWithChildren = Insurance & {
  children: typeof childrenSchema.$inferSelect;
};
