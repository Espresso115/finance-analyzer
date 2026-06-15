import { type FormEvent, useState } from 'react';
import { motion } from 'framer-motion';
import { AppShell } from '../components/AppShell';
import { getApiErrorMessage, userApi } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Bell, Shield, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export function SettingsPage() {
  const syncUser = useAuthStore((state) => state.syncUser);
  const [settingsMessage, setSettingsMessage] = useState('');
  const [settingsError, setSettingsError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const saveSettings = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSettingsMessage('');
    setSettingsError('');
    setIsLoading(true);
    try {
      await userApi.updateSettings({ theme: 'system' });
      await syncUser();
      setSettingsMessage('Settings saved successfully');
    } catch (requestError) {
      setSettingsError(getApiErrorMessage(requestError));
    } finally {
      setIsLoading(false);
    }
  };

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
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.08 }}
        >
          <Tabs defaultValue="general">
            <TabsList className="mb-6 bg-secondary/50">
              <TabsTrigger value="general" className="gap-1.5 text-xs">
                <Settings className="w-3.5 h-3.5" />
                General
              </TabsTrigger>
              <TabsTrigger value="notifications" className="gap-1.5 text-xs">
                <Bell className="w-3.5 h-3.5" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="security" className="gap-1.5 text-xs">
                <Shield className="w-3.5 h-3.5" />
                Security
              </TabsTrigger>
            </TabsList>

            {/* General tab */}
            <TabsContent value="general">
              <Card className="border-border/50 bg-card/80 backdrop-blur-sm shadow-sm">
                <CardHeader>
                  <div className="flex items-center gap-2.5">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
                      <Settings className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Application Settings</CardTitle>
                      <CardDescription className="text-xs mt-0.5">
                        Configure your notifications and market defaults.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <form onSubmit={saveSettings} className="space-y-6">
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Additional preferences are coming soon. Current configurations are
                        automatically handled by your workspace profile. Check back in a future
                        release for theme customization, data source selection, and notification
                        preferences.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {['Theme Customization', 'Data Sources', 'Alert Preferences', 'Export Settings'].map((item) => (
                          <div
                            key={item}
                            className="px-3 py-1.5 rounded-lg bg-secondary/50 border border-border/40 text-xs text-muted-foreground"
                          >
                            {item} <span className="text-primary/60 ml-1">— Coming soon</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {settingsError && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2"
                      >
                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                        {settingsError}
                      </motion.div>
                    )}
                    {settingsMessage && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2 text-sm text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                        {settingsMessage}
                      </motion.div>
                    )}

                    <Button type="submit" disabled={isLoading} className="h-10 text-sm font-semibold">
                      {isLoading ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Saving…
                        </span>
                      ) : (
                        'Save Settings'
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications tab */}
            <TabsContent value="notifications">
              <Card className="border-border/50 bg-card/80 backdrop-blur-sm shadow-sm">
                <CardHeader>
                  <div className="flex items-center gap-2.5">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
                      <Bell className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Notifications</CardTitle>
                      <CardDescription className="text-xs mt-0.5">
                        Control how and when you receive alerts.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="py-8 text-center text-muted-foreground">
                    <Bell className="w-8 h-8 mx-auto mb-3 opacity-30" />
                    <p className="text-sm font-medium">Notification preferences coming soon</p>
                    <p className="text-xs mt-1 opacity-70">
                      You'll be able to configure email and in-app alerts here.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security tab */}
            <TabsContent value="security">
              <Card className="border-border/50 bg-card/80 backdrop-blur-sm shadow-sm">
                <CardHeader>
                  <div className="flex items-center gap-2.5">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
                      <Shield className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Security</CardTitle>
                      <CardDescription className="text-xs mt-0.5">
                        Manage access controls and security settings.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="py-8 text-center text-muted-foreground">
                    <Shield className="w-8 h-8 mx-auto mb-3 opacity-30" />
                    <p className="text-sm font-medium">Advanced security features coming soon</p>
                    <p className="text-xs mt-1 opacity-70">
                      Two-factor authentication and session management will appear here.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </AppShell>
  );
}
