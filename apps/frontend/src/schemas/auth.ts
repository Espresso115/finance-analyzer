import { z } from 'zod';

export const emailRegex = /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+$/;
export const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)\S{8,}$/;

export const loginSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(1, 'Email or username is required'),
  password: z
    .string()
    .min(1, 'Password is required')
});

export const registerSchema = z.object({
  email: z
    .string()
    .trim()
    .regex(emailRegex, 'Enter a valid email address'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z
    .string()
    .regex(passwordRegex, 'Use 8+ characters with at least one letter and one number'),
  confirmPassword: z.string()
}).refine((values) => values.password === values.confirmPassword, {
  path: ['confirmPassword'],
  message: 'Passwords do not match'
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
