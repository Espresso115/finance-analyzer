import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required')
});

export const registerSchema = loginSchema
  .extend({
    username: z.string().min(3, 'Username must be at least 3 characters'),
    password: z.string().min(8, 'Password must be at least 8 characters').regex(/\d/, {
      message: 'Password must include at least one number'
    }),
    confirmPassword: z.string(),
    acceptedTerms: z.boolean().refine((accepted) => accepted, {
      message: 'You must accept the terms'
    })
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match'
  });

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
