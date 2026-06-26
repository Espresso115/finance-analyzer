import { motion } from 'framer-motion';
import { AppShell } from '../components/AppShell';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Settings, Shield, Bell } from 'lucide-react';

export function SettingsPage() {
  const settingsOptions = [
    {
      id: 'theme',
      title: 'Theme Customization',
      description: 'Personalize the look and feel of your workspace.',
      icon: Settings,
    },
    {
      id: 'mfa',
      title: 'Multi-Factor Authentication (MFA)',
      description: 'Enhance your account security with two-step verification.',
      icon: Shield,
    },
    {
      id: 'email-alerts',
      title: 'Email Alerts',
      description: 'Configure notifications for market events and analysis updates.',
      icon: Bell,
    },
  ];

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Manage preferences used by dashboards and analysis flows.
          </p>
        </motion.div>

        <motion.div
          className="grid gap-4"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.08 }}
        >
          {settingsOptions.map((option) => (
            <Card key={option.id} className="border-border/50 bg-card/80 backdrop-blur-sm shadow-sm">
              <CardHeader className="flex flex-row items-center gap-4 py-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 flex-shrink-0">
                  <option.icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{option.title}</CardTitle>
                    <Badge variant="secondary" className="text-[10px] uppercase tracking-wider font-semibold">
                      Coming Soon
                    </Badge>
                  </div>
                  <CardDescription className="text-xs mt-1">
                    {option.description}
                  </CardDescription>
                </div>
              </CardHeader>
            </Card>
          ))}
        </motion.div>
      </div>
    </AppShell>
  );
}
