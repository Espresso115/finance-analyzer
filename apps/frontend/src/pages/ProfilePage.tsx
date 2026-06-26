import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AppShell } from '../components/AppShell';
import { getApiErrorMessage, userApi } from '../services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { KeyRound, User, Loader2, CheckCircle2, AlertCircle, Mail, UserMinus, LogOut } from 'lucide-react';
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
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

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

  const handleDeleteAccount = async () => {
    setDeleteError('');
    setIsDeleting(true);
    try {
      await userApi.deleteAccount(currentPassword);
      await logout();
      navigate('/login', { replace: true });
    } catch (requestError) {
      setDeleteError(getApiErrorMessage(requestError));
    } finally {
      setIsDeleting(false);
    }
  };

  const initials = (user?.username ?? user?.email ?? 'U')
    .slice(0, 2)
    .toUpperCase();

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h2 className="text-2xl font-bold tracking-tight">Profile</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your account and security settings.
          </p>
        </motion.div>

        <motion.div
          className="grid gap-5"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.08 }}
        >
          {/* Account details card */}
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <CardTitle className="text-base">Account Details</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-5">
                <div className="flex-1 grid gap-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        <User className="w-3 h-3" />
                        Username
                      </div>
                      <p className="text-sm font-semibold">{user?.username ?? '—'}</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        <Mail className="w-3 h-3" />
                        Email
                      </div>
                      <p className="text-sm font-medium break-all">{user?.email ?? '—'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Change password card */}
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
                  <KeyRound className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">Change Password</CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    Update your password to keep your account secure.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4 max-w-sm">
                <div className="space-y-1.5">
                  <Label htmlFor="currentPassword" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Current Password
                  </Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="h-10 bg-secondary/40 border-border/50 focus-visible:ring-1 focus-visible:ring-primary/60 rounded-lg text-sm"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="newPassword" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    New Password
                  </Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="h-10 bg-secondary/40 border-border/50 focus-visible:ring-1 focus-visible:ring-primary/60 rounded-lg text-sm"
                    required
                  />
                </div>

                <AnimatePresence mode="wait">
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2"
                    >
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      {error}
                    </motion.div>
                  )}
                  {message && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="flex items-center gap-2 text-sm text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                      {message}
                    </motion.div>
                  )}
                </AnimatePresence>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="h-10 text-sm font-semibold"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Updating…
                    </span>
                  ) : (
                    'Update Password'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Session actions */}
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-destructive flex items-center gap-2">
                <LogOut className="w-4 h-4" />
                Session
              </CardTitle>
              <CardDescription className="text-xs">
                Sign out of your account on this device.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="destructive"
                onClick={handleLogout}
                className="flex items-center gap-2 h-10 text-sm font-semibold"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign out
              </Button>
            </CardContent>
          </Card>

          {/* Danger zone */}
          <Card className="border-destructive/20 bg-destructive/5 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-destructive flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Danger Zone
              </CardTitle>
              <CardDescription className="text-xs">
                Permanently delete your account and all associated data. This action cannot be undone.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="destructive"
                onClick={() => setShowDeleteDialog(true)}
                className="flex items-center gap-2 h-10 text-sm font-semibold"
              >
                <UserMinus className="w-3.5 h-3.5" />
                Delete Account
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Delete Account Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={(open) => {
        if (!open) {
          setCurrentPassword('');
          setDeleteError('');
        }
        setShowDeleteDialog(open);
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive">Delete Account</DialogTitle>
            <DialogDescription>
              Are you sure you want to completely delete your account? All your market configurations, api keys, and preferences will be permanently removed. This action cannot be reversed.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 mt-2">
            <Label htmlFor="delete-password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Confirm your password
            </Label>
            <Input
              id="delete-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter your password to continue"
              className="h-10 bg-secondary/40 border-border/50 focus-visible:ring-1 focus-visible:ring-destructive/60 rounded-lg text-sm"
            />
          </div>
          
          <AnimatePresence>
            {deleteError && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2"
              >
                <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  {deleteError}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button variant="ghost" onClick={() => setShowDeleteDialog(false)} className="h-9 text-sm">
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={isDeleting || !currentPassword}
              className="h-9 text-sm font-semibold"
            >
              {isDeleting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Deleting…
                </span>
              ) : (
                'Yes, delete my account'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
