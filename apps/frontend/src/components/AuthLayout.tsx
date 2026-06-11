import type { PropsWithChildren } from 'react';
import { Activity } from 'lucide-react';

type AuthLayoutProps = PropsWithChildren;

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <main className="min-h-screen bg-background flex flex-col">
      <nav className="flex items-center justify-between p-6 bg-card border-b border-border/50">
        <div className="flex items-center gap-2 text-primary font-bold text-lg">
          <Activity className="w-5 h-5" />
          <span>Financial Platform</span>
        </div>
        <div className="hidden sm:flex gap-6 text-sm font-medium text-muted-foreground">
          <span className="hover:text-foreground cursor-pointer transition-colors">Markets</span>
          <span className="hover:text-foreground cursor-pointer transition-colors">Research</span>
          <span className="hover:text-foreground cursor-pointer transition-colors">Security</span>
        </div>
      </nav>
      <section className="flex-1 flex items-center justify-center p-6">{children}</section>
    </main>
  );
}
