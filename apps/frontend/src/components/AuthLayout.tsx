import type { PropsWithChildren } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Activity, TrendingUp, Shield, BarChart3, Briefcase } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

type AuthLayoutProps = PropsWithChildren;

const NAV_LINKS = [
  { label: 'Markets', description: 'Real-time stock market overview, live prices, watchlists, and market insights.' },
  { label: 'Research', description: 'AI-powered financial report analysis using Retrieval-Augmented Generation (RAG), intelligent document search, and conversational financial research.' },
  { label: 'Pricing', description: 'Plus includes more powerful AI models, faster response times, premium analysis features, and email workflow automation.' },
];

const FEATURES = [
  { icon: TrendingUp, text: 'Real-time data' },
  { icon: BarChart3, text: 'Deep analytics' },
  { icon: Briefcase, text: 'Personal Financial Workspace' },
];

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <main className="min-h-screen bg-background relative overflow-hidden flex flex-col">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-48 -right-48 w-[500px] h-[500px] rounded-full"
          style={{
            background:
              'radial-gradient(circle, hsl(217 91% 60% / 0.12) 0%, transparent 70%)',
          }}
          animate={{ scale: [1, 1.08, 1], x: [0, 20, 0], y: [0, -15, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-48 -left-48 w-[600px] h-[600px] rounded-full"
          style={{
            background:
              'radial-gradient(circle, hsl(217 91% 60% / 0.08) 0%, transparent 70%)',
          }}
          animate={{ scale: [1.05, 1, 1.05], x: [0, -10, 0], y: [0, 20, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full"
          style={{
            background:
              'radial-gradient(circle, hsl(217 91% 60% / 0.04) 0%, transparent 70%)',
          }}
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
        />
      </div>

      {/* Fine grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            'linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5">
        <Link
          to="/"
          className="flex items-center gap-2.5 group"
          aria-label="FinanceAI home"
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/15 group-hover:bg-primary/20 transition-colors">
            <Activity className="w-4 h-4 text-primary" />
          </div>
          <span className="font-bold text-foreground tracking-tight">
            Finance<span className="text-primary">AI</span>
          </span>
        </Link>

        <div className="hidden sm:flex items-center gap-6">
          <TooltipProvider delayDuration={300}>
            {NAV_LINKS.map(({ label, description }) => (
              <Tooltip key={label}>
                <TooltipTrigger asChild>
                  <div className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-help">
                    {label}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-[250px] text-xs text-center p-3">
                  <p>{description}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>
        </div>
      </nav>

      {/* Content */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.25, 0.4, 0.25, 1] }}
          className="w-full max-w-md"
        >
          {children}
        </motion.div>

        {/* Features strip */}
        <motion.div
          className="flex items-center gap-6 mt-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          {FEATURES.map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Icon className="w-3.5 h-3.5 text-primary/70" />
              <span>{text}</span>
            </div>
          ))}
        </motion.div>
      </section>
    </main>
  );
}
