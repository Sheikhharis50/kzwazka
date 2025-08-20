import { pgTable, timestamp, integer, text } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { childrenSchema } from './childrenSchema';
import { groupSchema } from './groupSchema';

export const attendanceSchema = pgTable('attendance', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  children_id: integer('children_id').references(() => childrenSchema.id),
  group_id: integer('group_id').references(() => groupSchema.id),
  date: timestamp('date').notNull(),
  status: text('status').notNull(), // 'present', 'absent', 'late'
  notes: text('notes'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const attendanceRelations = relations(attendanceSchema, ({ one }) => ({
  children: one(childrenSchema, {
    fields: [attendanceSchema.children_id],
    references: [childrenSchema.id],
  }),
  group: one(groupSchema, {
    fields: [attendanceSchema.group_id],
    references: [groupSchema.id],
  }),
}));

export type Attendance = typeof attendanceSchema.$inferSelect;
export type NewAttendance = typeof attendanceSchema.$inferInsert;
export type AttendanceWithChildren = Attendance & {
  children: typeof childrenSchema.$inferSelect;
};
export type AttendanceWithGroup = Attendance & {
  group: typeof groupSchema.$inferSelect;
};
export type AttendanceWithChildrenAndGroup = Attendance & {
  children: typeof childrenSchema.$inferSelect;
  group: typeof groupSchema.$inferSelect;
};
