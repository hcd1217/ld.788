import { type ReactNode, useEffect, useMemo, useState } from 'react';

import { LoadingOverlay, MantineProvider } from '@mantine/core';
import { useLocalStorage } from '@mantine/hooks';

import { ThemeContext } from '@/contexts/ThemeContext';
import { getMantineTheme, getResolver } from '@/theme';

interface ThemeProviderProps {
  readonly children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [themeName, setThemeName] = useLocalStorage<string>({
    key: '__CUSTOM_MANTINE_THEME__',
    defaultValue: 'elegant',
  });
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [pendingTheme, setPendingTheme] = useState<string | null>(null);

  // Handle theme transition with loading state
  useEffect(() => {
    if (pendingTheme && pendingTheme !== themeName) {
      setIsTransitioning(true);

      // Delay to show loading overlay before theme change
      const timer = setTimeout(() => {
        setThemeName(pendingTheme);
        setPendingTheme(null);

        // Hide loading overlay after theme is applied
        setTimeout(() => {
          setIsTransitioning(false);
        }, 500);
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [pendingTheme, setThemeName, themeName]);

  const theme = useMemo(() => getMantineTheme(themeName), [themeName]);
  const resolver = useMemo(() => getResolver(themeName), [themeName]);

  const value = useMemo(
    () => ({
      themeName,
      setThemeName: setPendingTheme, // Use pending theme setter
      isTransitioning,
    }),
    [themeName, isTransitioning],
  );

  return (
    <ThemeContext.Provider value={value}>
      <MantineProvider theme={theme} defaultColorScheme="light" cssVariablesResolver={resolver}>
        <LoadingOverlay
          visible={isTransitioning}
          overlayProps={{
            blur: 2,
            opacity: 0.8, // Increased opacity for more prominent overlay
          }}
          bg="gray.1"
          loaderProps={{ size: 'xl', color: 'gray' }}
          pos="fixed"
          style={{ zIndex: 9999 }}
        />
        {children}
      </MantineProvider>
    </ThemeContext.Provider>
  );
}
