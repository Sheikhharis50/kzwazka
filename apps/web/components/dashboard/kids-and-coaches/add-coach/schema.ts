import z from 'zod';

export const addCoachSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(
      /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/,
      'Password must contain at least one uppercase letter, one number, and one special character'
    ),
  phone: z.string().min(1, 'Tel number is required'),
});

export type AddCoachFormData = z.infer<typeof addCoachSchema>;
