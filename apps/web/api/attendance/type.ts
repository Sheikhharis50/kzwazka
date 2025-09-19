import { attendanceEnum } from 'constants/attendance';
export type IAttendance = {
  id: number;
  first_name: string;
  last_name: string;
  photo_url: string;
  dob: string;
  group: {
    id: number;
    name: string;
    skill_level: string;
    photo_url: string;
  };
  attendance: {
    id: number;
    date: string;
    status: attendanceEnum;
    created_at: string;
    updated_at: string;
  } | null;
};

export type AttendanceQueryParams = {
  children_id?: string;
  group_id?: string;
  status?: attendanceEnum;
  date: string;
  page?: number;
  limit?: number;
};

export type MarkAttendancePayload = {
  children_id: number;
  group_id: number;
  date: string;
  status: string;
  notes?: string;
};

export type IMarkAttendanceResponse = {
  id: number;
  children_id: number;
  group_id: number;
  date: string;
  status: attendanceEnum;
  notes: string;
  created_at: string;
  updated_at: string;
};

export type MarkAllPresentPayload = {
  group_id: number;
  date: string;
};
