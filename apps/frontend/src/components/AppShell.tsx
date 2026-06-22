import { useState, useEffect, type PropsWithChildren } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  User,
  Settings,
  Key,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  LogOut,
  Bell,
  FileText,
  MessageSquareText,
  LineChart,
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
  { to: '/documents', icon: FileText, label: 'Documents' },
  { to: '/analysis', icon: MessageSquareText, label: 'Analysis' },
  { to: '/profile', icon: User, label: 'Profile' },
  { to: '/settings', icon: Settings, label: 'Settings' },
  { to: '/api-keys', icon: Key, label: 'API Keys' },
];

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Market Dashboard',
  '/documents': 'Document Management',
  '/analysis': 'AI Analysis',
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
          'relative flex items-center gap-3 px-3 py-2 text-[13px] font-medium transition-all duration-150 group w-full outline-none',
          isActive
            ? 'bg-primary/10 text-primary border-l-2 border-primary'
            : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50 border-l-2 border-transparent'
        )
      }
    >
      <Icon className="w-4 h-4 flex-shrink-0" />
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.span
            key="label"
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="whitespace-nowrap overflow-hidden"
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </NavLink>
  );

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent side="right" className="text-xs">{label}</TooltipContent>
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
  const sidebarWidth = collapsed ? 60 : 220;

  const SidebarContent = ({ onNavClick }: { onNavClick?: () => void }) => (
    <>
      {/* Logo */}
      <div className="flex items-center h-12 px-4 border-b border-border flex-shrink-0 bg-card">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-6 h-6 rounded bg-primary/10 border border-primary/20 flex-shrink-0">
            <LineChart className="w-3.5 h-3.5 text-primary" />
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
                <span className="font-bold text-sm text-foreground whitespace-nowrap tracking-tight">
                  Finance<span className="text-primary">AI</span>
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 py-3 flex flex-col gap-0.5 overflow-y-auto">
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

      <Separator className="w-full bg-border" />

      {/* User section */}
      <div className="p-2 flex-shrink-0 bg-card/50">
        <div
          className={cn(
            'flex items-center gap-2 px-2 py-2 rounded-sm',
            collapsed ? 'justify-center' : ''
          )}
        >
          <Avatar className="w-6 h-6 flex-shrink-0 rounded-sm">
            <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold rounded-sm border border-primary/20">
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
                <p className="text-xs font-semibold truncate text-foreground leading-none">
                  {user?.username ?? 'User'}
                </p>
                <p className="text-[10px] text-muted-foreground truncate mt-1 leading-none">
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
                className="flex-shrink-0 text-muted-foreground hover:text-destructive transition-colors p-1 rounded hover:bg-destructive/10"
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
      <div className="min-h-screen bg-background flex text-foreground selection:bg-primary/30">
        {/* ── Desktop Sidebar ──────────────────── */}
        <motion.aside
          className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 z-40 bg-card border-r border-border"
          animate={{ width: sidebarWidth }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
        >
          <div className="flex flex-col h-full w-full overflow-hidden">
            <SidebarContent />
          </div>

          {/* Collapse toggle */}
          <motion.button
            className="absolute -right-2.5 top-14 z-50 w-5 h-5 bg-secondary border border-border rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors shadow-sm"
            onClick={() => setCollapsed((c) => !c)}
          >
            {collapsed ? (
              <ChevronRight className="w-3 h-3" />
            ) : (
              <ChevronLeft className="w-3 h-3" />
            )}
          </motion.button>
        </motion.aside>

        {/* ── Mobile Overlay Sidebar ───────────── */}
        <AnimatePresence>
          {mobileOpen && (
            <>
              <motion.div
                className="fixed inset-0 bg-black/60 z-40 md:hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileOpen(false)}
              />
              <motion.aside
                className="fixed left-0 top-0 bottom-0 w-[220px] z-50 md:hidden bg-card border-r border-border flex flex-col shadow-2xl"
                initial={{ x: -220 }}
                animate={{ x: 0 }}
                exit={{ x: -220 }}
                transition={{ duration: 0.28, ease: "easeInOut" }}
              >
                <SidebarContent onNavClick={() => setMobileOpen(false)} />
                <button
                  className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
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
          className="flex-1 flex flex-col min-h-screen min-w-0"
          animate={{ marginLeft: isDesktop ? sidebarWidth : 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
        >
          {/* Top header */}
          <header className="h-12 border-b border-border bg-card sticky top-0 z-30 flex items-center px-4 gap-4">
            {/* Mobile hamburger */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-7 w-7 text-muted-foreground rounded-sm"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="w-4 h-4" />
            </Button>

            {/* Page title */}
            <h1 className="hidden md:block text-xs font-semibold text-foreground uppercase tracking-wider text-muted-foreground">
              {pageTitle}
            </h1>

            {/* Symbol search — dashboard only */}
            <div className="flex-1 flex justify-center max-w-xl mx-auto">
              {location.pathname === '/dashboard' && <SymbolSearch />}
            </div>

            {/* Header actions */}
            <div className="flex items-center gap-1.5 ml-auto">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-foreground rounded-sm"
              >
                <Bell className="w-4 h-4" />
              </Button>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 p-4 md:p-6 lg:p-8 flex flex-col max-w-[1600px] w-full mx-auto">
            {children}
          </main>
        </motion.div>
      </div>
    </TooltipProvider>
  );
}
