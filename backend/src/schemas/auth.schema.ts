import { z } from 'zod';

export const registerSchema = z
  .object({
    username: z
      .string({ required_error: 'Username is required' })
      .trim()
      .min(3, 'Username must be at least 3 characters long')
      .max(30, 'Username cannot exceed 30 characters')
      .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
    password: z
      .string({ required_error: 'Password is required' })
      .min(6, 'Password must be at least 6 characters long')
      .max(100, 'Password cannot exceed 100 characters'),
    confirmPassword: z
      .string({ required_error: 'Confirm password is required' })
      .min(6, 'Confirm password must be at least 6 characters long'),
    displayName: z.string().trim().max(100).optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  username: z
    .string({ required_error: 'Username is required' })
    .trim()
    .min(1, 'Username is required'),
  password: z
    .string({ required_error: 'Password is required' })
    .min(1, 'Password is required'),
});

export type LoginInput = z.infer<typeof loginSchema>;
