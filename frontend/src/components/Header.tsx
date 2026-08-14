import { useLayoutEffect, useRef, type PointerEvent as ReactPointerEvent } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '~/context/auth';
import Avatar from './ui/Avatar';
import UserMenu from './ui/UserMenu';
import NotificationToggle from './NotificationToggle';
import NavbarLink from './NavbarLink';
import NavbarLinkPill from './NavbarLinkPill';
import Search from './Search';
import { usePopoverOpen } from '~/hooks/usePopoverOpen';
import { setSearchActive, blurSearchInput, useSearchActive } from '~/utils/search';
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

const CHIP_PADDING = 6;

const px = (n: number) => String(n) + 'px';

function preventFocusSteal(e: ReactPointerEvent<HTMLElement>): void {
  e.preventDefault();
}

function Header({ isOnline }: { isOnline: boolean | null }) {
  const { user } = useAuth();
  const searchActive = useSearchActive();
  const location = useLocation();
  const profileOpen = usePopoverOpen('user-menu');
  const mobileNavRef = useRef<HTMLElement | null>(null);
  const chipRef = useRef<HTMLDivElement | null>(null);
  const firstChipRun = useRef(true);
  const offline = isOnline === false;

  useLayoutEffect(() => {
    const nav = mobileNavRef.current;
    const chip = chipRef.current;
    if (!nav || !chip) return;

    const activeEl = nav.querySelector('[data-active="true"]');
    if (!activeEl) {
      chip.style.opacity = '0';
      return;
    }

    const navRect = nav.getBoundingClientRect();
    const elRect = activeEl.getBoundingClientRect();

    chip.style.transition = firstChipRun.current ? 'none' : 'opacity 250ms ease, left 250ms ease';
    firstChipRun.current = false;

    chip.style.opacity = '1';
    chip.style.left = px(elRect.left - navRect.left - CHIP_PADDING);
    chip.style.width = px(elRect.width + CHIP_PADDING * 2);
    chip.style.top = px(elRect.top - navRect.top);
    chip.style.height = px(elRect.height);
  }, [location.pathname, searchActive, profileOpen, user]);

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
            ) : offline ? (
              <Avatar offline username="Guest" />
            ) : (
              <NavbarLink to="/login" name="Bejelentkezés" />
            )}
          </nav>
        </div>
      </header>
      <header
        ref={mobileNavRef}
        className="bg-surface/15 fixed right-5.5 bottom-5.5 left-5.5 z-20 flex h-15 items-center justify-between gap-0.5 rounded-full px-3 py-1.25 inset-shadow-[0_0_2px_1px_#eef0fb22] backdrop-blur-xs sm:hidden">
        <div
          ref={chipRef}
          className="bg-text/20 pointer-events-none absolute rounded-full opacity-0"
        />
        <NavbarLinkPill
          to="/"
          forceInactive={searchActive || profileOpen}
          onClick={() => {
            if (searchActive) {
              setSearchActive(false);
              blurSearchInput();
            }
          }}
          outlineIcon={HomeOutline}
          solidIcon={HomeSolid}
        />
        {user && (
          <NavbarLinkPill
            to="/recipe/new"
            forceInactive={profileOpen}
            outlineIcon={PlusOutline}
            solidIcon={PlusSolid}
          />
        )}

        <Search to="/" forceInactive={profileOpen} />
        {user ? (
          <>
            <div
              onPointerDown={preventFocusSteal}
              className="flex h-full w-full items-center justify-center">
              <NotificationToggle className="flex h-full w-full items-center justify-center brightness-80 hover:brightness-100" />
            </div>
            <div
              data-active={profileOpen ? 'true' : 'false'}
              onPointerDown={preventFocusSteal}
              className="flex h-full w-full items-center justify-center">
              <Avatar
                style={{ anchorName: '--user-menu' }}
                username={user.username}
                popoverTarget="user-menu"
              />
            </div>
          </>
        ) : offline ? (
          <div
            data-active="false"
            onPointerDown={preventFocusSteal}
            className="flex h-full w-full items-center justify-center">
            <Avatar offline username="Guest" />
          </div>
        ) : (
          <NavbarLinkPill
            to="/login"
            forceInactive={profileOpen}
            outlineIcon={UserOutline}
            solidIcon={UserSolid}
          />
        )}
      </header>
      <UserMenu />
    </>
  );
}

export default Header;
