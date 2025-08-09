import { createContext } from 'react';

export interface ThemeContextValue {
  themeName: string;
  setThemeName: (name: string) => void;
  isTransitioning: boolean;
}

export const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);
