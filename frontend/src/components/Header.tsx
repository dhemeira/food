import { Link } from 'react-router-dom';
import { useAuth } from '~/context/auth';
import Avatar from './ui/Avatar';
import UserMenu from './ui/UserMenu';
import NotificationToggle from './NotificationToggle';
import NavbarLink from './NavbarLink';

function Header() {
  const { user } = useAuth();

  return (
    <header className="border-border bg-surface sticky top-0 z-20 border-b">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-2 py-1">
        <Link to="/" className="text-text p-2 text-xl font-semibold hover:brightness-80">
          Receptek
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <NavbarLink to="/" name="Receptek" />
          {user ? (
            <>
              <NavbarLink to="/recipe/new" name="Új recept" />
              <NotificationToggle className="p-2 brightness-80 hover:brightness-100" />
              <Avatar
                style={{ anchorName: '--user-menu' }}
                username={user.username}
                popoverTarget="user-menu"
              />
              <UserMenu />
            </>
          ) : (
            <NavbarLink to="/login" name="Bejelentkezés" />
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;
