import { useState } from 'react';

export const VIEW_MODE = {
  TABLE: 'table',
  GRID: 'grid',
} as const;
export type ViewModeType = (typeof VIEW_MODE)[keyof typeof VIEW_MODE];

export function useViewMode() {
  const [viewMode, setViewMode] = useState<ViewModeType>(VIEW_MODE.TABLE);
  const toggleViewMode = () => {
    setViewMode((prev) => (prev === VIEW_MODE.TABLE ? VIEW_MODE.GRID : VIEW_MODE.TABLE));
  };
  return { viewMode, setViewMode, toggleViewMode, isTableView: viewMode === VIEW_MODE.TABLE };
}
