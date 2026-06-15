import { useState, useEffect, type PropsWithChildren } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  User,
  Settings,
  Key,
  Activity,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  LogOut,
  Bell,
} from 'lucide-react';
import { SymbolSearch } from './SymbolSearch';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/profile', icon: User, label: 'Profile' },
  { to: '/settings', icon: Settings, label: 'Settings' },
  { to: '/api-keys', icon: Key, label: 'API Keys' },
];

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Market Dashboard',
  '/profile': 'Profile',
  '/settings': 'Settings',
  '/api-keys': 'API Keys',
};

function SidebarNavLink({
  to,
  icon: Icon,
  label,
  collapsed,
  onClick,
}: {
  to: string;
  icon: React.ElementType;
  label: string;
  collapsed: boolean;
  onClick?: () => void;
}) {
  const content = (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          'relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group w-full',
          isActive
            ? 'bg-primary/10 text-primary'
            : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
        )
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <motion.span
              layoutId="sidebar-active-pill"
              className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-r-full"
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            />
          )}
          <Icon className="w-[18px] h-[18px] flex-shrink-0" />
          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.span
                key="label"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2, ease: [0.25, 0.4, 0.25, 1] }}
                className="whitespace-nowrap overflow-hidden"
              >
                {label}
              </motion.span>
            )}
          </AnimatePresence>
        </>
      )}
    </NavLink>
  );

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent side="right">{label}</TooltipContent>
      </Tooltip>
    );
  }

  return content;
}

export function AppShell({ children }: PropsWithChildren) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const initials = (user?.username ?? user?.email ?? 'U')
    .slice(0, 2)
    .toUpperCase();

  const pageTitle = PAGE_TITLES[location.pathname] ?? 'Financial Platform';
  const sidebarWidth = collapsed ? 64 : 240;

  const SidebarContent = ({ onNavClick }: { onNavClick?: () => void }) => (
    <>
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b border-border/50 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/15 flex-shrink-0">
            <Activity className="w-4.5 h-4.5 text-primary" />
          </div>
          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.div
                key="brand"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <span className="font-bold text-foreground whitespace-nowrap tracking-tight">
                  Finance<span className="text-primary">AI</span>
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ to, icon, label }) => (
          <SidebarNavLink
            key={to}
            to={to}
            icon={icon}
            label={label}
            collapsed={collapsed}
            onClick={onNavClick}
          />
        ))}
      </nav>

      {/* Divider */}
      <Separator className="mx-3 w-auto" />

      {/* User section */}
      <div className="p-3 flex-shrink-0">
        <div
          className={cn(
            'flex items-center gap-2.5 px-2 py-2 rounded-lg',
            collapsed ? 'justify-center' : ''
          )}
        >
          <Avatar className="w-7 h-7 flex-shrink-0">
            <AvatarFallback className="bg-primary/15 text-primary text-xs font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.div
                key="user-info"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="flex-1 min-w-0 overflow-hidden"
              >
                <p className="text-xs font-semibold truncate text-foreground">
                  {user?.username ?? 'User'}
                </p>
                <p className="text-[10px] text-muted-foreground truncate">
                  {user?.email}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.button
                key="logout-btn"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
                onClick={handleLogout}
                className="flex-shrink-0 text-muted-foreground hover:text-destructive transition-colors p-1 rounded-md hover:bg-destructive/10"
                title="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );

  return (
    <TooltipProvider delayDuration={300}>
      <div className="min-h-screen bg-background flex">
        {/* ── Desktop Sidebar ──────────────────── */}
        <motion.aside
          className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 z-40 bg-card/95 border-r border-border/60 backdrop-blur-xl"
          animate={{ width: sidebarWidth }}
          transition={{ duration: 0.25, ease: [0.25, 0.4, 0.25, 1] }}
        >
          <div className="flex flex-col h-full w-full overflow-hidden">
            <SidebarContent />
          </div>

          {/* Collapse toggle */}
          <motion.button
            className="absolute -right-3.5 top-14 z-50 w-7 h-7 bg-primary border-2 border-background rounded-full flex items-center justify-center text-primary-foreground hover:bg-primary/90 transition-colors shadow-lg"
            onClick={() => setCollapsed((c) => !c)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            {collapsed ? (
              <ChevronRight className="w-3.5 h-3.5" />
            ) : (
              <ChevronLeft className="w-3.5 h-3.5" />
            )}
          </motion.button>
        </motion.aside>

        {/* ── Mobile Overlay Sidebar ───────────── */}
        <AnimatePresence>
          {mobileOpen && (
            <>
              <motion.div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileOpen(false)}
              />
              <motion.aside
                className="fixed left-0 top-0 bottom-0 w-[240px] z-50 md:hidden bg-card border-r border-border/60 flex flex-col shadow-2xl"
                initial={{ x: -240 }}
                animate={{ x: 0 }}
                exit={{ x: -240 }}
                transition={{ duration: 0.28, ease: [0.25, 0.4, 0.25, 1] }}
              >
                <SidebarContent onNavClick={() => setMobileOpen(false)} />
                <button
                  className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
                  onClick={() => setMobileOpen(false)}
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* ── Main Content ─────────────────────── */}
        <motion.div
          className="flex-1 flex flex-col min-h-screen"
          animate={{ marginLeft: isDesktop ? sidebarWidth : 0 }}
          transition={{ duration: 0.25, ease: [0.25, 0.4, 0.25, 1] }}
        >
          {/* Top header */}
          <header className="h-14 border-b border-border/50 bg-card/60 backdrop-blur-xl sticky top-0 z-30 flex items-center px-4 md:px-6 gap-4">
            {/* Mobile hamburger */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-8 w-8 text-muted-foreground"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="w-4 h-4" />
            </Button>

            {/* Page title */}
            <h1 className="hidden md:block text-sm font-semibold text-foreground">
              {pageTitle}
            </h1>

            {/* Symbol search — dashboard only */}
            <div className="flex-1 flex justify-center">
              {location.pathname === '/dashboard' && <SymbolSearch />}
            </div>

            {/* Header actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
              >
                <Bell className="w-4 h-4" />
              </Button>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 p-4 md:p-6">{children}</main>
        </motion.div>
      </div>
    </TooltipProvider>
  );
}
