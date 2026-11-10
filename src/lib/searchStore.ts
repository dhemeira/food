import { useSyncExternalStore } from 'react';

interface SearchState {
  input: HTMLInputElement | null;
  query: string;
  focused: boolean;
  focusRequested: boolean;
}

let state: SearchState = { input: null, query: '', focused: false, focusRequested: false };
const listeners = new Set<() => void>();

function setState(patch: Partial<SearchState>): void {
  state = { ...state, ...patch };
  listeners.forEach((listener) => {
    listener();
  });
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Register the mounted home search input (called on mount and unmount). */
export function registerSearchInput(input: HTMLInputElement | null): void {
  setState({ input });
  if (input && state.focusRequested) {
    setState({ focusRequested: false });
    requestAnimationFrame(() => {
      input.focus();
    });
  }
}

/** Set the search query (from the home search field). */
export function setSearchQuery(query: string): void {
  setState({ query });
}

/** Report search input focus changes (wire to onFocus/onBlur). */
export function setSearchFocused(focused: boolean): void {
  setState({ focused });
}

/**
 * Focus the home search field. Call after navigating home if needed.
 * Marks search active immediately so the pill can move straight to the
 * search button without first stopping on Home.
 */
export function requestSearchFocus(): void {
  setState({ focused: true });
  if (state.input) {
    state.input.focus();
  } else {
    setState({ focusRequested: true });
  }
}

/** Clear the query and unfocus (used by the Home tab). */
export function clearSearch(): void {
  setState({ query: '', focused: false, focusRequested: false });
  if (state.input) {
    state.input.blur();
  }
}

/**
 * Unfocus the search field without clearing the query. Used when navigating
 * to another tab (e.g. New, Daily menu) so the pill/keyboard leaves search
 * but the typed query is preserved.
 */
export function dismissSearch(): void {
  setState({ focused: false, focusRequested: false });
  if (state.input) {
    state.input.blur();
  }
}

/** Reactive: the current search query. */
export function useSearchQuery(): string {
  return useSyncExternalStore(subscribe, () => state.query);
}

/** Reactive: whether the home search field is currently focused. */
export function useSearchFocused(): boolean {
  return useSyncExternalStore(subscribe, () => state.focused);
}
