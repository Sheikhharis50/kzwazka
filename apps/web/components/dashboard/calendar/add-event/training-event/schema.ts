import z from 'zod';

export const trainingEventSchema = z
  .object({
    title: z.string().min(1, 'Event title is required'),
    start_date: z.string().min(1, 'Event start date is required'),
    group_id: z.number().min(1, 'Please select a group'),
    event_type: z.enum(['training']).catch('training'),
  })
  .refine(
    (data) => {
      if (!data.start_date) return true;
      return data.start_date >= (new Date().toISOString().split('T')[0] || '');
    },
    {
      message: 'Event date cannot be in the past',
      path: ['start_date'],
    }
  );

export type TrainingEventFormData = z.infer<typeof trainingEventSchema>;
