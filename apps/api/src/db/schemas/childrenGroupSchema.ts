import { pgTable, timestamp, integer, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { childrenSchema } from './childrenSchema';
import { groupSchema } from './groupSchema';

export const childrenGroupSchema = pgTable('children_group', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  children_id: integer('children_id').references(() => childrenSchema.id),
  group_id: integer('group_id').references(() => groupSchema.id),
  status: boolean('status').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const childrenGroupRelations = relations(
  childrenGroupSchema,
  ({ one }) => ({
    children: one(childrenSchema, {
      fields: [childrenGroupSchema.children_id],
      references: [childrenSchema.id],
    }),
    group: one(groupSchema, {
      fields: [childrenGroupSchema.group_id],
      references: [groupSchema.id],
    }),
  })
);

export type ChildrenGroup = typeof childrenGroupSchema.$inferSelect;
export type NewChildrenGroup = typeof childrenGroupSchema.$inferInsert;
export type ChildrenGroupWithChildren = ChildrenGroup & {
  children: typeof childrenSchema.$inferSelect;
};
export type ChildrenGroupWithGroup = ChildrenGroup & {
  group: typeof groupSchema.$inferSelect;
};
export type ChildrenGroupWithChildrenAndGroup = ChildrenGroup & {
  children: typeof childrenSchema.$inferSelect;
  group: typeof groupSchema.$inferSelect;
};
