import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export function UserMenu() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  if (!user) {
    return null;
  }

  return (
    <div className="user-menu">
      <div>
        <span>{user.username}</span>
        <small>{user.role}</small>
      </div>
      <button type="button" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
}
