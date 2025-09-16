import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../db/drizzle.service';
import { eq, and, desc, SQLWrapper, sql, inArray } from 'drizzle-orm';
import {
  attendanceSchema,
  Attendance,
  childrenSchema,
  groupSchema,
  userSchema,
  childrenGroupSchema,
} from '../db/schemas';
import {
  CreateAttendanceDto,
  MarkAllAsPresentDto,
} from './dto/create-attendance.dto';
import { QueryAttendanceDto } from './dto/query-attendance.dto';
import {
  APP_CONSTANTS,
  ATTENDANCE_STATUS,
  end_of_day_date,
  getPageOffset,
} from '../utils';
import { APIResponse } from '../utils/response';
import { IResponseAttendance } from './attendance.types';
import { FileStorageService } from '../services/file-storage.service';

@Injectable()
export class AttendanceService {
  constructor(
    private readonly dbService: DatabaseService,
    private readonly fileStorageService: FileStorageService
  ) {}

  async create(
    createAttendanceDto: CreateAttendanceDto
  ): Promise<APIResponse<Attendance>> {
    const { date, ...attendanceData } = createAttendanceDto;

    const existingAttendance = await this.dbService.db
      .select()
      .from(attendanceSchema)
      .where(
        and(
          eq(attendanceSchema.children_id, createAttendanceDto.children_id),
          eq(attendanceSchema.group_id, createAttendanceDto.group_id),
          eq(attendanceSchema.date, new Date(date))
        )
      )
      .limit(1);

    if (existingAttendance.length > 0) {
      const updatedAttendance = await this.dbService.db
        .update(attendanceSchema)
        .set({
          ...attendanceData,
          updated_at: new Date(),
        })
        .where(eq(attendanceSchema.id, existingAttendance[0].id))
        .returning();
      return APIResponse.success<Attendance>({
        message: 'Successfully updated attendance',
        data: updatedAttendance[0],
        statusCode: 200,
      });
    }

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
    queryDto: QueryAttendanceDto
  ): Promise<APIResponse<IResponseAttendance[]>> {
    const offset = getPageOffset(
      queryDto.page || '1',
      queryDto.limit || APP_CONSTANTS.PAGINATION.DEFAULT_LIMIT.toString()
    );

    const conditions: SQLWrapper[] = [];

    if (queryDto.children_id) {
      conditions.push(eq(childrenSchema.id, queryDto.children_id));
    }

    if (queryDto.group_id) {
      conditions.push(eq(childrenGroupSchema.group_id, queryDto.group_id));
    }

    // For attendance-related filters, we need to handle them differently
    // since we're using leftJoin and want to include children without attendance
    const attendanceConditions: SQLWrapper[] = [];
    if (queryDto.date) {
      attendanceConditions.push(
        eq(attendanceSchema.date, end_of_day_date(queryDto.date))
      );
    }
    if (queryDto.status) {
      attendanceConditions.push(eq(attendanceSchema.status, queryDto.status));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const childrenwithAttendance = await this.dbService.db
      .select({
        id: childrenSchema.id,
        first_name: userSchema.first_name,
        last_name: userSchema.last_name,
        photo_url: userSchema.photo_url,
        dob: childrenSchema.dob,
        group: {
          id: groupSchema.id,
          name: groupSchema.name,
          skill_level: groupSchema.skill_level,
          photo_url: groupSchema.photo_url,
        },
        attendance: {
          id: attendanceSchema.id,
          date: attendanceSchema.date,
          status: attendanceSchema.status,
          created_at: attendanceSchema.created_at,
          updated_at: attendanceSchema.updated_at,
        },
      })
      .from(childrenSchema)
      .leftJoin(
        attendanceSchema,
        and(
          eq(childrenSchema.id, attendanceSchema.children_id),
          ...(attendanceConditions.length > 0 ? attendanceConditions : [])
        )
      )
      .innerJoin(userSchema, eq(childrenSchema.user_id, userSchema.id))
      .leftJoin(
        childrenGroupSchema,
        eq(childrenSchema.id, childrenGroupSchema.children_id)
      )
      .leftJoin(groupSchema, eq(childrenGroupSchema.group_id, groupSchema.id))
      .where(whereClause)
      .orderBy(desc(attendanceSchema.date))
      .limit(Number(queryDto.limit))
      .offset(offset);
    const attendanceChildrenwithAbsolutePhoto = childrenwithAttendance.map(
      (children) => {
        if (children.photo_url) {
          children.photo_url = this.fileStorageService.getAbsoluteUrl(
            children.photo_url
          );
        }
        if (children.group && children.group.photo_url) {
          children.group.photo_url = this.fileStorageService.getAbsoluteUrl(
            children.group.photo_url
          );
        }
        return children;
      }
    );

    const count = await this.dbService.db
      .select({ count: sql<number>`count(*)` })
      .from(childrenSchema)
      .leftJoin(
        attendanceSchema,
        and(
          eq(childrenSchema.id, attendanceSchema.children_id),
          ...(attendanceConditions.length > 0 ? attendanceConditions : [])
        )
      )
      .leftJoin(userSchema, eq(childrenSchema.user_id, userSchema.id))
      .leftJoin(
        childrenGroupSchema,
        eq(childrenSchema.id, childrenGroupSchema.children_id)
      )
      .leftJoin(groupSchema, eq(childrenGroupSchema.group_id, groupSchema.id))
      .where(whereClause)
      .then((result) => Number(result[0]?.count || 0));
    return APIResponse.success<IResponseAttendance[]>({
      message: 'Successfully fetched children with attendance',
      data: attendanceChildrenwithAbsolutePhoto,
      pagination: {
        page: Number(queryDto.page),
        limit: Number(queryDto.limit),
        count: count,
        totalPages: Math.ceil(count / Number(queryDto.limit)),
      },
      statusCode: 200,
    });
  }

  async markAllasPresent(
    markAllAsPresentDto: MarkAllAsPresentDto
  ): Promise<APIResponse<Attendance[]>> {
    // First, get all children in the group
    const getAllChildren = await this.dbService.db
      .select()
      .from(childrenSchema)
      .innerJoin(
        childrenGroupSchema,
        eq(childrenSchema.id, childrenGroupSchema.children_id)
      )
      .where(eq(childrenGroupSchema.group_id, markAllAsPresentDto.group_id));

    const childrenIds = getAllChildren.map((child) => child.children.id);

    if (childrenIds.length === 0) {
      throw new NotFoundException('No children found in the specified group');
    }

    // Check for existing attendance records for these children on this date
    const existingAttendance = await this.dbService.db
      .select()
      .from(attendanceSchema)
      .where(
        and(
          inArray(attendanceSchema.children_id, childrenIds),
          eq(attendanceSchema.group_id, markAllAsPresentDto.group_id),
          eq(attendanceSchema.date, new Date(markAllAsPresentDto.date))
        )
      );

    const existingChildrenIds = existingAttendance.map(
      (record) => record.children_id
    );
    const newChildrenIds = childrenIds.filter(
      (id) => !existingChildrenIds.includes(id)
    );

    const results: Attendance[] = [];

    // Update existing attendance records
    if (existingAttendance.length > 0) {
      const updatedAttendance = await this.dbService.db
        .update(attendanceSchema)
        .set({
          status: ATTENDANCE_STATUS.PRESENT,
          updated_at: new Date(),
        })
        .where(
          and(
            inArray(
              attendanceSchema.children_id,
              existingChildrenIds as number[]
            ),
            eq(attendanceSchema.group_id, markAllAsPresentDto.group_id),
            eq(attendanceSchema.date, new Date(markAllAsPresentDto.date))
          )
        )
        .returning();

      results.push(...updatedAttendance);
    }

    // Insert new attendance records for children without existing records
    if (newChildrenIds.length > 0) {
      const newAttendance = await this.dbService.db
        .insert(attendanceSchema)
        .values(
          newChildrenIds.map((childId) => ({
            children_id: childId,
            group_id: markAllAsPresentDto.group_id,
            date: new Date(markAllAsPresentDto.date),
            status: ATTENDANCE_STATUS.PRESENT,
          }))
        )
        .returning();

      results.push(...newAttendance);
    }

    return APIResponse.success<Attendance[]>({
      message: `Successfully marked all ${childrenIds.length} children as present (${existingAttendance.length} updated, ${newChildrenIds.length} created)`,
      data: results,
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
}
