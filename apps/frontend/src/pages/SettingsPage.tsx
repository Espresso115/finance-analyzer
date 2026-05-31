import { type FormEvent, useState } from 'react';
import { AppShell } from '../components/AppShell';
import { passwordRegex } from '../schemas/auth';
import { getApiErrorMessage, userApi } from '../services/api';
import { useAuthStore } from '../store/authStore';
import type { UserPreferences } from '../types/auth';

const defaultSettings: UserPreferences = {
  theme: 'system',
  notificationsEnabled: true,
  marketAlertsEnabled: false,
  defaultWatchlist: []
};

export function SettingsPage() {
  const user = useAuthStore((state) => state.user);
  const syncUser = useAuthStore((state) => state.syncUser);
  const initialSettings = user?.profile?.preferences || defaultSettings;
  const [settings, setSettings] = useState<UserPreferences>(
    initialSettings
  );
  const [watchlistText, setWatchlistText] = useState(initialSettings.defaultWatchlist.join(', '));
  const [passwordMessage, setPasswordMessage] = useState('');
  const [settingsMessage, setSettingsMessage] = useState('');
  const [settingsError, setSettingsError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const saveSettings = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSettingsMessage('');
    setSettingsError('');
    try {
      await userApi.updateSettings({
        ...settings,
        defaultWatchlist: watchlistText
          .split(',')
          .map((symbol) => symbol.trim())
          .filter(Boolean)
      });
      await syncUser();
      setSettingsMessage('Settings saved');
    } catch (requestError) {
      setSettingsError(getApiErrorMessage(requestError));
    }
  };

  const submitPassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPasswordMessage('');
    setPasswordError('');
    if (!passwordRegex.test(newPassword)) {
      setPasswordError('Use 8+ characters with at least one letter, one number, and no spaces.');
      return;
    }

    try {
      await userApi.changePassword({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setPasswordMessage('Password changed');
    } catch (requestError) {
      setPasswordError(getApiErrorMessage(requestError));
    }
  };

  return (
    <AppShell>
      <section className="split-sections">
        <div className="section-band">
          <div className="section-heading">
            <span className="eyebrow">Day 8</span>
            <h2>Settings</h2>
            <p>Preferences used by dashboards and future analysis flows.</p>
          </div>

          <form className="workspace-form" onSubmit={saveSettings}>
            <label>
              Theme
              <select
                value={settings.theme}
                onChange={(event) =>
                  setSettings({ ...settings, theme: event.target.value as UserPreferences['theme'] })
                }
              >
                <option value="system">System</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </label>

            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={settings.notificationsEnabled}
                onChange={(event) =>
                  setSettings({ ...settings, notificationsEnabled: event.target.checked })
                }
              />
              <span>Notifications enabled</span>
            </label>

            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={settings.marketAlertsEnabled}
                onChange={(event) =>
                  setSettings({ ...settings, marketAlertsEnabled: event.target.checked })
                }
              />
              <span>Market alerts enabled</span>
            </label>

            <label>
              Default watchlist
              <input
                value={watchlistText}
                onChange={(event) => setWatchlistText(event.target.value)}
                placeholder="AAPL, MSFT, NVDA"
              />
            </label>

            <button type="submit">Save settings</button>
            {settingsError ? <p className="form-error">{settingsError}</p> : null}
            {settingsMessage ? <p className="success-message">{settingsMessage}</p> : null}
          </form>
        </div>

        <div className="section-band">
          <div className="section-heading">
            <span className="eyebrow">Security</span>
            <h2>Password</h2>
            <p>Change the account password after confirming the current one.</p>
          </div>

          <form className="workspace-form" onSubmit={submitPassword}>
            <label>
              Current password
              <input
                type="password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
              />
            </label>
            <label>
              New password
              <input
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
              />
            </label>
            <button type="submit">Change password</button>
            {passwordError ? <p className="form-error">{passwordError}</p> : null}
            {passwordMessage ? <p className="success-message">{passwordMessage}</p> : null}
          </form>
        </div>
      </section>
    </AppShell>
  );
}
