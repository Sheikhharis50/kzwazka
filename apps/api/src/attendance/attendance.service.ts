import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../db/drizzle.service';
import { eq, and, gte, lte, desc, asc, sql } from 'drizzle-orm';
import { attendanceSchema, childrenSchema, groupSchema } from '../db/schemas';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { QueryAttendanceDto } from './dto/query-attendance.dto';
import {
  APP_CONSTANTS,
  getPageOffset,
  start_of_day_date,
  end_of_day_date,
} from 'src/utils';

@Injectable()
export class AttendanceService {
  constructor(private readonly dbService: DatabaseService) {}

  async create(createAttendanceDto: CreateAttendanceDto) {
    const { date, ...attendanceData } = createAttendanceDto;

    const newAttendance = await this.dbService.db
      .insert(attendanceSchema)
      .values({
        ...attendanceData,
        date: new Date(date),
      })
      .returning();

    return {
      message: 'Successfully created attendance',
      data: newAttendance[0],
    };
  }

  async findAll(queryDto: QueryAttendanceDto = {}) {
    const {
      children_id,
      group_id,
      status,
      from_date,
      to_date,
      page = '1',
      limit = APP_CONSTANTS.PAGINATION.DEFAULT_LIMIT.toString(),
    } = queryDto;

    const offset = getPageOffset(page, limit);
    const conditions: any[] = [];

    if (group_id) {
      conditions.push(eq(attendanceSchema.group_id, group_id));
    }

    if (children_id) {
      conditions.push(eq(attendanceSchema.children_id, children_id));
    }

    if (status) {
      conditions.push(eq(attendanceSchema.status, status));
    }

    if (from_date) {
      conditions.push(gte(attendanceSchema.date, start_of_day_date(from_date)));
    }

    if (to_date) {
      conditions.push(lte(attendanceSchema.date, end_of_day_date(to_date)));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [attendance, totalCount] = await Promise.all([
      this.dbService.db
        .select({
          id: attendanceSchema.id,
          children_id: attendanceSchema.children_id,
          group_id: attendanceSchema.group_id,
          date: attendanceSchema.date,
          status: attendanceSchema.status,
          notes: attendanceSchema.notes,
          created_at: attendanceSchema.created_at,
          updated_at: attendanceSchema.updated_at,
          children: {
            id: childrenSchema.id,
            parent_first_name: childrenSchema.parent_first_name,
            parent_last_name: childrenSchema.parent_last_name,
          },
          group: {
            id: groupSchema.id,
            name: groupSchema.name,
            skill_level: groupSchema.skill_level,
          },
        })
        .from(attendanceSchema)
        .leftJoin(
          childrenSchema,
          eq(attendanceSchema.children_id, childrenSchema.id)
        )
        .leftJoin(groupSchema, eq(attendanceSchema.group_id, groupSchema.id))
        .where(whereClause)
        .orderBy(desc(attendanceSchema.date), desc(attendanceSchema.created_at))
        .limit(Number(limit))
        .offset(offset),
      this.dbService.db
        .select({ count: sql<number>`count(*)` })
        .from(attendanceSchema)
        .where(whereClause)
        .then((result) => Number(result[0]?.count || 0)),
    ]);

    return {
      message: 'Successfully fetched attendance records',
      data: attendance,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / Number(limit)),
      },
    };
  }

  async findOne(id: number) {
    const attendance = await this.dbService.db
      .select({
        id: attendanceSchema.id,
        children_id: attendanceSchema.children_id,
        group_id: attendanceSchema.group_id,
        date: attendanceSchema.date,
        status: attendanceSchema.status,
        notes: attendanceSchema.notes,
        created_at: attendanceSchema.created_at,
        updated_at: attendanceSchema.updated_at,
        children: {
          id: childrenSchema.id,
          parent_first_name: childrenSchema.parent_first_name,
          parent_last_name: childrenSchema.parent_last_name,
        },
        group: {
          id: groupSchema.id,
          name: groupSchema.name,
          skill_level: groupSchema.skill_level,
        },
      })
      .from(attendanceSchema)
      .leftJoin(
        childrenSchema,
        eq(attendanceSchema.children_id, childrenSchema.id)
      )
      .leftJoin(groupSchema, eq(attendanceSchema.group_id, groupSchema.id))
      .where(eq(attendanceSchema.id, id))
      .limit(1);

    if (attendance.length === 0) {
      throw new NotFoundException('Attendance record not found');
    }

    return {
      message: 'Successfully fetched attendance record',
      data: attendance[0],
    };
  }

  async update(id: number, updateAttendanceDto: UpdateAttendanceDto) {
    const { date, ...updateData } = updateAttendanceDto;

    const updateValues = {
      ...updateData,
      ...(date !== undefined && { date: new Date(date) }),
      updated_at: new Date(),
    };

    const updatedAttendance = await this.dbService.db
      .update(attendanceSchema)
      .set(updateValues)
      .where(eq(attendanceSchema.id, id))
      .returning();

    if (updatedAttendance.length === 0) {
      throw new NotFoundException('Attendance record not found');
    }

    return {
      message: 'Successfully updated attendance record',
      data: updatedAttendance[0],
    };
  }

  async remove(id: number) {
    const deletedAttendance = await this.dbService.db
      .delete(attendanceSchema)
      .where(eq(attendanceSchema.id, id))
      .returning();

    if (deletedAttendance.length === 0) {
      throw new NotFoundException('Attendance record not found');
    }

    return {
      message: 'Successfully deleted attendance record',
      data: deletedAttendance[0],
    };
  }

  async getAttendanceByChildren(
    childrenId: number,
    queryDto: QueryAttendanceDto = {}
  ) {
    const {
      from_date,
      to_date,
      page = '1',
      limit = APP_CONSTANTS.PAGINATION.DEFAULT_LIMIT.toString(),
    } = queryDto;
    const offset = getPageOffset(page, limit);
    const conditions: any[] = [eq(attendanceSchema.children_id, childrenId)];

    if (from_date) {
      conditions.push(gte(attendanceSchema.date, start_of_day_date(from_date)));
    }

    if (to_date) {
      conditions.push(lte(attendanceSchema.date, end_of_day_date(to_date)));
    }

    const [attendance, totalCount] = await Promise.all([
      this.dbService.db
        .select({
          id: attendanceSchema.id,
          group_id: attendanceSchema.group_id,
          date: attendanceSchema.date,
          status: attendanceSchema.status,
          notes: attendanceSchema.notes,
          created_at: attendanceSchema.created_at,
          group: {
            id: groupSchema.id,
            name: groupSchema.name,
            skill_level: groupSchema.skill_level,
          },
        })
        .from(attendanceSchema)
        .leftJoin(groupSchema, eq(attendanceSchema.group_id, groupSchema.id))
        .where(and(...conditions))
        .orderBy(desc(attendanceSchema.date))
        .limit(Number(limit))
        .offset(offset),
      this.dbService.db
        .select({ count: sql<number>`count(*)` })
        .from(attendanceSchema)
        .where(and(...conditions))
        .then((result) => Number(result[0]?.count || 0)),
    ]);

    return {
      message: 'Successfully fetched children attendance records',
      data: attendance,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / Number(limit)),
      },
    };
  }

  async getAttendanceByGroup(
    groupId: number,
    queryDto: QueryAttendanceDto = {}
  ) {
    const {
      from_date,
      to_date,
      page = '1',
      limit = APP_CONSTANTS.PAGINATION.DEFAULT_LIMIT.toString(),
    } = queryDto;
    const offset = getPageOffset(page, limit);
    const conditions: any[] = [eq(attendanceSchema.group_id, groupId)];

    if (from_date) {
      conditions.push(gte(attendanceSchema.date, start_of_day_date(from_date)));
    }

    if (to_date) {
      conditions.push(lte(attendanceSchema.date, end_of_day_date(to_date)));
    }

    const [attendance, totalCount] = await Promise.all([
      this.dbService.db
        .select({
          id: attendanceSchema.id,
          children_id: attendanceSchema.children_id,
          date: attendanceSchema.date,
          status: attendanceSchema.status,
          notes: attendanceSchema.notes,
          created_at: attendanceSchema.created_at,
          children: {
            id: childrenSchema.id,
            parent_first_name: childrenSchema.parent_first_name,
            parent_last_name: childrenSchema.parent_last_name,
          },
        })
        .from(attendanceSchema)
        .leftJoin(
          childrenSchema,
          eq(attendanceSchema.children_id, childrenSchema.id)
        )
        .where(and(...conditions))
        .orderBy(
          asc(childrenSchema.parent_first_name),
          desc(attendanceSchema.date)
        )
        .limit(Number(limit))
        .offset(offset),
      this.dbService.db
        .select({ count: sql<number>`count(*)` })
        .from(attendanceSchema)
        .where(and(...conditions))
        .then((result) => Number(result[0]?.count || 0)),
    ]);

    return {
      message: 'Successfully fetched group attendance records',
      data: attendance,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / Number(limit)),
      },
    };
  }
}
