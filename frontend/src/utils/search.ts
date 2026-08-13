import { useSyncExternalStore } from 'react';

let searchInput: HTMLInputElement | null = null;
let active = false;
let pendingFocus = false;
let query = '';
const queryListeners = new Set<() => void>();
const stateListeners = new Set<() => void>();

function emit(set: Set<() => void>): void {
  set.forEach((l) => {
    l();
  });
}

export function registerSearchInput(el: HTMLInputElement | null): void {
  searchInput = el;
}

export function focusSearchInput(): void {
  searchInput?.focus();
}

export function requestSearchFocus(): void {
  pendingFocus = true;
  emit(stateListeners);
}

export function consumeSearchFocus(): boolean {
  const shouldFocus = pendingFocus;
  pendingFocus = false;
  return shouldFocus;
}

export function setSearchActive(value: boolean): void {
  if (active === value) return;
  active = value;
  emit(stateListeners);
}

export function useSearchActive(): boolean {
  return useSyncExternalStore(
    (listener) => {
      stateListeners.add(listener);
      return () => {
        stateListeners.delete(listener);
      };
    },
    () => active
  );
}

export function setSearchQuery(value: string): void {
  if (query === value) return;
  query = value;
  emit(queryListeners);
}

export function useSearchQuery(): string {
  return useSyncExternalStore(
    (listener) => {
      queryListeners.add(listener);
      return () => {
        queryListeners.delete(listener);
      };
    },
    () => query
  );
}
