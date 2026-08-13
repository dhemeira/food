import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useRef, type MouseEvent } from 'react';
import { MagnifyingGlassIcon as SearchIcon } from '@heroicons/react/24/solid';
import {
  consumeSearchFocus,
  focusSearchInput,
  requestSearchFocus,
  setSearchActive,
  setSearchQuery,
  useSearchActive,
  useSearchQuery,
} from '~/utils/search';

interface Props {
  to: string;
}

function Search({ to }: Props) {
  const isActive = useSearchActive();
  const query = useSearchQuery();
  const location = useLocation();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (consumeSearchFocus()) {
      inputRef.current?.focus();
    }
  }, []);

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (location.pathname === to) {
      focusSearchInput();
      e.preventDefault();
    }
  };

  const handleFocus = () => {
    setSearchActive(true);
    if (location.pathname !== to) {
      requestSearchFocus();
      void navigate(to);
    }
  };

  return (
    <>
      <Link
        to={to}
        onClick={handleClick}
        className="relative flex h-full w-full items-center justify-center sm:hidden">
        <div
          className={
            (isActive ? 'bg-text/20 absolute -inset-x-1.5 inset-y-0 ' : '') +
            'flex items-center justify-center rounded-full'
          }>
          <SearchIcon className="size-6.5" />
        </div>
      </Link>

      <div className="bg-surface has-focus:bg-text/20 relative hidden items-center gap-1.5 rounded-full px-4 py-1.5 brightness-80 has-focus:brightness-100 sm:flex">
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => {
            setSearchQuery(e.target.value);
          }}
          onFocus={handleFocus}
          onBlur={() => {
            setSearchActive(false);
          }}
          placeholder="Keresés"
          className="text-text placeholder:text-text/50 w-40 bg-transparent outline-none"
        />
        <SearchIcon className="text-text/50 size-4" />
      </div>
    </>
  );
}

export default Search;
