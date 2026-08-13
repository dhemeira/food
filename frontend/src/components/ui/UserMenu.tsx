import { useAuth } from '~/context/auth';
import { Link } from 'react-router-dom';

function UserMenu() {
  const { logout, isAdmin } = useAuth();
  return (
    <div
      id="user-menu"
      popover="auto"
      style={{
        positionAnchor: '--user-menu',
        positionArea: 'bottom span-x-start',
      }}
      className="bg-surface border-border absolute mt-1 rounded-xl border p-2">
      <div className="flex flex-col gap-2">
        {isAdmin && (
          <Link
            to="/admin"
            className="text-text hover:bg-accent-hover rounded-lg p-2 brightness-80 hover:brightness-100">
            Admin
          </Link>
        )}
        <button
          onClick={() => {
            void logout();
          }}
          className="text-text hover:bg-accent-hover rounded-lg p-2 text-left brightness-80 hover:brightness-100">
          Kijelentkezés
        </button>
      </div>
    </div>
  );
}

export default UserMenu;
