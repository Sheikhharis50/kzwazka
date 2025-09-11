import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../db/drizzle.service';
import { eq, and, gte, lte, desc, asc, sql, SQLWrapper } from 'drizzle-orm';
import {
  attendanceSchema,
  Attendance,
  AttendanceWithChildrenAndGroup,
  childrenSchema,
  groupSchema,
} from '../db/schemas';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { QueryAttendanceDto } from './dto/query-attendance.dto';
import {
  APP_CONSTANTS,
  getPageOffset,
  start_of_day_date,
  end_of_day_date,
} from '../utils';
import { APIResponse } from '../utils/response';

@Injectable()
export class AttendanceService {
  constructor(private readonly dbService: DatabaseService) {}

  async create(
    createAttendanceDto: CreateAttendanceDto
  ): Promise<APIResponse<Attendance>> {
    const { date, ...attendanceData } = createAttendanceDto;

    const newAttendance = await this.dbService.db
      .insert(attendanceSchema)
      .values({
        ...attendanceData,
        date: new Date(date),
      })
      .returning();

    return APIResponse.success<Attendance>({
      message: 'Successfully created attendance',
      data: newAttendance[0],
      statusCode: 201,
    });
  }

  async findAll(
    queryDto: QueryAttendanceDto = {}
  ): Promise<APIResponse<Attendance[]>> {
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
    const conditions: SQLWrapper[] = [];

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

    return APIResponse.success<Attendance[]>({
      message: 'Successfully fetched attendance records',
      data: attendance,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        count: totalCount,
        totalPages: Math.ceil(totalCount / Number(limit)),
      },
      statusCode: 200,
    });
  }

  async findOne(id: number): Promise<APIResponse<Attendance>> {
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

    return APIResponse.success<Attendance>({
      message: 'Successfully fetched attendance record',
      data: attendance[0],
      statusCode: 200,
    });
  }

  async update(
    id: number,
    updateAttendanceDto: UpdateAttendanceDto
  ): Promise<APIResponse<Attendance>> {
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

    return APIResponse.success<Attendance>({
      message: 'Successfully updated attendance record',
      data: updatedAttendance[0],
      statusCode: 200,
    });
  }

  async remove(id: number): Promise<APIResponse<Attendance>> {
    const deletedAttendance = await this.dbService.db
      .delete(attendanceSchema)
      .where(eq(attendanceSchema.id, id))
      .returning();

    if (deletedAttendance.length === 0) {
      throw new NotFoundException('Attendance record not found');
    }

    return APIResponse.success<Attendance>({
      message: 'Successfully deleted attendance record',
      data: deletedAttendance[0],
      statusCode: 200,
    });
  }

  async getAttendanceByChildren(
    childrenId: number,
    queryDto: QueryAttendanceDto = {}
  ): Promise<APIResponse<AttendanceWithChildrenAndGroup[]>> {
    const {
      from_date,
      to_date,
      page = '1',
      limit = APP_CONSTANTS.PAGINATION.DEFAULT_LIMIT.toString(),
    } = queryDto;
    const offset = getPageOffset(page, limit);
    const conditions: SQLWrapper[] = [
      eq(attendanceSchema.children_id, childrenId),
    ];

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
          group_id: attendanceSchema.group_id,
          date: attendanceSchema.date,
          status: attendanceSchema.status,
          notes: attendanceSchema.notes,
          created_at: attendanceSchema.created_at,
          updated_at: attendanceSchema.updated_at,
          children: {
            id: childrenSchema.id,
            user_id: childrenSchema.user_id,
            created_at: childrenSchema.created_at,
            updated_at: childrenSchema.updated_at,
            dob: childrenSchema.dob,
            parent_first_name: childrenSchema.parent_first_name,
            parent_last_name: childrenSchema.parent_last_name,
            location_id: childrenSchema.location_id,
          },
          group: {
            id: groupSchema.id,
            name: groupSchema.name,
            description: groupSchema.description,
            photo_url: groupSchema.photo_url,
            created_at: groupSchema.created_at,
            updated_at: groupSchema.updated_at,
            location_id: groupSchema.location_id,
            min_age: groupSchema.min_age,
            max_age: groupSchema.max_age,
            skill_level: groupSchema.skill_level,
            max_group_size: groupSchema.max_group_size,
            coach_id: groupSchema.coach_id,
          },
        })
        .from(attendanceSchema)
        .leftJoin(
          childrenSchema,
          eq(attendanceSchema.children_id, childrenSchema.id)
        )
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

    return APIResponse.success<AttendanceWithChildrenAndGroup[]>({
      message: 'Successfully fetched children attendance records',
      data: attendance,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        count: totalCount,
        totalPages: Math.ceil(totalCount / Number(limit)),
      },
      statusCode: 200,
    });
  }
  async getAttendanceByGroup(
    groupId: number,
    queryDto: QueryAttendanceDto = {}
  ): Promise<APIResponse<Attendance[]>> {
    const {
      from_date,
      to_date,
      page = '1',
      limit = APP_CONSTANTS.PAGINATION.DEFAULT_LIMIT.toString(),
    } = queryDto;
    const offset = getPageOffset(page, limit);
    const conditions: SQLWrapper[] = [eq(attendanceSchema.group_id, groupId)];

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

    return APIResponse.success<Attendance[]>({
      message: 'Successfully fetched group attendance records',
      data: attendance,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        count: totalCount,
        totalPages: Math.ceil(totalCount / Number(limit)),
      },
      statusCode: 200,
    });
  }
}
