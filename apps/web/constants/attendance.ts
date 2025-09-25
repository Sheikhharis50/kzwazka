export const attendanceTableHeaders = [
  'Child',
  'Child Name',
  'Age',
  'Attendance',
];

export const eventAttendanceTableHeaders = ['Name', 'Age', 'Status'];

export enum attendanceEnum {
  PRESENT = 'present',
  ABSENT = 'absent',
  LATE = 'late',
}

export const attendanceOptions = [
  { label: 'Present', value: attendanceEnum.PRESENT },
  { label: 'Absent', value: attendanceEnum.ABSENT },
  { label: 'Late', value: attendanceEnum.LATE },
];
