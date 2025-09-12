import { useMemo } from 'react';

import { Button, SimpleGrid } from '@mantine/core';

import { Drawer } from '@/components/common';

export type SelectionItem<T = string> = {
  readonly id: T;
  readonly label: string;
};

type SelectionDrawerProps<T = string> = {
  readonly opened: boolean;
  readonly title: string;
  readonly items: readonly SelectionItem<T>[];
  readonly selectedId?: T;
  readonly onClose: () => void;
  readonly onSelect: (id?: T) => void;
  readonly showAllOption?: boolean;
  readonly allOptionLabel?: string;
};

export function SelectionDrawer<T = string>({
  opened,
  title,
  items,
  selectedId,
  onClose,
  onSelect,
  showAllOption = true,
  allOptionLabel = 'All',
}: SelectionDrawerProps<T>) {
  const handleSelect = (id?: T) => {
    onSelect(id);
    onClose();
  };

  // Calculate drawer height based on number of items
  const drawerHeight = useMemo(() => {
    const itemCount = items.length + (showAllOption ? 1 : 0);
    const rows = Math.ceil(itemCount / 2);
    const buttonHeight = 36;
    const gapHeight = 8;
    const padding = 32;
    const headerHeight = 60;
    const calculatedHeight = headerHeight + padding + rows * buttonHeight + (rows - 1) * gapHeight;
    return `${Math.min(calculatedHeight, 400)}px`; // Max height 400px
  }, [items.length, showAllOption]);

  return (
    <Drawer opened={opened} size={drawerHeight} title={title} onClose={onClose}>
      <SimpleGrid cols={2} spacing="xs">
        {showAllOption && (
          <Button
            variant={!selectedId ? 'filled' : 'light'}
            onClick={() => handleSelect(undefined)}
          >
            {allOptionLabel}
          </Button>
        )}
        {items.map((item) => (
          <Button
            key={String(item.id)}
            variant={selectedId === item.id ? 'filled' : 'light'}
            onClick={() => handleSelect(item.id)}
          >
            {item.label}
          </Button>
        ))}
      </SimpleGrid>
    </Drawer>
  );
}
