import { useAuth } from '~/context/auth';
import { Link } from 'react-router-dom';

function UserMenu() {
  const { logout, isAdmin } = useAuth();
  return (
    <div
      id="user-menu"
      popover="auto"

      className="bg-surface border-border absolute mb-4 rounded-xl border p-2 [position-anchor:--user-menu] [position-area:top_span-x-start] sm:mt-1 sm:[position-area:bottom_span-x-start]">
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
            const close = () => document.getElementById('user-menu')?.hidePopover();
            close();
            void logout().finally(close);
          }}
          className="text-text hover:bg-accent-hover rounded-lg p-2 text-left brightness-80 hover:brightness-100">
          Kijelentkezés
        </button>
      </div>
    </div>
  );
}

export default UserMenu;
