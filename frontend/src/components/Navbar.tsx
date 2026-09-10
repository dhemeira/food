import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowRightEndOnRectangleIcon,
  CalendarDaysIcon as CalendarDaysOutline,
  HomeIcon as HomeOutline,
  MagnifyingGlassIcon as MagnifyingGlassOutline,
  PlusCircleIcon as PlusOutline,
} from '@heroicons/react/24/outline';
import {
  CalendarDaysIcon as CalendarDaysSolid,
  HomeIcon as HomeSolid,
  MagnifyingGlassIcon as MagnifyingGlassSolid,
  PlusCircleIcon as PlusSolid,
} from '@heroicons/react/24/solid';
import { Avatar, GlassSurface, Navbar as TopNavbar, Popover, TabBar } from '@dhemeira/ui';
import { useAuth, username } from '~/context/auth';
import {
  clearSearch,
  dismissSearch,
  requestSearchFocus,
  useSearchFocused,
} from '~/lib/searchStore';

type TabKey = 'home' | 'new' | 'menu';

const ITEM_CLASS = 'text-ui-text relative z-10 flex-1';
const MENU_ITEM_CLASS =
  'text-ui-text block w-full rounded-lg px-3 py-2 text-left hover:bg-white/10';
const MENU_ITEM_ACTIVE_CLASS = 'bg-white/15';

function Navbar() {
  const { user, signIn, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const searchFocused = useSearchFocused();

  const path = location.pathname;
  const routeTab: TabKey | null =
    path === '/' ? 'home' : path === '/recipe/new' ? 'new' : path === '/menu' ? 'menu' : null;
  const onProfile = path === '/profile';

  // Remember the last real tab so that on tabless routes (a recipe detail,
  // the profile edit, …) the pill and its solid icon stay put.
  const [lastTab, setLastTab] = useState<TabKey>('home');
  const [prevRouteTab, setPrevRouteTab] = useState<TabKey | null>(routeTab);
  // The tab being pressed, set on pointerdown so the pill jumps straight to
  // the destination instead of passing through Home while search dismisses.
  const [pendingTab, setPendingTab] = useState<TabKey | null>(null);

  if (routeTab !== prevRouteTab) {
    setPrevRouteTab(routeTab);
    setPendingTab(null);
    if (routeTab !== null) setLastTab(routeTab);
  }

  const activeTab: TabKey | 'search' = searchFocused
    ? 'search'
    : (pendingTab ?? routeTab ?? lastTab);
  // When signed out the New/Menu tabs are hidden, so fall back to Home rather
  // than leaving the pill on a slot that no longer exists.
  const visibleTab: TabKey | 'search' =
    !user && activeTab !== 'home' && activeTab !== 'search' ? 'home' : activeTab;

  function pressTab(tab: TabKey): void {
    setPendingTab(tab);
    if (tab === 'home') {
      clearSearch();
    } else {
      dismissSearch();
    }
  }

  function handleSearchClick(): void {
    if (searchFocused) {
      clearSearch();
      return;
    }
    if (location.pathname !== '/') {
      void navigate('/');
    }
    requestSearchFocus();
  }

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
                <Link to="/menu" className="text-ui-text p-2 hover:brightness-80">
                  Napi menü
                </Link>
                <Link to="/recipe/new" className="text-ui-text p-2 hover:brightness-80">
                  Új recept
                </Link>
                <Link
                  to="/profile"
                  className="text-ui-text flex items-center gap-2 p-2 hover:brightness-110">
                  <Avatar username={username(user)} />
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
          <Link
            to="/"
            onPointerDown={() => {
              pressTab('home');
            }}
            aria-label="Kezdőlap"
            className={ITEM_CLASS}>
            <TabBar.Item
              active={visibleTab === 'home'}
              icon={<HomeOutline className="size-6.5" />}
              activeIcon={<HomeSolid className="size-6.5" />}
            />
          </Link>

          {user ? (
            <Link
              to="/recipe/new"
              onPointerDown={() => {
                pressTab('new');
              }}
              aria-label="Új recept"
              className={ITEM_CLASS}>
              <TabBar.Item
                active={visibleTab === 'new'}
                icon={<PlusOutline className="size-6.5" />}
                activeIcon={<PlusSolid className="size-6.5" />}
              />
            </Link>
          ) : null}

          <button
            type="button"
            onClick={handleSearchClick}
            aria-label="Keresés"
            className={ITEM_CLASS}>
            <TabBar.Item
              active={visibleTab === 'search'}
              icon={<MagnifyingGlassOutline className="size-6.5" />}
              activeIcon={<MagnifyingGlassSolid className="size-6.5" />}
            />
          </button>

          {user ? (
            <Link
              to="/menu"
              onPointerDown={() => {
                pressTab('menu');
              }}
              aria-label="Napi menü"
              className={ITEM_CLASS}>
              <TabBar.Item
                active={visibleTab === 'menu'}
                icon={<CalendarDaysOutline className="size-6.5" />}
                activeIcon={<CalendarDaysSolid className="size-6.5" />}
              />
            </Link>
          ) : null}

          {user ? (
            <Popover
              label="Fiók"
              side="top"
              align="end"
              className={ITEM_CLASS}
              trigger={<Avatar username={username(user)} className="h-8" />}>
              {(close) => (
                <>
                  <Link
                    to="/profile"
                    role="menuitem"
                    onClick={close}
                    className={`${MENU_ITEM_CLASS} ${onProfile ? MENU_ITEM_ACTIVE_CLASS : ''}`}>
                    Profil szerkesztése
                  </Link>
                  <button
                    type="button"
                    role="menuitem"
                    className={MENU_ITEM_CLASS}
                    onClick={() => {
                      close();
                      void signOut();
                    }}>
                    Kijelentkezés
                  </button>
                </>
              )}
            </Popover>
          ) : (
            <button
              type="button"
              onClick={() => void signIn()}
              aria-label="Bejelentkezés"
              className={`${ITEM_CLASS} flex items-center justify-center`}>
              <ArrowRightEndOnRectangleIcon className="size-6.5" />
            </button>
          )}
        </TabBar>
      </GlassSurface>
    </>
  );
}

export default Navbar;
