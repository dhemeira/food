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
  ArrowRightEndOnRectangleIcon as ArrowRightEndOnRectangleSolid,
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
import Search from './Search';

type TabKey = 'home' | 'new' | 'menu' | 'login' | 'profile';

const ITEM_CLASS = 'text-text relative z-10 flex-1';
const MENU_ITEM_CLASS = 'text-text block w-full rounded-lg px-3 py-2 text-left hover:bg-text/20';
const MENU_ITEM_ACTIVE_CLASS = 'bg-text/20';
const DESKTOP_LINK_CLASS = 'text-text rounded-lg p-2 hover:bg-text/20';
const DESKTOP_LINK_ACTIVE_CLASS = 'bg-text/20';

function Navbar() {
  const { user, signOut, isAllowed } = useAuth();
  // A signed-in but non-allowlisted account is treated as a guest everywhere.
  const activeUser = isAllowed ? user : null;
  const location = useLocation();
  const navigate = useNavigate();
  const searchFocused = useSearchFocused();

  const path = location.pathname;
  const routeTab: TabKey | null =
    path === '/'
      ? 'home'
      : path === '/recipe/new'
        ? 'new'
        : path === '/menu'
          ? 'menu'
          : path === '/profile'
            ? 'profile'
            : path === '/login'
              ? 'login'
              : null;
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
  // Hide the tabs that don't exist in the current auth state (New/Menu when
  // signed out, Login when signed in) so the pill never sits on a missing slot.
  const hiddenTabs: readonly TabKey[] = activeUser ? ['login'] : ['new', 'menu', 'profile'];
  const visibleTab: TabKey | 'search' =
    activeTab !== 'search' && hiddenTabs.includes(activeTab) ? 'home' : activeTab;

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
          <Link to="/" className="text-text p-2 text-xl font-semibold">
            Receptek
          </Link>
          <div className="flex items-center gap-1 text-sm">
            <Search
              onFocus={() => {
                if (location.pathname !== '/') void navigate('/');
              }}
            />
            <Link
              to="/"
              className={`${DESKTOP_LINK_CLASS} ${routeTab === 'home' ? DESKTOP_LINK_ACTIVE_CLASS : ''}`}>
              Receptek
            </Link>
            {activeUser ? (
              <>
                <Link
                  to="/recipe/new"
                  className={`${DESKTOP_LINK_CLASS} ${routeTab === 'new' ? DESKTOP_LINK_ACTIVE_CLASS : ''}`}>
                  Új recept
                </Link>
                <Link
                  to="/menu"
                  className={`${DESKTOP_LINK_CLASS} ${routeTab === 'menu' ? DESKTOP_LINK_ACTIVE_CLASS : ''}`}>
                  Napi menü
                </Link>
                <Popover
                  label="Fiók"
                  side="bottom"
                  align="end"
                  gap={1}
                  active={visibleTab === 'profile'}
                  className={ITEM_CLASS}
                  trigger={
                    <Avatar username={username(activeUser)} seed={activeUser.id} className="h-8" />
                  }>
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
              </>
            ) : (
              <Link
                to="/login"
                className={`${DESKTOP_LINK_CLASS} ${routeTab === 'login' ? DESKTOP_LINK_ACTIVE_CLASS : ''}`}>
                Bejelentkezés
              </Link>
            )}
          </div>
        </div>
      </TopNavbar>

      <GlassSurface className="fixed right-5.5 bottom-5.5 left-5.5 z-20 rounded-full sm:hidden">
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

          {activeUser ? (
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

          {activeUser ? (
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

          {activeUser ? (
            <Popover
              label="Fiók"
              side="top"
              align="end"
              active={visibleTab === 'profile'}
              className={ITEM_CLASS}
              trigger={
                <Avatar username={username(activeUser)} seed={activeUser.id} className="h-8" />
              }>
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
            <Link
              to="/login"
              onPointerDown={() => {
                pressTab('login');
              }}
              aria-label="Bejelentkezés"
              className={ITEM_CLASS}>
              <TabBar.Item
                active={visibleTab === 'login'}
                icon={<ArrowRightEndOnRectangleIcon className="size-6.5" />}
                activeIcon={<ArrowRightEndOnRectangleSolid className="size-6.5" />}
              />
            </Link>
          )}
        </TabBar>
      </GlassSurface>
    </>
  );
}

export default Navbar;
