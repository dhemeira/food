import { useAuth } from '~/context/auth';

function UserMenu() {
  const { logout } = useAuth();
  return (
    <div
      id="user-menu"
      popover="auto"
      style={{
        positionAnchor: '--user-menu',
        positionArea: 'bottom span-x-start',
      }}
      className="bg-surface border-border absolute mt-1 rounded-xl border p-3">
      <button
        onClick={() => {
          void logout();
        }}
        className="text-text brightness-80 hover:brightness-100">
        Kijelentkezés
      </button>
    </div>
  );
}

export default UserMenu;
