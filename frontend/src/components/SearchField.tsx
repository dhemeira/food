import { useLayoutEffect, useRef } from 'react';
import { MagnifyingGlassIcon as SearchIcon } from '@heroicons/react/24/solid';
import {
  registerSearchInput,
  setSearchActive,
  setSearchQuery,
  useSearchQuery,
} from '~/utils/search';

interface SearchFieldProps {
  className?: string;
  placeholder?: string;
  autoComplete?: 'off' | 'on';
  registerInput?: boolean;
  onFocus?: () => void;
}

function SearchField({
  className = '',
  placeholder = 'Keresés',
  autoComplete = 'off',
  registerInput = false,
  onFocus,
}: SearchFieldProps) {
  const query = useSearchQuery();
  const inputRef = useRef<HTMLInputElement>(null);

  useLayoutEffect(() => {
    if (!registerInput) return;

    registerSearchInput(inputRef.current);

    return () => {
      registerSearchInput(null);
      setSearchActive(false);
    };
  }, [registerInput]);

  return (
    <div
      className={`bg-surface has-focus:bg-text/20 relative flex items-center gap-1.5 rounded-full px-4 py-1.5 brightness-80 has-focus:brightness-100 ${className}`}>
      <SearchIcon className="text-text/50 size-4" />
      <input
        ref={inputRef}
        type="search"
        value={query}
        onChange={(e) => {
          setSearchQuery(e.target.value);
        }}
        onFocus={() => {
          setSearchActive(true);
          onFocus?.();
        }}
        onBlur={() => {
          setSearchActive(false);
        }}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="text-text placeholder:text-text/50 w-full bg-transparent outline-none"
      />
    </div>
  );
}

export default SearchField;
