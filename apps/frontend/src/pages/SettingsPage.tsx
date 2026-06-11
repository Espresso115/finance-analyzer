import { type FormEvent, useState } from 'react';
import { AppShell } from '../components/AppShell';
import { getApiErrorMessage, userApi } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings } from 'lucide-react';

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
      <div className="max-w-3xl space-y-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground">Manage preferences used by dashboards and analysis flows.</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary" />
              <CardTitle>Application Settings</CardTitle>
            </div>
            <CardDescription>
              Configure your notifications and market defaults.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={saveSettings} className="space-y-6">
              
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">Additional preferences are coming soon. Current configurations are automatically handled by your workspace profile.</p>
              </div>

              {settingsError && <p className="text-sm font-medium text-destructive">{settingsError}</p>}
              {settingsMessage && <p className="text-sm font-medium text-green-500">{settingsMessage}</p>}

              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Settings'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
