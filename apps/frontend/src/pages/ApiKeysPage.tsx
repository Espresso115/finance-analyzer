import { type FormEvent, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppShell } from '../components/AppShell';
import { getApiErrorMessage, userApi } from '../services/api';
import type { ApiKeySummary, CreatedApiKey } from '../types/user';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Key,
  Plus,
  Copy,
  Check,
  Trash2,
  AlertCircle,
  Loader2,
  ShieldOff,
  KeyRound,
} from 'lucide-react';

export function ApiKeysPage() {
  const [apiKeys, setApiKeys] = useState<ApiKeySummary[]>([]);
  const [name, setName] = useState('Research terminal');
  const [createdKey, setCreatedKey] = useState<CreatedApiKey | null>(null);
  const [error, setError] = useState('');
  const [isLoadingKeys, setIsLoadingKeys] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [revokeTarget, setRevokeTarget] = useState<string | null>(null);
  const [isRevoking, setIsRevoking] = useState(false);

  const loadApiKeys = async () => {
    try {
      const response = await userApi.listApiKeys();
      setApiKeys(response.apiKeys);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    }
  };

  useEffect(() => {
    let isMounted = true;

    setIsLoadingKeys(true);
    userApi
      .listApiKeys()
      .then((response) => {
        if (isMounted) {
          setApiKeys(response.apiKeys);
          setIsLoadingKeys(false);
        }
      })
      .catch((requestError) => {
        if (isMounted) {
          setError(getApiErrorMessage(requestError));
          setIsLoadingKeys(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const createApiKey = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setIsCreating(true);
    try {
      const response = await userApi.createApiKey(name);
      setCreatedKey(response.apiKey);
      setName('');
      await loadApiKeys();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setIsCreating(false);
    }
  };

  const revokeApiKey = async (keyId: string) => {
    setIsRevoking(true);
    setError('');
    try {
      await userApi.revokeApiKey(keyId);
      await loadApiKeys();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setIsRevoking(false);
      setRevokeTarget(null);
    }
  };

  const handleCopy = async () => {
    if (!createdKey) return;
    await navigator.clipboard.writeText(createdKey.key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
          <h2 className="text-2xl font-bold tracking-tight">API Keys</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Generate scoped keys for scripts and future integrations.
          </p>
        </motion.div>

        <motion.div
          className="space-y-5"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.08 }}
        >
          {/* Create key card */}
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
                  <Plus className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">Generate New Key</CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    Create a new API key for external integrations.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={createApiKey} className="flex gap-3 items-end">
                <div className="flex-1 space-y-1.5">
                  <Label htmlFor="key-name" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Key Name
                  </Label>
                  <Input
                    id="key-name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="e.g. Research terminal"
                    aria-label="API key name"
                    className="h-10 bg-secondary/40 border-border/50 focus-visible:ring-1 focus-visible:ring-primary/60 rounded-lg text-sm"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isCreating || !name.trim()}
                  className="h-10 text-sm font-semibold shrink-0"
                >
                  {isCreating ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Generating…
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Key className="w-3.5 h-3.5" />
                      Generate key
                    </span>
                  )}
                </Button>
              </form>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2"
                >
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  {error}
                </motion.div>
              )}

              {/* Newly created key banner */}
              <AnimatePresence>
                {createdKey && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: -8, height: 0 }}
                    transition={{ duration: 0.3, ease: [0.25, 0.4, 0.25, 1] }}
                    className="mt-4 overflow-hidden"
                  >
                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-semibold text-emerald-500 flex items-center gap-1.5">
                          <KeyRound className="w-3.5 h-3.5" />
                          New API key — copy it now, it won't be shown again
                        </p>
                        <button
                          type="button"
                          onClick={handleCopy}
                          className="flex items-center gap-1.5 text-xs font-semibold text-emerald-500 hover:text-emerald-400 transition-colors"
                        >
                          {copied ? (
                            <><Check className="w-3.5 h-3.5" />Copied!</>
                          ) : (
                            <><Copy className="w-3.5 h-3.5" />Copy</>
                          )}
                        </button>
                      </div>
                      <code className="block text-sm font-mono bg-secondary/50 rounded-lg px-3 py-2.5 text-foreground break-all">
                        {createdKey.key}
                      </code>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>

          {/* Keys list card */}
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
                    <Key className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Your API Keys</CardTitle>
                    <CardDescription className="text-xs mt-0.5">
                      {apiKeys.length} key{apiKeys.length !== 1 ? 's' : ''} total
                    </CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isLoadingKeys ? (
                <div className="px-6 pb-6 space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between gap-4">
                      <Skeleton className="h-10 flex-1 rounded-lg" />
                      <Skeleton className="h-10 w-20 rounded-lg" />
                    </div>
                  ))}
                </div>
              ) : apiKeys.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center px-6">
                  <div className="w-12 h-12 rounded-2xl bg-secondary/50 flex items-center justify-center mb-4">
                    <Key className="w-6 h-6 text-muted-foreground/40" />
                  </div>
                  <p className="text-sm font-semibold text-muted-foreground">No API keys yet</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">
                    Generate your first key above to get started.
                  </p>
                </div>
              ) : (
                <div role="list" aria-label="API keys">
                  <AnimatePresence>
                    {apiKeys.map((apiKey, index) => (
                      <motion.article
                        key={apiKey.id}
                        role="listitem"
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 8, height: 0 }}
                        transition={{ duration: 0.25, delay: index * 0.04 }}
                      >
                        {index > 0 && <Separator className="mx-6" />}
                        <div className="flex items-center justify-between gap-4 px-6 py-4">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-secondary/50 flex items-center justify-center flex-shrink-0">
                              <Key className="w-3.5 h-3.5 text-muted-foreground" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold truncate">{apiKey.name}</p>
                              <p className="text-xs text-muted-foreground font-mono">
                                {apiKey.keyPrefix}••••••••
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 flex-shrink-0">
                            <Badge variant={apiKey.revokedAt ? 'secondary' : 'success'}>
                              {apiKey.revokedAt ? (
                                <><ShieldOff className="w-3 h-3 mr-1" />Revoked</>
                              ) : (
                                'Active'
                              )}
                            </Badge>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              disabled={Boolean(apiKey.revokedAt)}
                              onClick={() => setRevokeTarget(apiKey.id)}
                              className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                      </motion.article>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Revoke confirmation dialog */}
      <Dialog open={!!revokeTarget} onOpenChange={(open) => !open && setRevokeTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Revoke API Key</DialogTitle>
            <DialogDescription>
              This action cannot be undone. The key will be permanently revoked and any
              integrations using it will stop working.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setRevokeTarget(null)} className="h-9 text-sm">
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => revokeTarget && void revokeApiKey(revokeTarget)}
              disabled={isRevoking}
              className="h-9 text-sm font-semibold"
            >
              {isRevoking ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Revoking…
                </span>
              ) : (
                'Revoke Key'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
