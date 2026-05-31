import type { PropsWithChildren } from 'react';

type AuthLayoutProps = PropsWithChildren;

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <main className="auth-page">
      <nav className="auth-nav" aria-label="Authentication navigation">
        <span className="brand-mark">Financial Platform</span>
        <div>
          <span>Markets</span>
          <span>Research</span>
          <span>Security</span>
        </div>
      </nav>
      <section className="auth-panel">{children}</section>
    </main>
  );
}
