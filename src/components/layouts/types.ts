import type React from 'react';

export interface NavigationItem {
  id: string; // Made required and must be string for consistency
  label: string;
  icon: React.ElementType;
  activePaths?: string[];
  path?: string;
  hidden?: boolean;
  subs?: NavigationItem[];
}
