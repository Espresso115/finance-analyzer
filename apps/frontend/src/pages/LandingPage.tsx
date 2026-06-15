import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Activity,
  ArrowRight,
  BarChart3,
  Globe2,
  LineChart,
  Shield,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StaggerContainer, StaggerItem } from '../components/motion/StaggerContainer';
import { FadeInView } from '../components/motion/FadeIn';
import { SlideUpView } from '../components/motion/SlideUp';

const FEATURES = [
  {
    icon: BarChart3,
    title: 'Advanced Analytics',
    description: 'Real-time market data and professional-grade charts powered by TradingView.',
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Optimized performance for instant access to critical financial information.',
  },
  {
    icon: Globe2,
    title: 'Global Markets',
    description: 'Track equities, forex, crypto, and commodities across worldwide exchanges.',
  },
  {
    icon: LineChart,
    title: 'AI Insights',
    description: 'Machine learning algorithms to help you spot trends before they break.',
  },
  {
    icon: Shield,
    title: 'Bank-grade Security',
    description: 'Enterprise-level encryption keeps your strategies and API keys secure.',
  },
  {
    icon: Activity,
    title: 'Custom Dashboards',
    description: 'Build your personalized command center tailored to your trading style.',
  },
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col overflow-hidden selection:bg-primary/30 selection:text-primary-foreground">
      {/* ── Navbar ─────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5 group cursor-pointer">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <Activity className="w-4 h-4 text-primary" />
            </div>
            <span className="font-bold text-foreground tracking-tight text-lg">
              Finance<span className="text-primary">AI</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost" className="text-sm font-medium hover:bg-secondary/60">
                Log in
              </Button>
            </Link>
            <Link to="/register">
              <Button className="text-sm font-semibold shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1 pt-16">
        {/* ── Hero Section ───────────────────────────── */}
        <section className="relative px-6 pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
          {/* Background effects */}
          <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
              className="absolute w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] mix-blend-screen"
              style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
            />
          </div>

          <div className="max-w-7xl mx-auto relative z-10 text-center">
            <StaggerContainer className="max-w-3xl mx-auto space-y-8">
              <StaggerItem>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary border border-border/50 text-xs font-medium text-muted-foreground mb-4">
                  <span className="flex h-2 w-2 rounded-full bg-primary" />
                  FinanceAI Platform 2.0 is live
                </div>
              </StaggerItem>
              <StaggerItem>
                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground leading-[1.1]">
                  Intelligent markets, <br />
                  <span className="gradient-text-primary">simplified.</span>
                </h1>
              </StaggerItem>
              <StaggerItem>
                <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                  The ultimate command center for modern investors. Real-time data, AI-driven insights, and professional charting—all in one beautifully designed workspace.
                </p>
              </StaggerItem>
              <StaggerItem className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Link to="/register">
                  <Button size="lg" className="h-12 px-8 text-base font-semibold rounded-xl shadow-xl shadow-primary/25 hover:scale-105 transition-all">
                    Start Free Trial
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="lg" variant="outline" className="h-12 px-8 text-base font-semibold rounded-xl hover:bg-secondary/60">
                    View Demo <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </StaggerItem>
            </StaggerContainer>

            {/* Dashboard Mockup Image */}
            <SlideUpView delay={0.4} duration={0.8} distance={60} className="mt-20 md:mt-32">
              <div className="relative mx-auto max-w-6xl rounded-2xl md:rounded-[32px] border border-border/40 bg-card/40 p-2 md:p-4 backdrop-blur-3xl shadow-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent z-10" />
                <div className="rounded-xl md:rounded-2xl overflow-hidden border border-border/60 bg-secondary/20 relative shadow-inner aspect-[16/9] flex items-center justify-center">
                  {/* Pseudo dashboard mockup */}
                  <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
                  <div className="flex flex-col gap-4 w-full h-full p-4 md:p-8">
                    <div className="flex gap-4">
                      <div className="w-1/4 h-32 bg-primary/10 rounded-xl border border-primary/20" />
                      <div className="w-1/4 h-32 bg-primary/10 rounded-xl border border-primary/20" />
                      <div className="w-1/2 h-32 bg-secondary/50 rounded-xl border border-border/50" />
                    </div>
                    <div className="flex gap-4 flex-1">
                      <div className="w-2/3 h-full bg-secondary/30 rounded-xl border border-border/50" />
                      <div className="w-1/3 h-full bg-secondary/30 rounded-xl border border-border/50" />
                    </div>
                  </div>
                </div>
              </div>
            </SlideUpView>
          </div>
        </section>

        {/* ── Features Section ───────────────────────── */}
        <section className="py-24 md:py-32 bg-secondary/30 border-y border-border/40 relative">
          <div className="max-w-7xl mx-auto px-6">
            <FadeInView className="text-center max-w-3xl mx-auto mb-16 md:mb-24">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
                Everything you need to outsmart the market.
              </h2>
              <p className="text-lg text-muted-foreground">
                We've built the tools so you can focus on the strategy. No more switching between five different apps to make one trade.
              </p>
            </FadeInView>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {FEATURES.map((feature, i) => (
                <SlideUpView key={i} delay={i * 0.1} className="p-8 rounded-3xl bg-card border border-border/60 shadow-sm hover:shadow-md transition-shadow group">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </SlideUpView>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ─────────────────────────────────── */}
      <footer className="border-t border-border/40 bg-card py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="flex items-center justify-center w-6 h-6 rounded bg-primary/10">
                <Activity className="w-3.5 h-3.5 text-primary" />
              </div>
              <span className="font-bold text-foreground">FinanceAI</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-sm">
              Empowering investors with institutional-grade tools and artificial intelligence. Built for the modern trader.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">API</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">About</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-border/40 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© 2026 FinanceAI Inc. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
