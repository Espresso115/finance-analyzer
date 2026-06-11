import type { PropsWithChildren } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, User, Settings, Activity } from 'lucide-react';
import { SymbolSearch } from './SymbolSearch';
import { cn } from '@/lib/utils';

export function AppShell({ children }: PropsWithChildren) {
  const location = useLocation();

  return (
    <main className="min-h-screen bg-background flex flex-col">
      <header className="flex flex-col items-center justify-center p-6 border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex items-center gap-2 text-primary font-bold text-xl mb-4">
          <Activity className="w-6 h-6" />
          <span>Financial Platform</span>
        </div>
        
        <div className="w-full max-w-2xl flex flex-col items-center gap-6">
          {location.pathname === '/dashboard' && <SymbolSearch />}

          <nav className="flex items-center gap-2 bg-background/50 p-1 rounded-full border border-border/50" aria-label="Workspace navigation">
            <NavLink 
              to="/dashboard"
              className={({ isActive }) => cn(
                "flex items-center gap-2 px-6 py-2 rounded-full text-sm font-medium transition-all duration-300",
                isActive ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              )}
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </NavLink>
            <NavLink 
              to="/profile"
              className={({ isActive }) => cn(
                "flex items-center gap-2 px-6 py-2 rounded-full text-sm font-medium transition-all duration-300",
                isActive ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              )}
            >
              <User className="w-4 h-4" />
              Profile
            </NavLink>
            <NavLink 
              to="/settings"
              className={({ isActive }) => cn(
                "flex items-center gap-2 px-6 py-2 rounded-full text-sm font-medium transition-all duration-300",
                isActive ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              )}
            >
              <Settings className="w-4 h-4" />
              Settings
            </NavLink>
          </nav>
        </div>
      </header>

      <div className="p-6 flex-1">
        {children}
      </div>
    </main>
  );
}
