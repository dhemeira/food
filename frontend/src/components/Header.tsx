import { Link } from 'react-router-dom';
import { useAuth } from '~/context/auth';

function Header() {
  const { user, isAdmin, logout } = useAuth();

  return (
    <header className="border-border bg-surface sticky top-0 z-20 border-b">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-3">
        <Link to="/" className="text-text text-xl font-semibold hover:opacity-80">
          Receptek
        </Link>
        <nav className="flex items-center gap-3 text-sm">
          {user ? (
            <>
              {isAdmin && (
                <Link
                  to="/admin"
                  className="text-text-muted hover:text-text font-medium transition-colors">
                  Admin
                </Link>
              )}
              <Link
                to="/recipe/new"
                className="text-text-muted hover:text-text font-medium transition-colors">
                Új recept
              </Link>
              <span className="text-text-muted">{user.username}</span>
              <button
                type="button"
                className="text-text-muted hover:text-text font-medium transition-colors"
                onClick={() => {
                  void logout();
                }}>
                Kijelentkezés
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="text-text-muted hover:text-text font-medium transition-colors">
              Bejelentkezés
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;
