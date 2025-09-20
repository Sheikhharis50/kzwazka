import { pgTable, timestamp, integer, text } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { childrenSchema } from './childrenSchema';

export const attendanceSchema = pgTable('attendance', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  children_id: integer('children_id').references(() => childrenSchema.id, {
    onDelete: 'cascade',
  }),
  date: timestamp('date').notNull(),
  status: text('status').notNull(),
  notes: text('notes'),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
});

export const attendanceRelations = relations(attendanceSchema, ({ one }) => ({
  children: one(childrenSchema, {
    fields: [attendanceSchema.children_id],
    references: [childrenSchema.id],
  }),
}));

export type Attendance = typeof attendanceSchema.$inferSelect;
export type NewAttendance = typeof attendanceSchema.$inferInsert;
export type AttendanceWithChildren = Attendance & {
  children: typeof childrenSchema.$inferSelect;
};
