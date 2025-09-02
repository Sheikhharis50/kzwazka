import z from 'zod';

export const editCoachSchema = z.object({
  first_name: z.string().min(1, 'Parent name is required'),
  last_name: z.string().min(1, 'Child name is required'),
  phone: z.string().min(1, 'Tel number is required'),
});

export type EditCoachFormData = z.infer<typeof editCoachSchema>;
