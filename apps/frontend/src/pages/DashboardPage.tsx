import { UserMenu } from '../components/UserMenu';
import { useAuthStore } from '../store/authStore';

export function DashboardPage() {
  const user = useAuthStore((state) => state.user);

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <span className="eyebrow">Authenticated</span>
          <h1>Workspace</h1>
        </div>
        <UserMenu />
      </header>

      <section className="workspace-grid" aria-label="Workspace overview">
        <article>
          <span>Profile</span>
          <strong>{user?.email}</strong>
          <p>Role: {user?.role}</p>
        </article>
        <article>
          <span>Market cache</span>
          <strong>Ready</strong>
          <p>Protected quote endpoint is available.</p>
        </article>
        <article>
          <span>Next milestone</span>
          <strong>Dashboard</strong>
          <p>Week 2 begins with profile and API key management.</p>
        </article>
      </section>
    </main>
  );
}
