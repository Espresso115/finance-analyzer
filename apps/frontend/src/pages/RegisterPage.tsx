import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { AuthLayout } from '../components/AuthLayout';
import { registerSchema, type RegisterFormValues } from '../schemas/auth';
import { useAuthStore } from '../store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

function getStrength(password: string): { level: 0 | 1 | 2 | 3; label: string; color: string } {
  if (!password) return { level: 0, label: '', color: '' };
  if (password.length < 8) return { level: 1, label: 'Weak', color: 'bg-destructive' };
  if (password.length < 12) return { level: 2, label: 'Good', color: 'bg-amber-500' };
  return { level: 3, label: 'Strong', color: 'bg-emerald-500' };
}

export function RegisterPage() {
  const navigate = useNavigate();
  const createAccount = useAuthStore((state) => state.register);
  const status = useAuthStore((state) => state.status);
  const authError = useAuthStore((state) => state.error);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const isSubmitting = status === 'loading';

  const {
    formState: { errors },
    handleSubmit,
    register,
    control,
  } = useForm<RegisterFormValues>({
    // @ts-ignore: version mismatch between zod and hookform/resolvers
    resolver: zodResolver(registerSchema),
    defaultValues: { email: '', username: '', password: '', confirmPassword: '' },
  });

  const password = useWatch({ control, name: 'password' }) || '';
  const strength = getStrength(password);

  const onSubmit = handleSubmit(async (values) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { confirmPassword, ...registerData } = values;
    await createAccount(registerData);
    navigate('/dashboard', { replace: true });
  });

  const inputClass = (hasError: boolean) =>
    cn(
      'h-11 bg-secondary/40 border-border/50 focus-visible:ring-1 focus-visible:ring-primary/60 rounded-xl text-sm transition-all',
      hasError && 'border-destructive/60 focus-visible:ring-destructive/40'
    );

  return (
    <AuthLayout>
      <div className="glass rounded-2xl p-8 shadow-2xl shadow-black/20">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Create account
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5">
            Set up secure access to your market workspace
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          {/* Username */}
          <div className="space-y-1.5">
            <Label htmlFor="username" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Username
            </Label>
            <Input
              id="username"
              type="text"
              autoComplete="username"
              placeholder="johndoe"
              className={inputClass(!!errors.username)}
              {...register('username')}
            />
            {errors.username && (
              <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />{errors.username.message}
              </motion.p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              className={inputClass(!!errors.email)}
              {...register('email')}
            />
            {errors.email && (
              <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />{errors.email.message}
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
                autoComplete="new-password"
                placeholder="Min. 8 characters"
                className={cn(inputClass(!!errors.password), 'pr-10')}
                {...register('password')}
              />
              <button type="button" tabIndex={-1}
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Password strength bar */}
            {password && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-1">
                <div className="flex gap-1">
                  {[1, 2, 3].map((i) => (
                    <motion.div
                      key={i}
                      className="h-1 flex-1 rounded-full bg-border overflow-hidden"
                    >
                      <motion.div
                        className={cn('h-full rounded-full', strength.color)}
                        initial={{ width: 0 }}
                        animate={{ width: i <= strength.level ? '100%' : '0%' }}
                        transition={{ duration: 0.3, ease: [0.25, 0.4, 0.25, 1] }}
                      />
                    </motion.div>
                  ))}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-muted-foreground">Password strength</span>
                  <span className={cn('text-[10px] font-semibold',
                    strength.level === 1 ? 'text-destructive' :
                    strength.level === 2 ? 'text-amber-500' : 'text-emerald-500'
                  )}>
                    {strength.label}
                  </span>
                </div>
              </motion.div>
            )}

            {errors.password && (
              <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />{errors.password.message}
              </motion.p>
            )}
          </div>

          {/* Confirm password */}
          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Confirm Password
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirm ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Repeat password"
                className={cn(inputClass(!!errors.confirmPassword), 'pr-10')}
                {...register('confirmPassword')}
              />
              <button type="button" tabIndex={-1}
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />{errors.confirmPassword.message}
              </motion.p>
            )}
          </div>

          {/* Auth error */}
          {authError && (
            <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-2.5 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{authError}</span>
            </motion.div>
          )}

          {/* Submit */}
          <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} className="pt-1">
            <Button
              id="register-submit"
              type="submit"
              className="w-full h-11 text-sm font-semibold rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 transition-all"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating account…
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Create account
                </span>
              )}
            </Button>
          </motion.div>
        </form>

        <div className="mt-6 text-center border-t border-border/40 pt-5">
          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-primary hover:text-primary/80 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}
