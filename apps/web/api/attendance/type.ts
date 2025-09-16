import { IChild } from 'api/type';

export type IAttendance = {
  // childId: number;
  // childName: string;
  // dob: string;
  // photo_url: string;
  // group: { id: number; name: string };
  children: IChild;
  status: 'present' | 'absent' | 'late' | null;
};

export type IAttendanceResponse = {
  group_id: number | null;
  date: string;
  attendance: IAttendance[];
};
