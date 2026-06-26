import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { AuthLayout } from '../components/AuthLayout';
import { loginSchema, type LoginFormValues } from '../schemas/auth';
import { useAuthStore } from '../store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const status = useAuthStore((state) => state.status);
  const authError = useAuthStore((state) => state.error);
  const [showPassword, setShowPassword] = useState(false);
  const isSubmitting = status === 'loading';
  const clearError = useAuthStore((state) => state.clearError);

  useEffect(() => {
    clearError();
  }, [clearError]);

  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<LoginFormValues>({
    // @ts-ignore: version mismatch between zod and hookform/resolvers
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: '', password: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    await login(values as any);
    navigate('/dashboard', { replace: true });
  });

  return (
    <AuthLayout>
      <div className="glass rounded-2xl p-8 shadow-2xl shadow-black/20">
        {/* Header */}
        <div className="mb-7 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Welcome back
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5">
            Sign in to continue to your workspace
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          {/* Identifier */}
          <div className="space-y-1.5">
            <Label htmlFor="identifier" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Email or Username
            </Label>
            <Input
              id="identifier"
              type="text"
              autoComplete="username"
              placeholder="you@example.com"
              className={cn(
                'h-11 bg-secondary/40 border-border/50 focus-visible:ring-1 focus-visible:ring-primary/60 rounded-xl text-sm transition-all',
                errors.identifier && 'border-destructive/60 focus-visible:ring-destructive/40'
              )}
              {...register('identifier')}
            />
            {errors.identifier && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-destructive flex items-center gap-1"
              >
                <AlertCircle className="w-3 h-3" />
                {errors.identifier.message}
              </motion.p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                className={cn(
                  'h-11 pr-10 bg-secondary/40 border-border/50 focus-visible:ring-1 focus-visible:ring-primary/60 rounded-xl text-sm transition-all',
                  errors.password && 'border-destructive/60 focus-visible:ring-destructive/40'
                )}
                {...register('password')}
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-destructive flex items-center gap-1"
              >
                <AlertCircle className="w-3 h-3" />
                {errors.password.message}
              </motion.p>
            )}
          </div>

          {/* Auth error */}
          {authError && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-2.5 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm"
            >
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{authError}</span>
            </motion.div>
          )}

          {/* Submit */}
          <motion.div
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className="pt-1"
          >
            <Button
              id="login-submit"
              type="submit"
              className="w-full h-11 text-sm font-semibold rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 transition-all"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in…
                </span>
              ) : (
                'Sign in'
              )}
            </Button>
          </motion.div>
        </form>

        {/* Footer link */}
        <div className="mt-6 text-center border-t border-border/40 pt-5">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-semibold text-primary hover:text-primary/80 transition-colors"
            >
              Create account
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}
