import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../components/AppShell';
import { getApiErrorMessage, userApi } from '../services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { KeyRound, User, LogOut } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export function ProfilePage() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage('');
    setError('');
    
    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters');
      return;
    }

    setIsLoading(true);
    try {
      await userApi.changePassword({ currentPassword, newPassword });
      setMessage('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <AppShell>
      <div className="max-w-3xl space-y-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Profile</h2>
          <p className="text-muted-foreground">Manage your account and security settings.</p>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                <CardTitle>Account Details</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Username</p>
                  <p className="font-medium">{user?.username}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="font-medium">{user?.email}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Role</p>
                  <p className="font-medium capitalize">{user?.role}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-primary" />
                <CardTitle>Change Password</CardTitle>
              </div>
              <CardDescription>
                Update your password to keep your account secure.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4 max-w-sm">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input 
                    id="currentPassword" 
                    type="password" 
                    value={currentPassword} 
                    onChange={(e) => setCurrentPassword(e.target.value)} 
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input 
                    id="newPassword" 
                    type="password" 
                    value={newPassword} 
                    onChange={(e) => setNewPassword(e.target.value)} 
                    required
                  />
                </div>
                
                {error && <p className="text-sm font-medium text-destructive">{error}</p>}
                {message && <p className="text-sm font-medium text-green-500">{message}</p>}
                
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Updating...' : 'Update Password'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="flex justify-end pt-4">
            <Button variant="destructive" onClick={handleLogout} className="flex items-center gap-2">
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
