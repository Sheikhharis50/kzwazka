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
import { APP_CONSTANTS, ATTENDANCE_STATUS, getPageOffset } from '../utils';
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
  ): Promise<APIResponse<Attendance | undefined>> {
    const { date, ...attendanceData } = createAttendanceDto;

    if (new Date(date) > new Date()) {
      return APIResponse.error<undefined>({
        message: 'Date cannot be in the future',
        statusCode: 400,
      });
    }

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
    if (!queryDto.group_id) {
      return APIResponse.success<IResponseAttendance[]>({
        message: 'Group ID is required',
        data: [],
        pagination: {
          page: Number(queryDto.page || '1'),
          limit: Number(
            queryDto.limit || APP_CONSTANTS.PAGINATION.DEFAULT_LIMIT.toString()
          ),
          count: 0,
          totalPages: 0,
        },
        statusCode: 200,
      });
    }

    const page = Number(queryDto.page || '1');
    const limit = Number(
      queryDto.limit || APP_CONSTANTS.PAGINATION.DEFAULT_LIMIT.toString()
    );
    const offset = getPageOffset(
      queryDto.page || '1',
      queryDto.limit || APP_CONSTANTS.PAGINATION.DEFAULT_LIMIT.toString()
    );

    const baseConditions: SQLWrapper[] = [
      eq(childrenGroupSchema.group_id, queryDto.group_id), // Required condition
    ];

    if (queryDto.children_id) {
      baseConditions.push(eq(childrenSchema.id, queryDto.children_id));
    }

    const attendanceConditions: SQLWrapper[] = [
      eq(childrenSchema.id, attendanceSchema.children_id),
    ];

    if (queryDto.date) {
      attendanceConditions.push(
        eq(attendanceSchema.date, new Date(queryDto.date))
      );
    }

    if (queryDto.status) {
      attendanceConditions.push(eq(attendanceSchema.status, queryDto.status));
    }

    const baseWhereClause = and(...baseConditions);
    const attendanceJoinCondition = and(...attendanceConditions);

    const results = await this.dbService.db
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
        total_count: sql<number>`COUNT(*) OVER()`,
      })
      .from(childrenSchema)
      .innerJoin(
        childrenGroupSchema,
        eq(childrenSchema.id, childrenGroupSchema.children_id)
      )
      .innerJoin(groupSchema, eq(childrenGroupSchema.group_id, groupSchema.id))
      .innerJoin(userSchema, eq(childrenSchema.user_id, userSchema.id))
      // Left join for optional attendance
      .leftJoin(attendanceSchema, attendanceJoinCondition)
      .where(baseWhereClause)
      .orderBy(desc(attendanceSchema.date))
      .limit(limit)
      .offset(offset);

    const attendanceChildrenWithAbsolutePhoto = results.map((child) => {
      const processedChild = { ...child };

      delete (processedChild as { total_count: unknown }).total_count;

      if (processedChild.photo_url) {
        processedChild.photo_url = this.fileStorageService.getAbsoluteUrl(
          processedChild.photo_url
        );
      }

      if (processedChild.group?.photo_url) {
        processedChild.group.photo_url = this.fileStorageService.getAbsoluteUrl(
          processedChild.group.photo_url
        );
      }

      return processedChild;
    });

    const totalCount = results.length > 0 ? results[0].total_count : 0;

    return APIResponse.success<IResponseAttendance[]>({
      message: 'Successfully fetched children with attendance',
      data: attendanceChildrenWithAbsolutePhoto,
      pagination: {
        page,
        limit,
        count: totalCount,
        totalPages: Math.ceil(totalCount / limit),
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
