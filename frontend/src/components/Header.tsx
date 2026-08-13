import { Link } from 'react-router-dom';
import { useAuth } from '~/context/auth';
import Avatar from './ui/Avatar';
import UserMenu from './ui/UserMenu';
import NotificationToggle from './NotificationToggle';
import NavbarLink from './NavbarLink';
import NavbarLinkPill from './NavbarLinkPill';
import Search from './Search';
import {
  HomeIcon as HomeOutline,
  PlusCircleIcon as PlusOutline,
  UserCircleIcon as UserOutline,
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeSolid,
  PlusCircleIcon as PlusSolid,
  UserCircleIcon as UserSolid,
} from '@heroicons/react/24/solid';

function Header() {
  const { user } = useAuth();

  return (
    <>
      <header className="border-border bg-surface sticky top-0 z-20 hidden border-b sm:block">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-2 py-1">
          <Link to="/" className="text-text p-2 text-xl font-semibold hover:brightness-80">
            Receptek
          </Link>
          <nav className="flex items-center gap-1 text-sm">
            <Search to="/" />
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
              </>
            ) : (
              <NavbarLink to="/login" name="Bejelentkezés" />
            )}
          </nav>
        </div>
      </header>
      <header className="bg-surface/15 fixed right-5.5 bottom-5.5 left-5.5 z-20 flex h-15 items-center justify-between gap-0.5 rounded-full px-3 py-1.25 inset-shadow-[0_0_2px_1px_#eef0fb22] backdrop-blur-xs sm:hidden">
        <NavbarLinkPill to="/" outlineIcon={HomeOutline} solidIcon={HomeSolid} />
        {user ? (
          <>
            <NavbarLinkPill to="/recipe/new" outlineIcon={PlusOutline} solidIcon={PlusSolid} />
          </>
        ) : (
          <></>
        )}

        <Search to="/" />
        {user ? (
          <>
            <NotificationToggle className="flex h-full w-full items-center justify-center brightness-80 hover:brightness-100" />
            <div className="flex h-full w-full items-center justify-center">
              <Avatar
                style={{ anchorName: '--user-menu' }}
                username={user.username}
                popoverTarget="user-menu"
              />
            </div>
          </>
        ) : (
          <NavbarLinkPill to="/login" outlineIcon={UserOutline} solidIcon={UserSolid} />
        )}
      </header>
      <UserMenu />
    </>
  );
}

export default Header;
