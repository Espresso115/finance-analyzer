import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../components/AuthLayout';
import { registerSchema, type RegisterFormValues } from '../schemas/auth';
import { useAuthStore } from '../store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export function RegisterPage() {
  const navigate = useNavigate();
  const createAccount = useAuthStore((state) => state.register);
  const status = useAuthStore((state) => state.status);
  const authError = useAuthStore((state) => state.error);
  const isSubmitting = status === 'loading';
  const {
    formState: { errors },
    handleSubmit,
    register,
    control
  } = useForm<RegisterFormValues>({
    // @ts-ignore: version mismatch between zod and hookform/resolvers
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      username: '',
      password: '',
      confirmPassword: '',
    }
  });

  const password = useWatch({ control, name: 'password' }) || '';
  const strength = password.length >= 12 ? 'Strong' : password.length >= 8 ? 'Good' : 'Weak';
  const strengthColor = strength === 'Strong' ? 'text-green-500' : strength === 'Good' ? 'text-orange-500' : 'text-red-500';

  const onSubmit = handleSubmit(async (values) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { confirmPassword, ...registerData } = values;
    await createAccount(registerData);
    navigate('/dashboard', { replace: true });
  });

  return (
    <AuthLayout>
      <Card className="w-full max-w-md shadow-2xl border-border/50 bg-card">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl font-bold">Create account</CardTitle>
          <CardDescription>Set up secure access to your market workspace.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" type="text" autoComplete="username" {...register('username')} />
              {errors.username && <p className="text-sm font-medium text-destructive">{errors.username.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" autoComplete="email" {...register('email')} />
              {errors.email && <p className="text-sm font-medium text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" autoComplete="new-password" {...register('password')} />
              <div className="flex justify-between items-center text-xs font-medium">
                <span className="text-muted-foreground">Password strength:</span>
                <span className={password ? strengthColor : 'text-muted-foreground'}>
                  {password ? strength : 'Enter at least 8 characters'}
                </span>
              </div>
              {errors.password && <p className="text-sm font-medium text-destructive">{errors.password.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <Input id="confirmPassword" type="password" autoComplete="new-password" {...register('confirmPassword')} />
              {errors.confirmPassword && <p className="text-sm font-medium text-destructive">{errors.confirmPassword.message}</p>}
            </div>

            {authError && <p className="text-sm font-medium text-destructive mt-2">{authError}</p>}

            <Button type="submit" className="w-full mt-6 bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create account'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center border-t border-border/50 pt-6">
          <p className="text-sm text-muted-foreground">
            Already registered?{' '}
            <Link to="/login" className="font-semibold text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </AuthLayout>
  );
}
