import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../components/AuthLayout';
import { loginSchema, type LoginFormValues } from '../schemas/auth';
import { useAuthStore } from '../store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const status = useAuthStore((state) => state.status);
  const authError = useAuthStore((state) => state.error);
  const isSubmitting = status === 'loading';
  const {
    formState: { errors },
    handleSubmit,
    register
  } = useForm<LoginFormValues>({
    // @ts-ignore: version mismatch between zod and hookform/resolvers
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: '',
      password: ''
    }
  });

  const onSubmit = handleSubmit(async (values) => {
    // Send identifier property to login API
    await login(values as any);
    navigate('/dashboard', { replace: true });
  });

  return (
    <AuthLayout>
      <div className="w-full max-w-md p-8 rounded-3xl shadow-2xl bg-card border border-border/50 backdrop-blur-xl animate-in zoom-in-95 duration-500">
        <div className="space-y-3 mb-8 text-center">
          <h1 className="text-3xl font-extrabold tracking-tight">Welcome back</h1>
          <p className="text-muted-foreground text-sm">Sign in to continue to your workspace.</p>
        </div>
        
        <form onSubmit={onSubmit} className="space-y-5">
          <div className="space-y-2 text-left">
            <Label htmlFor="identifier" className="text-sm font-semibold">Email or Username</Label>
            <Input 
              id="identifier" 
              type="text" 
              autoComplete="username" 
              placeholder="Enter your email or username"
              className="h-12 bg-secondary/30 border-border/50 focus-visible:ring-primary rounded-xl"
              {...register('identifier')} 
            />
            {errors.identifier && <p className="text-xs font-medium text-destructive mt-1">{errors.identifier.message}</p>}
          </div>

          <div className="space-y-2 text-left">
            <Label htmlFor="password" className="text-sm font-semibold">Password</Label>
            <Input 
              id="password" 
              type="password" 
              autoComplete="current-password" 
              placeholder="Enter your password"
              className="h-12 bg-secondary/30 border-border/50 focus-visible:ring-primary rounded-xl"
              {...register('password')} 
            />
            {errors.password && <p className="text-xs font-medium text-destructive mt-1">{errors.password.message}</p>}
          </div>

          {authError && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium">
              {authError}
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full h-12 mt-6 text-base font-semibold rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]" 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>

        <div className="mt-8 text-center border-t border-border/50 pt-6">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-primary hover:text-primary/80 transition-colors">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}
