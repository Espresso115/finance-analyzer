import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../components/AuthLayout';
import { loginSchema, type LoginFormValues } from '../schemas/auth';
import { useAuthStore } from '../store/authStore';

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
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const onSubmit = handleSubmit(async (values) => {
    await login(values);
    navigate('/dashboard', { replace: true });
  });

  return (
    <AuthLayout
      eyebrow="Week 1 Auth"
      title="Financial AI Analyzer"
      subtitle="Sign in to your secure analysis workspace."
    >
      <form className="auth-form" onSubmit={onSubmit}>
        <div className="form-header">
          <h2>Welcome back</h2>
          <p>Use your registered email and password.</p>
        </div>

        <label>
          Email
          <input type="email" autoComplete="email" {...register('email')} />
          {errors.email ? <span className="field-error">{errors.email.message}</span> : null}
        </label>

        <label>
          Password
          <input type="password" autoComplete="current-password" {...register('password')} />
          {errors.password ? <span className="field-error">{errors.password.message}</span> : null}
        </label>

        {authError ? <p className="form-error">{authError}</p> : null}

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Signing in...' : 'Sign in'}
        </button>

        <p className="form-switch">
          New here? <Link to="/register">Create an account</Link>
        </p>
      </form>
    </AuthLayout>
  );
}
