export type IResponseAttendance = {
  id: number;
  first_name: string;
  last_name: string | null;
  photo_url: string | null;
  dob: string;
  group: {
    id: number;
    name: string;
    skill_level: string;
    photo_url: string | null;
  } | null;
  attendance: {
    id: number;
    date: Date;
    status: string;
    created_at: Date;
    updated_at: Date;
  } | null;
};
