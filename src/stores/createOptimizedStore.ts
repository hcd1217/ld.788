// Optimized Zustand store creator for better tree shaking
import {create} from 'zustand';
import {devtools, subscribeWithSelector} from 'zustand/middleware';

// Type helpers for better store creation
export type StoreCreator<T> = (
  set: (partial: Partial<T>) => void,
  get: () => T,
) => T;

// Optimized store creation function
export function createOptimizedStore<T>(
  storeCreator: StoreCreator<T>,
  options: {
    name: string;
    enableDevtools?: boolean;
    enableSubscriptions?: boolean;
  },
) {
  const {name, enableDevtools = false, enableSubscriptions = false} = options;

  // Only add devtools in development
  if (enableDevtools && import.meta.env.DEV) {
    return create<T>()(
      devtools(storeCreator, {
        name,
      }),
    );
  }

  // Only add subscriptions if needed
  if (enableSubscriptions) {
    return create<T>()(
      subscribeWithSelector(
        enableDevtools && import.meta.env.DEV
          ? devtools(storeCreator, {name})
          : storeCreator,
      ),
    );
  }

  return create<T>(storeCreator);
}

// Selector utilities for better performance
export const storeSelectors = {
  // Only re-render when specific field changes
  field:
    <T, K extends keyof T>(key: K) =>
    (state: T): T[K] =>
      state[key],

  // Only re-render when multiple fields change
  fields:
    <T, K extends keyof T>(keys: K[]) =>
    (state: T): Pick<T, K> => {
      const result: Pick<T, K> = Object.create(null);
      for (const key of keys) {
        result[key] = state[key];
      }

      return result;
    },

  // Only re-render when computed value changes
  computed: <T, R>(fn: (state: T) => R) => fn,

  // Shallow equality check for objects
  shallow<T>(a: T, b: T): boolean {
    if (a === b) return true;
    if (typeof a !== 'object' || typeof b !== 'object') return false;
    if (a === null || b === null) return false;

    const keysA = Object.keys(a);
    const keysB = Object.keys(b);

    if (keysA.length !== keysB.length) return false;

    for (const key of keysA) {
      if (!(key in b)) return false;
      if ((a as any)[key] !== (b as any)[key]) return false;
    }

    return true;
  },
};
