import { AppShell } from '../components/AppShell';
import { useAuthStore } from '../store/authStore';

export function DashboardPage() {
  const user = useAuthStore((state) => state.user);

  return (
    <AppShell>
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
    </AppShell>
  );
}
