import { Link, NavLink } from 'react-router-dom';
import {
  ArrowRightEndOnRectangleIcon,
  ArrowRightStartOnRectangleIcon,
  HomeIcon as HomeOutline,
  PlusCircleIcon as PlusOutline,
  UserCircleIcon as UserOutline,
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeSolid,
  PlusCircleIcon as PlusSolid,
  UserCircleIcon as UserSolid,
} from '@heroicons/react/24/solid';
import { Avatar, GlassSurface, Navbar as TopNavbar, TabBar } from '@dhemeira/ui';
import { useAuth, username } from '~/context/auth';

function Navbar() {
  const { user, signIn, signOut } = useAuth();

  return (
    <>
      <TopNavbar className="hidden border-b sm:block">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-2 py-1">
          <Link to="/" className="text-ui-text p-2 text-xl font-semibold hover:brightness-80">
            Receptek
          </Link>
          <div className="flex items-center gap-1 text-sm">
            {user ? (
              <>
                <Link to="/recipe/new" className="text-ui-text p-2 hover:brightness-80">
                  Új recept
                </Link>
                <Link
                  to="/profile"
                  className="text-ui-text flex items-center gap-2 p-2 hover:brightness-80">
                  <Avatar username={username(user)} />
                  {username(user)}
                </Link>
                <button
                  type="button"
                  onClick={() => void signOut()}
                  className="text-ui-text p-2 hover:brightness-80">
                  Kijelentkezés
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => void signIn()}
                className="text-ui-text p-2 hover:brightness-80">
                Bejelentkezés
              </button>
            )}
          </div>
        </div>
      </TopNavbar>

      <GlassSurface className="fixed right-5.5 bottom-5.5 left-5.5 z-20 sm:hidden">
        <TabBar className="h-15 gap-0.5 px-3 py-1.25">
          <NavLink to="/" end className="flex-1">
            {({ isActive }) => (
              <TabBar.Item
                active={isActive}
                icon={<HomeOutline className="size-6.5" />}
                activeIcon={<HomeSolid className="size-6.5" />}
              />
            )}
          </NavLink>

          {user ? (
            <>
              <NavLink to="/recipe/new" className="flex-1">
                {({ isActive }) => (
                  <TabBar.Item
                    active={isActive}
                    icon={<PlusOutline className="size-6.5" />}
                    activeIcon={<PlusSolid className="size-6.5" />}
                  />
                )}
              </NavLink>

              <NavLink to="/profile" className="flex-1">
                {({ isActive }) => (
                  <TabBar.Item
                    active={isActive}
                    icon={<UserOutline className="size-6.5" />}
                    activeIcon={<UserSolid className="size-6.5" />}
                  />
                )}
              </NavLink>

              <button
                type="button"
                onClick={() => void signOut()}
                aria-label="Kijelentkezés"
                className="text-ui-text flex flex-1 items-center justify-center">
                <ArrowRightStartOnRectangleIcon className="size-6.5" />
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => void signIn()}
              aria-label="Bejelentkezés"
              className="text-ui-text flex flex-1 items-center justify-center">
              <ArrowRightEndOnRectangleIcon className="size-6.5" />
            </button>
          )}
        </TabBar>
      </GlassSurface>
    </>
  );
}

export default Navbar;
