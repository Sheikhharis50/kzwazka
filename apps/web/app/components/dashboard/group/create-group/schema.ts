import z from 'zod';

export const sessionSchema = z
  .object({
    day: z.string().min(1, 'Day is required'),
    time_from: z.string().min(1, 'Time is required'),
    time_to: z.string().min(1, 'Time is required'),
  })
  .refine(
    (data) => {
      if (!data.time_from || !data.time_to) return true;
      return data.time_from < data.time_to;
    },
    {
      message: 'Start time must be before end time',
      path: ['time_to'],
    }
  );

export const createGroupSchema = z
  .object({
    name: z.string().min(1, 'Group name is required'),
    min_age: z.number('Age is required').min(1, 'Age cannot be zero'),
    max_age: z.number('Age is required').min(1, 'Age cannot be zero'),
    skill_level: z.string().min(1, 'Skill level is required'),
    max_group_size: z
      .number('Group size is required')
      .min(1, 'Group size cannot be zero'),
    coach_id: z.number().min(1, 'Please select a coach'),
    location_id: z.number().min(1, 'Please select the training address'),
    group_sessions: z
      .array(sessionSchema)
      .min(1, 'At least one session is required'),
  })
  .refine((data) => data.min_age < data.max_age, {
    message: 'Min age must be smaller than max age',
    path: ['max_age'],
  })
  .refine(
    (data) => {
      for (let i = 0; i < data.group_sessions.length; i++) {
        for (let j = i + 1; j < data.group_sessions.length; j++) {
          const a = data.group_sessions[i];
          const b = data.group_sessions[j];

          if (a === undefined || b === undefined) continue;
          if (a.day === b.day) {
            if (a.time_from < b.time_to && b.time_from < a.time_to) {
              return false;
            }
          }
        }
      }
      return true;
    },
    {
      message: 'Overlapping sessions are not allowed on the same day',
      path: ['group_sessions'],
    }
  );

export type createGroupFormData = z.infer<typeof createGroupSchema>;
