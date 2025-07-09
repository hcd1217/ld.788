import {useCallback, useEffect, useRef} from 'react';

export function useFocusManagement(autoFocusSelector?: string, delay = 300) {
  const cleanupRef = useRef<(() => void) | undefined>(null);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(null);

  // Optimized focus function that uses querySelector once
  const focusElement = useCallback((selector: string) => {
    const element = document.querySelector<HTMLInputElement>(selector);
    if (element && typeof element.focus === 'function') {
      element.focus();
    }
  }, []);

  // Memoized auto-focus effect
  const setupAutoFocus = useCallback(() => {
    if (!autoFocusSelector) return;

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set up delayed focus
    timeoutRef.current = setTimeout(() => {
      focusElement(autoFocusSelector);
    }, delay);

    // Store cleanup function
    cleanupRef.current = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [autoFocusSelector, delay, focusElement]);

  // Setup auto-focus on mount
  useEffect(() => {
    setupAutoFocus();
    return () => {
      cleanupRef.current?.();
    };
  }, [setupAutoFocus]);

  // Manual focus function for programmatic use
  const manualFocus = useCallback(
    (selector: string) => {
      focusElement(selector);
    },
    [focusElement],
  );

  return {
    manualFocus,
    cleanup: cleanupRef.current,
  };
}
