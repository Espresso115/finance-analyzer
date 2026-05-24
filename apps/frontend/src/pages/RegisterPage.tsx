import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../components/AuthLayout';
import { registerSchema, type RegisterFormValues } from '../schemas/auth';
import { useAuthStore } from '../store/authStore';

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
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      username: '',
      password: '',
      confirmPassword: '',
      acceptedTerms: false
    }
  });
  const password = useWatch({ control, name: 'password' }) || '';
  const strength = password.length >= 12 ? 'Strong' : password.length >= 8 ? 'Good' : 'Weak';

  const onSubmit = handleSubmit(async ({ confirmPassword, acceptedTerms, ...values }) => {
    void confirmPassword;
    void acceptedTerms;
    await createAccount(values);
    navigate('/dashboard', { replace: true });
  });

  return (
    <AuthLayout
      eyebrow="Create Access"
      title="Financial AI Analyzer"
      subtitle="Open a protected workspace for market research and AI analysis."
    >
      <form className="auth-form" onSubmit={onSubmit}>
        <div className="form-header">
          <h2>Create account</h2>
          <p>Start with a username, email, and password.</p>
        </div>

        <label>
          Username
          <input type="text" autoComplete="username" {...register('username')} />
          {errors.username ? <span className="field-error">{errors.username.message}</span> : null}
        </label>

        <label>
          Email
          <input type="email" autoComplete="email" {...register('email')} />
          {errors.email ? <span className="field-error">{errors.email.message}</span> : null}
        </label>

        <label>
          Password
          <input type="password" autoComplete="new-password" {...register('password')} />
          <span className={`password-strength strength-${strength.toLowerCase()}`}>
            {password ? strength : 'Enter at least 8 characters'}
          </span>
          {errors.password ? <span className="field-error">{errors.password.message}</span> : null}
        </label>

        <label>
          Confirm password
          <input type="password" autoComplete="new-password" {...register('confirmPassword')} />
          {errors.confirmPassword ? (
            <span className="field-error">{errors.confirmPassword.message}</span>
          ) : null}
        </label>

        <label className="checkbox-row">
          <input type="checkbox" {...register('acceptedTerms')} />
          <span>I accept the terms and conditions</span>
        </label>
        {errors.acceptedTerms ? (
          <span className="field-error">{errors.acceptedTerms.message}</span>
        ) : null}

        {authError ? <p className="form-error">{authError}</p> : null}

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create account'}
        </button>

        <p className="form-switch">
          Already registered? <Link to="/login">Sign in</Link>
        </p>
      </form>
    </AuthLayout>
  );
}
