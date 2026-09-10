import { useEffect, useRef } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { MagnifyingGlassIcon } from '@heroicons/react/24/solid';
import {
  registerSearchInput,
  setSearchFocused,
  setSearchQuery,
  useSearchQuery,
} from '~/lib/searchStore';

interface SearchProps {
  /**
   * Register this input as the one the mobile tab bar focuses. Only the field
   * that is actually visible when search is requested should register, so the
   * desktop and mobile fields don't fight over a single slot.
   */
  register?: boolean;
  /** Called when the field gains focus, e.g. to navigate to the home route. */
  onFocus?: () => void;
}

function Search({ register = false, onFocus }: SearchProps) {
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
    <div className="bg-surface-2 sm:bg-background has-focus:bg-text/20 relative flex items-center rounded-full brightness-80 has-focus:brightness-100">
      <MagnifyingGlassIcon
        className="text-text/50 pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2"
        aria-hidden="true"
      />
      {/* Padding lives on the input so the whole pill is one native focus
          target — iOS opens the keyboard for a tap anywhere inside it. */}
      <input
        ref={inputRef}
        type="search"
        value={query}
        placeholder="Keresés…"
        enterKeyHint="search"
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
          'text-text placeholder:text-text/50 bg-transparent py-2.5 pr-9 pl-10 transition-all outline-none sm:hover:w-60 sm:focus:w-60 [&::-webkit-search-cancel-button]:hidden' +
          (query ? ' w-60' : ' w-34')
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
          className="text-text/45 hover:text-text absolute top-0 right-3 bottom-0 flex aspect-square items-center justify-center">
          <XMarkIcon className="size-4" aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
}

export default Search;
