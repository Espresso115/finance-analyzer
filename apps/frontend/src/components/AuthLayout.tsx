import type { PropsWithChildren } from 'react';

type AuthLayoutProps = PropsWithChildren<{
  eyebrow: string;
  title: string;
  subtitle: string;
}>;

export function AuthLayout({ eyebrow, title, subtitle, children }: AuthLayoutProps) {
  return (
    <main className="auth-page">
      <section className="auth-copy" aria-labelledby="auth-title">
        <span className="eyebrow">{eyebrow}</span>
        <h1 id="auth-title">{title}</h1>
        <p>{subtitle}</p>
        <div className="auth-metrics" aria-label="Platform readiness metrics">
          <div>
            <strong>Market</strong>
            <span>Live workspace</span>
          </div>
          <div>
            <strong>Research</strong>
            <span>Document queue</span>
          </div>
          <div>
            <strong>Analysis</strong>
            <span>Protected session</span>
          </div>
        </div>
      </section>
      <section className="auth-panel">{children}</section>
    </main>
  );
}
