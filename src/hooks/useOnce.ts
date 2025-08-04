import { useEffect, useRef } from 'react';

/**
 * Custom hook that runs a handler function only once when the component mounts.
 * This is useful for initialization logic that should only run once.
 *
 * @param handler - The function to run once on mount
 */
export function useOnce(handler: () => void | Promise<void>): void {
  const hasRun = useRef(false);

  useEffect(() => {
    if (!hasRun.current) {
      hasRun.current = true;
      void handler();
    }
  }, [handler]);
}
