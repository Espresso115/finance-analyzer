import { renderToString } from 'react-dom/server';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { LoginPage } from './LoginPage';
import { RegisterPage } from './RegisterPage';
import { ProtectedRoute } from '../routes/ProtectedRoute';
import { loginSchema, registerSchema } from '../schemas/auth';
import { useAuthStore } from '../store/authStore';

describe('Auth UI', () => {
  it('renders the login form', () => {
    const html = renderToString(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    expect(html).toContain('Welcome back');
    expect(html).toContain('Sign in');
  });

  it('renders the register form with confirm password and terms controls', () => {
    const html = renderToString(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );

    expect(html).toContain('Create account');
    expect(html).toContain('Confirm password');
    expect(html).toContain('terms and conditions');
  });

  it('redirects unauthenticated users away from protected routes', () => {
    useAuthStore.setState({
      accessToken: null,
      status: 'unauthenticated',
      user: null
    });

    const html = renderToString(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<main>Private area</main>} />
          </Route>
          <Route path="/login" element={<main>Login route</main>} />
        </Routes>
      </MemoryRouter>
    );

    expect(html).not.toContain('Private area');
  });

  it('validates email and password formats with regex-backed schemas', () => {
    expect(loginSchema.safeParse({ email: 'bad-email', password: 'password123' }).success).toBe(
      false
    );
    expect(loginSchema.safeParse({ email: 'user@example.com', password: 'password' }).success).toBe(
      false
    );
    expect(
      registerSchema.safeParse({
        email: 'user@example.com',
        username: 'marketuser',
        password: 'password123',
        confirmPassword: 'password123',
        acceptedTerms: true
      }).success
    ).toBe(true);
  });
});
