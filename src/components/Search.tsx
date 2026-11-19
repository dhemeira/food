import { useEffect, useRef } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { MagnifyingGlassIcon } from '@heroicons/react/24/solid';
import {
  registerSearchInput,
  setSearchFocused,
  setSearchQuery,
  useSearchQuery,
} from '~/lib/searchStore';

type SearchVariant = 'page' | 'nav';

interface SearchProps {
  /**
   * Register this input as the one the mobile tab bar focuses. Only the field
   * that is actually visible when search is requested should register, so the
   * desktop and mobile fields don't fight over a single slot.
   */
  register?: boolean;
  /** Called when the field gains focus, e.g. to navigate to the home route. */
  onFocus?: () => void;
  variant?: SearchVariant;
  placeholder?: string;
}

const ROOT_CLASS: Record<SearchVariant, string> = {
  page:
    'relative mt-4 flex h-12 w-full max-w-[440px] items-center rounded-full border border-border ' +
    'bg-surface transition-colors hover:border-border-hover focus-within:border-accent ' +
    'focus-within:bg-surface-2 focus-within:ring-[3px] focus-within:ring-accent-soft',
  nav:
    'relative flex h-[38px] w-34 min-w-0 items-center rounded-full border border-border bg-surface ' +
    'transition-[width,background-color,border-color] duration-200 hover:w-60 ' +
    'hover:border-border-hover hover:bg-surface-2 focus-within:w-60 ' +
    'focus-within:border-border-hover focus-within:bg-surface-2',
};

const INPUT_CLASS: Record<SearchVariant, string> = {
  // 16px keeps iOS Safari from zooming the page when the field is focused.
  page: 'h-full w-full min-w-0 rounded-full bg-transparent pr-4 pl-10 text-base',
  nav: 'h-full w-full min-w-0 rounded-full bg-transparent pr-4 pl-10 text-base',
};

function Search({
  register = false,
  onFocus,
  variant = 'page',
  placeholder = 'Keresés…',
}: SearchProps) {
  const query = useSearchQuery();
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!register) return;

    registerSearchInput(inputRef.current);
    return () => {
      registerSearchInput(null);
      setSearchFocused(false);
    };
  }, [register]);

  return (
    <div className={ROOT_CLASS[variant]}>
      <MagnifyingGlassIcon
        className="text-text-muted pointer-events-none absolute top-1/2 left-[13px] size-4 -translate-y-1/2"
        aria-hidden="true"
      />
      {/* Padding lives on the input so the whole pill is one native focus
          target — iOS opens the keyboard for a tap anywhere inside it. */}
      <input
        ref={inputRef}
        type="search"
        value={query}
        placeholder={placeholder}
        enterKeyHint="search"
        aria-label="Keresés a receptek között"
        onChange={(event) => {
          setSearchQuery(event.target.value);
        }}
        onKeyDown={(event) => {
          // Dismiss the on-screen keyboard on mobile when the user submits.
          if (event.key === 'Enter') event.currentTarget.blur();
        }}
        onFocus={() => {
          setSearchFocused(true);
          onFocus?.();
        }}
        onBlur={(event) => {
          // If focus moved to a nav control (a tab is being tapped), don't clear
          // search-active yet: the navigation/action will clear it, so the pill
          // moves straight to the destination instead of stopping on Home.
          const next = event.relatedTarget;
          if (next instanceof Element && next.closest('nav, header')) return;
          setSearchFocused(false);
        }}
        className={
          INPUT_CLASS[variant] +
          ' text-text placeholder:text-text-faint outline-none [&::-webkit-search-cancel-button]:hidden'
        }
      />
      {query ? (
        <button
          type="button"
          aria-label="Keresés törlése"
          onPointerDown={(event) => {
            // Keep focus in the input while clearing it.
            event.preventDefault();
          }}
          onClick={() => {
            setSearchQuery('');
            inputRef.current?.focus();
          }}
          className="text-text-muted hover:text-text absolute top-1/2 right-3 grid size-6 -translate-y-1/2 place-items-center rounded-full">
          <XMarkIcon className="size-4" aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
}

export default Search;
