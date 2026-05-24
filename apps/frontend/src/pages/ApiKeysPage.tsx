import { type FormEvent, useEffect, useState } from 'react';
import { AppShell } from '../components/AppShell';
import { getApiErrorMessage, userApi } from '../services/api';
import type { ApiKeySummary, CreatedApiKey } from '../types/user';

export function ApiKeysPage() {
  const [apiKeys, setApiKeys] = useState<ApiKeySummary[]>([]);
  const [name, setName] = useState('Research terminal');
  const [createdKey, setCreatedKey] = useState<CreatedApiKey | null>(null);
  const [error, setError] = useState('');

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

    userApi
      .listApiKeys()
      .then((response) => {
        if (isMounted) {
          setApiKeys(response.apiKeys);
        }
      })
      .catch((requestError) => {
        if (isMounted) {
          setError(getApiErrorMessage(requestError));
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const createApiKey = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    try {
      const response = await userApi.createApiKey(name);
      setCreatedKey(response.apiKey);
      setName('');
      await loadApiKeys();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    }
  };

  const revokeApiKey = async (keyId: string) => {
    setError('');
    try {
      await userApi.revokeApiKey(keyId);
      await loadApiKeys();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    }
  };

  return (
    <AppShell>
      <section className="section-band">
        <div className="section-heading">
          <span className="eyebrow">Day 9</span>
          <h2>API Keys</h2>
          <p>Generate scoped keys for scripts and future integrations.</p>
        </div>

        <form className="inline-form" onSubmit={createApiKey}>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Key name"
            aria-label="API key name"
          />
          <button type="submit">Generate key</button>
        </form>

        {error ? <p className="form-error">{error}</p> : null}

        {createdKey ? (
          <div className="secret-box">
            <span>New key</span>
            <code>{createdKey.key}</code>
          </div>
        ) : null}

        <div className="table-list" role="list" aria-label="API keys">
          {apiKeys.map((apiKey) => (
            <article key={apiKey.id} role="listitem">
              <div>
                <strong>{apiKey.name}</strong>
                <span>{apiKey.keyPrefix}...</span>
              </div>
              <span>{apiKey.revokedAt ? 'Revoked' : 'Active'}</span>
              <button
                type="button"
                disabled={Boolean(apiKey.revokedAt)}
                onClick={() => void revokeApiKey(apiKey.id)}
              >
                Revoke
              </button>
            </article>
          ))}
          {apiKeys.length === 0 ? <p className="empty-state">No API keys yet.</p> : null}
        </div>
      </section>
    </AppShell>
  );
}
