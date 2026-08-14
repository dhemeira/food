import { useSyncExternalStore } from 'react';

type Listener = () => void;

interface Store<T> {
  getSnapshot: () => T;
  setValue: (value: T) => void;
  subscribe: (listener: Listener) => () => void;
}

function createStore<T>(initialValue: T): Store<T> {
  let value = initialValue;
  const listeners = new Set<Listener>();

  return {
    getSnapshot: () => value,
    setValue: (next) => {
      if (value === next) return;
      value = next;
      listeners.forEach((listener) => {
        listener();
      });
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

const queryStore = createStore('');
const activeStore = createStore(false);

export const setSearchQuery = queryStore.setValue;

export function useSearchQuery(): string {
  return useSyncExternalStore(queryStore.subscribe, queryStore.getSnapshot);
}

export const setSearchActive = activeStore.setValue;

export function useSearchActive(): boolean {
  return useSyncExternalStore(activeStore.subscribe, activeStore.getSnapshot);
}

// Imperative handle to the mobile search input. The header's search pill
// focuses/blurs it programmatically from outside the tree that owns the input.
let searchInput: HTMLInputElement | null = null;

export function registerSearchInput(el: HTMLInputElement | null): void {
  searchInput = el;
}

export function focusSearchInput(): void {
  searchInput?.focus();
}

export function blurSearchInput(): void {
  searchInput?.blur();
}
