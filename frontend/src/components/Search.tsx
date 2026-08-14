import { Link, useLocation, useNavigate } from 'react-router-dom';
import type { MouseEvent, PointerEvent } from 'react';
import { flushSync } from 'react-dom';
import { MagnifyingGlassIcon as SearchIcon } from '@heroicons/react/24/solid';
import SearchField from './SearchField';
import { focusSearchInput, useSearchActive } from '~/utils/search';

interface Props {
  to: string;
  forceInactive?: boolean;
}

function Search({ to, forceInactive = false }: Props) {
  const isActive = useSearchActive();
  const location = useLocation();
  const navigate = useNavigate();

  const focusAndNavigate = () => {
    if (location.pathname === to) {
      focusSearchInput();
      return;
    }
    // iOS only renders the keyboard for a focus() that happens during user
    // activation, so the navigation must commit synchronously before focusing
    // the freshly mounted input.
    // eslint-disable-next-line react-dom/no-flush-sync
    flushSync(() => {
      void navigate(to);
    });
    focusSearchInput();
  };

  return (
    <>
      <Link
        to={to}
        onClick={(e: MouseEvent<HTMLAnchorElement>) => {
          e.preventDefault();
          focusAndNavigate();
        }}
        data-active={isActive && !forceInactive ? 'true' : 'false'}
        onPointerDown={(e: PointerEvent<HTMLAnchorElement>) => {
          e.preventDefault();
        }}
        className="flex h-full w-full items-center justify-center sm:hidden">
        <SearchIcon className="size-6.5" />
      </Link>

      <SearchField
        className="hidden sm:flex"
        onFocus={() => {
          if (location.pathname !== to) {
            void navigate(to);
          }
        }}
      />
    </>
  );
}

export default Search;
