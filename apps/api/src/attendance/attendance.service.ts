import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../db/drizzle.service';
import { eq, and, desc, SQLWrapper, sql } from 'drizzle-orm';
import {
  attendanceSchema,
  Attendance,
  childrenSchema,
  groupSchema,
  userSchema,
  childrenGroupSchema,
} from '../db/schemas';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { QueryAttendanceDto } from './dto/query-attendance.dto';
import { APP_CONSTANTS, end_of_day_date, getPageOffset } from '../utils';
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

  async findAllChildrenwithAttendance(
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
}
