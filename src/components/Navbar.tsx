import { useState, type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowRightEndOnRectangleIcon,
  CalendarDaysIcon,
  HomeIcon,
  MagnifyingGlassIcon,
  PlusCircleIcon,
} from '@heroicons/react/24/outline';
import { Avatar, Popover } from '@dhemeira/ui';
import { useAuth, username } from '~/context/auth';
import {
  clearSearch,
  dismissSearch,
  requestSearchFocus,
  useSearchFocused,
} from '~/lib/searchStore';
import Logo from './Logo';
import Search from './Search';

type TabKey = 'home' | 'new' | 'menu' | 'login' | 'profile';

const MENU_ITEM_CLASS =
  'text-text block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-surface-2';
const MENU_ITEM_ACTIVE_CLASS = 'bg-surface-2';

function desktopLinkClass(active: boolean): string {
  return (
    'rounded-lg px-3 py-2 text-sm font-medium transition-colors ' +
    (active ? 'text-text' : 'text-text-muted hover:bg-surface-2 hover:text-text')
  );
}

function tabClass(active: boolean): string {
  return (
    'relative z-10 grid h-12 flex-1 place-items-center rounded-full transition-colors ' +
    (active ? 'bg-accent-soft text-accent' : 'text-text-muted hover:text-text')
  );
}

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

  function renderAccountMenu(close: () => void): ReactNode {
    return (
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
    );
  }

  return (
    <>
      <header className="bg-background/85 border-border sticky top-0 z-40 hidden border-b backdrop-blur-[14px] min-[720px]:block">
        <div className="mx-auto flex h-16 w-full max-w-280 items-center gap-6 px-6 lg:px-8">
          <Link
            to="/"
            className="flex items-center gap-2 text-[0.95rem] font-semibold tracking-[-0.01em]">
            <Logo className="size-8" />
            Receptek
          </Link>

          <nav className="ml-auto flex items-center gap-1" aria-label="Fő navigáció">
            <div className="mr-2">
              <Search
                variant="nav"
                onFocus={() => {
                  if (location.pathname !== '/') void navigate('/');
                }}
              />
            </div>

            <Link
              to="/"
              aria-current={routeTab === 'home' ? 'page' : undefined}
              className={desktopLinkClass(routeTab === 'home')}>
              Receptek
            </Link>

            {activeUser ? (
              <>
                <Link
                  to="/recipe/new"
                  aria-current={routeTab === 'new' ? 'page' : undefined}
                  className={desktopLinkClass(routeTab === 'new')}>
                  Új recept
                </Link>
                <Link
                  to="/menu"
                  aria-current={routeTab === 'menu' ? 'page' : undefined}
                  className={desktopLinkClass(routeTab === 'menu')}>
                  Napi menü
                </Link>
                <Popover
                  label="Fiók"
                  side="bottom"
                  align="end"
                  gap={1}
                  active={visibleTab === 'profile'}
                  className="ml-2"
                  trigger={
                    <Avatar username={username(activeUser)} seed={activeUser.id} className="h-9" />
                  }>
                  {renderAccountMenu}
                </Popover>
              </>
            ) : (
              <Link
                to="/login"
                aria-current={routeTab === 'login' ? 'page' : undefined}
                className={desktopLinkClass(routeTab === 'login')}>
                Bejelentkezés
              </Link>
            )}
          </nav>
        </div>
      </header>

      <nav
        aria-label="Fő navigáció"
        className="border-border bg-surface/95 fixed inset-x-3 bottom-[calc(12px+env(safe-area-inset-bottom))] z-50 flex items-center gap-1 rounded-full border p-2 shadow-[0_12px_32px_rgba(0,0,0,0.28)] backdrop-blur-[16px] backdrop-saturate-150 min-[720px]:hidden">
        <Link
          to="/"
          onPointerDown={() => {
            pressTab('home');
          }}
          aria-label="Kezdőlap"
          aria-current={visibleTab === 'home' ? 'page' : undefined}
          className={tabClass(visibleTab === 'home')}>
          <HomeIcon className="size-6" aria-hidden="true" />
        </Link>

        {activeUser ? (
          <Link
            to="/recipe/new"
            onPointerDown={() => {
              pressTab('new');
            }}
            aria-label="Új recept"
            aria-current={visibleTab === 'new' ? 'page' : undefined}
            className={tabClass(visibleTab === 'new')}>
            <PlusCircleIcon className="size-6" aria-hidden="true" />
          </Link>
        ) : null}

        <button
          type="button"
          onClick={handleSearchClick}
          aria-label="Keresés"
          aria-current={visibleTab === 'search' ? 'page' : undefined}
          className={tabClass(visibleTab === 'search')}>
          <MagnifyingGlassIcon className="size-6" aria-hidden="true" />
        </button>

        {activeUser ? (
          <Link
            to="/menu"
            onPointerDown={() => {
              pressTab('menu');
            }}
            aria-label="Napi menü"
            aria-current={visibleTab === 'menu' ? 'page' : undefined}
            className={tabClass(visibleTab === 'menu')}>
            <CalendarDaysIcon className="size-6" aria-hidden="true" />
          </Link>
        ) : null}

        {activeUser ? (
          <div className={tabClass(visibleTab === 'profile')}>
            <Popover
              label="Fiók"
              side="top"
              align="end"
              active={visibleTab === 'profile'}
              className="flex h-full w-full items-center justify-center"
              trigger={
                <Avatar username={username(activeUser)} seed={activeUser.id} className="h-8" />
              }>
              {renderAccountMenu}
            </Popover>
          </div>
        ) : (
          <Link
            to="/login"
            onPointerDown={() => {
              pressTab('login');
            }}
            aria-label="Bejelentkezés"
            aria-current={visibleTab === 'login' ? 'page' : undefined}
            className={tabClass(visibleTab === 'login')}>
            <ArrowRightEndOnRectangleIcon className="size-6" aria-hidden="true" />
          </Link>
        )}
      </nav>
    </>
  );
}

export default Navbar;
