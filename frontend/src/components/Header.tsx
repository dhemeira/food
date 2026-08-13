import { Link } from 'react-router-dom';
import { useAuth } from '~/context/auth';
import Avatar from './ui/Avatar';
import UserMenu from './ui/UserMenu';

function Header() {
  const { user, isAdmin } = useAuth();

  return (
    <header className="border-border bg-surface sticky top-0 z-20 border-b">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-3">
        <Link to="/" className="text-text text-xl font-semibold hover:brightness-80">
          Receptek
        </Link>
        <nav className="flex items-center gap-3 text-sm">
          {user ? (
            <>
              {isAdmin && (
                <Link to="/admin" className="text-text brightness-80 hover:brightness-100">
                  Admin
                </Link>
              )}
              <Link to="/recipe/new" className="text-text brightness-80 hover:brightness-100">
                Új recept
              </Link>
              <Avatar
                style={{ anchorName: '--user-menu' }}
                username={user.username}
                popoverTarget="user-menu"
              />
              <UserMenu />
            </>
          ) : (
            <Link to="/login" className="text-text brightness-80 hover:brightness-100">
              Bejelentkezés
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;
