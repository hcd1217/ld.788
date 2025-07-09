import {lazy, Suspense, useMemo} from 'react';
import {Loader} from '@mantine/core';
import type {Icon as TablerIcon} from '@tabler/icons-react';

type LazyIconProps = {
  readonly name: string;
  readonly size?: number;
  readonly stroke?: number;
  readonly color?: string;
  readonly fallback?: React.ReactNode;
};

const iconCache = new Map<string, React.LazyExoticComponent<TablerIcon>>();

const createLazyIcon = (
  iconName: string,
): React.LazyExoticComponent<TablerIcon> => {
  if (iconCache.has(iconName)) {
    return iconCache.get(iconName)!;
  }

  const LazyIconComponent = lazy(async () => {
    try {
      const iconModule = await import('@tabler/icons-react');
      const IconComponent = iconModule[
        iconName as keyof typeof iconModule
      ] as TablerIcon;

      if (!IconComponent) {
        throw new Error(`Icon ${iconName} not found`);
      }

      return {default: IconComponent};
    } catch (error) {
      console.warn(`Failed to load icon ${iconName}:`, error);
      const {IconQuestionMark} = await import('@tabler/icons-react');
      return {default: IconQuestionMark};
    }
  });

  iconCache.set(iconName, LazyIconComponent);
  return LazyIconComponent;
};

export function LazyIcon({
  name,
  size = 16,
  stroke = 1.5,
  color,
  fallback,
}: LazyIconProps) {
  const defaultFallback = <Loader size={size} />;
  const IconComponent = useMemo(() => createLazyIcon(name), [name]);

  return (
    <Suspense fallback={fallback || defaultFallback}>
      <IconComponent size={size} stroke={stroke} color={color} />
    </Suspense>
  );
}
