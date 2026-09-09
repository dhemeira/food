import { useEffect, useRef } from 'react';
import {
  registerSearchInput,
  setSearchFocused,
  setSearchQuery,
  useSearchQuery,
} from '~/lib/searchStore';

function Search() {
  const query = useSearchQuery();
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    registerSearchInput(inputRef.current);
    return () => {
      registerSearchInput(null);
      setSearchFocused(false);
    };
  }, []);

  return (
    <input
      ref={inputRef}
      type="search"
      value={query}
      placeholder="Keresés…"
      onChange={(event) => {
        setSearchQuery(event.target.value);
      }}
      onFocus={() => {
        setSearchFocused(true);
      }}
      onBlur={(event) => {
        // If focus moved to a nav control (a tab is being tapped), don't clear
        // search-active yet: the navigation/action will clear it, so the pill
        // moves straight to the destination instead of stopping on Home.
        const next = event.relatedTarget;
        if (next instanceof Element && next.closest('nav, header')) return;
        setSearchFocused(false);
      }}
    />
  );
}

export default Search;
