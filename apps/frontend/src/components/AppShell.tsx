import type { PropsWithChildren } from 'react';
import { NavLink } from 'react-router-dom';
import { UserMenu } from './UserMenu';

export function AppShell({ children }: PropsWithChildren) {
  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <span className="eyebrow">Financial AI</span>
          <h1>Workspace</h1>
        </div>
        <UserMenu />
      </header>

      <nav className="workspace-nav" aria-label="Workspace navigation">
        <NavLink to="/dashboard">Dashboard</NavLink>
        <NavLink to="/profile">Profile</NavLink>
        <NavLink to="/settings">Settings</NavLink>
        <NavLink to="/api-keys">API Keys</NavLink>
      </nav>

      {children}
    </main>
  );
}
