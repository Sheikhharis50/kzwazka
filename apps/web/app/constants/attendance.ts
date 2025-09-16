export const attendanceTableHeaders = [
  'Child',
  'Child Name',
  'Age',
  'Attendance',
];

export const attendanceEnum = {
  PRESENT: 'present',
  ABSENT: 'absent',
  LATE: 'late',
};

export const attendanceOptions = [
  { label: 'Present', value: attendanceEnum.PRESENT },
  { label: 'Absent', value: attendanceEnum.LATE },
  { label: 'Late', value: attendanceEnum.LATE },
];
