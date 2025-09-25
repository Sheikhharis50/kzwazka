import z from 'zod';

export const oneTimeEventSchema = z
  .object({
    title: z.string().min(1, 'Event title is required'),
    start_date: z.string().min(1, 'Event start date is required'),
    end_date: z.string().min(1, 'Event end date is required'),
    coach_id: z.number().min(1, 'Please select a coach'),
    opening_time: z.string().min(1, 'Event start time is required'),
    closing_time: z.string().min(1, 'Event end time is required'),
    location_id: z.number().min(1, 'Please select a location'),
    group_id: z.number().min(1, 'Please select a group'),
    event_type: z.enum(['one_time']).catch('one_time'),
  })
  .refine(
    (data) => {
      if (!data.start_date || !data.end_date) return true;
      return data.start_date <= data.end_date;
    },
    {
      message: 'End date cannot be before the start date',
      path: ['end_date'],
    }
  )
  .refine(
    (data) => {
      if (!data.start_date) return true;
      return data.start_date >= (new Date().toISOString().split('T')[0] || '');
    },
    {
      message: 'Start date cannot be in the past',
      path: ['start_date'],
    }
  )
  .refine(
    (data) => {
      if (!data.opening_time || !data.closing_time) return true;
      return data.opening_time < data.closing_time;
    },
    {
      message: 'End time must be after the start time',
      path: ['closing_time'],
    }
  );

export type OneTimeEventFormData = z.infer<typeof oneTimeEventSchema>;
