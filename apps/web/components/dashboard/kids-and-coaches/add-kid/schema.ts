import z from 'zod';

export const addKidSchema = z.object({
  parent_name: z.string().min(1, 'Parent name is required'),
  child_name: z.string().min(1, 'Child name is required'),
  dob: z.string().min(1, 'Date of birth is required'),
  group: z.string().min(1, 'Group is required'),
  email: z.email('Invalid email address'),
  number: z.string().min(1, 'Tel number is required'),
});

export type AddKidFormData = z.infer<typeof addKidSchema>;
