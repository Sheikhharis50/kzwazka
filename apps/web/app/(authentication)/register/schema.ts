import { z } from 'zod';

export const firstStepSchema = z
  .object({
    email: z.email('Invalid email address'),
    phone: z.string().min(1, 'Phone number is required'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters long')
      .regex(
        /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/,
        'Password must contain at least one uppercase letter, one number, and one special character'
      ),
    confirm_password: z.string().min(1, 'Please confirm your password'),
    parent_first_name: z.string().min(1, 'Parent first name is required'),
    parent_last_name: z.string().min(1, 'Parent first name is required'),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords don't match",
    path: ['confirm_password'],
  });

export const secondStepSchema = z.object({
  first_name: z.string().min(1, 'Kid first name is required'),
  last_name: z.string().min(1, 'Kid last name is required'),
  dob: z.string().min(1, 'Kid age is required'),
});

export type FirstStepFormData = z.infer<typeof firstStepSchema>;
export type SecondStepFormData = z.infer<typeof secondStepSchema>;
export type FirstStepCleanData = Omit<FirstStepFormData, 'confirm_password'>;
