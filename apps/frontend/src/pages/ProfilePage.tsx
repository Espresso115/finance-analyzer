import { type FormEvent, useState } from 'react';
import { AppShell } from '../components/AppShell';
import { getApiErrorMessage, userApi } from '../services/api';
import { useAuthStore } from '../store/authStore';

export function ProfilePage() {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const [bio, setBio] = useState(user?.profile?.bio || '');
  const [company, setCompany] = useState(user?.profile?.company || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.profile?.avatarUrl || '');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage('');
    setError('');
    try {
      const response = await userApi.updateProfile({ bio, company, avatarUrl });
      setUser(response.user);
      setMessage('Profile saved');
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    }
  };

  return (
    <AppShell>
      <section className="section-band">
        <div className="section-heading">
          <span className="eyebrow">Day 8</span>
          <h2>Profile</h2>
          <p>Keep the user metadata the analysis workspace needs.</p>
        </div>

        <form className="workspace-form" onSubmit={handleSubmit}>
          <label>
            Bio
            <textarea value={bio} onChange={(event) => setBio(event.target.value)} rows={4} />
          </label>
          <label>
            Company
            <input value={company} onChange={(event) => setCompany(event.target.value)} />
          </label>
          <label>
            Avatar URL
            <input value={avatarUrl} onChange={(event) => setAvatarUrl(event.target.value)} />
          </label>
          <button type="submit">Save profile</button>
          {error ? <p className="form-error">{error}</p> : null}
          {message ? <p className="success-message">{message}</p> : null}
        </form>
      </section>
    </AppShell>
  );
}
