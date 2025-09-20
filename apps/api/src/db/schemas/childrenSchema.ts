import {
  pgTable,
  varchar,
  timestamp,
  date,
  integer,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { userSchema } from './userSchema';
import { childrenInvoiceSchema } from './childrenInvoiceSchema';
import { insuranceSchema } from './insuranceSchema';
import { attendanceSchema } from './attendanceSchema';
import { groupSchema } from './groupSchema';

export const childrenSchema = pgTable('children', {
  id: integer('id').primaryKey().notNull().generatedAlwaysAsIdentity(),
  user_id: integer('user_id')
    .notNull()
    .references(() => userSchema.id, {
      onDelete: 'cascade',
    }),
  dob: date('dob').notNull(),
  parent_first_name: varchar('parent_first_name', { length: 100 }),
  parent_last_name: varchar('parent_last_name', { length: 100 }),
  group_id: integer('group_id').references(() => groupSchema.id, {
    onDelete: 'cascade',
  }),
  external_id: varchar('external_id', { length: 255 }),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at'),
});

export const childrenRelations = relations(childrenSchema, ({ one, many }) => ({
  user: one(userSchema, {
    fields: [childrenSchema.user_id],
    references: [userSchema.id],
  }),
  group: one(groupSchema, {
    fields: [childrenSchema.group_id],
    references: [groupSchema.id],
  }),
  invoices: many(childrenInvoiceSchema),
  insurance: many(insuranceSchema),
  attendance: many(attendanceSchema),
}));

export type Children = typeof childrenSchema.$inferSelect;
export type NewChildren = typeof childrenSchema.$inferInsert;
export type ChildrenWithUser = Children & {
  user: typeof userSchema.$inferSelect;
};
export type ChildrenWithGroup = Children & {
  group: typeof groupSchema.$inferSelect;
};
export type ChildrenWithUserAndGroup = Children & {
  user: typeof userSchema.$inferSelect;
  group: typeof groupSchema.$inferSelect;
};
