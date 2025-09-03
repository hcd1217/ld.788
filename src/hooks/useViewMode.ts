import { useCallback, useEffect, useState } from 'react';

export const VIEW_MODE = {
  TABLE: 'table',
  GRID: 'grid',
} as const;
export type ViewModeType = (typeof VIEW_MODE)[keyof typeof VIEW_MODE];

export function useViewMode(key = 'DEFAULT') {
  const [viewMode, setViewMode] = useState<ViewModeType>(loadViewModeFromLocalStorage(key));

  useEffect(() => {
    setViewMode((prev) => {
      console.log('loadViewModeFromLocalStorage', key);
      const viewMode = loadViewModeFromLocalStorage(key);
      if (prev === viewMode) return prev;
      return viewMode;
    });
  }, [key]);

  useEffect(() => {
    saveViewModeToLocalStorage(viewMode, key);
  }, [viewMode, key]);

  const toggleViewMode = useCallback(() => {
    setViewMode((prev) => {
      return prev === VIEW_MODE.TABLE ? VIEW_MODE.GRID : VIEW_MODE.TABLE;
    });
  }, []);

  return { viewMode, setViewMode, toggleViewMode, isTableView: viewMode === VIEW_MODE.TABLE };
}

function getStorageKey(key = 'DEFAULT') {
  return `__VIEW_MODE_${key}__`.toLocaleUpperCase();
}

function loadViewModeFromLocalStorage(key = 'DEFAULT'): ViewModeType {
  const viewMode = localStorage.getItem(getStorageKey(key)) as ViewModeType | undefined;
  if (viewMode && Object.values(VIEW_MODE).includes(viewMode)) {
    return viewMode;
  }
  return VIEW_MODE.TABLE;
}

function saveViewModeToLocalStorage(viewMode: ViewModeType, key = 'DEFAULT') {
  localStorage.setItem(getStorageKey(key), viewMode);
}
