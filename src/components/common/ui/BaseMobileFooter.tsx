import { Grid, Text, UnstyledButton, Stack } from '@mantine/core';
import type React from 'react';
import classes from './BaseMobileFooter.module.css';

export interface BaseMobileFooterItem {
  readonly id: string;
  readonly icon: React.ElementType;
  readonly label: string;
  readonly path?: string;
  readonly disabled?: boolean;
  readonly badge?: React.ReactNode;
}

export interface BaseMobileFooterProps {
  readonly items: readonly BaseMobileFooterItem[];
  readonly activeItemId?: string;
  readonly iconSize?: number;
  readonly className?: string;
  readonly itemClassName?: string;
  readonly activeItemClassName?: string;
  readonly onItemClick?: (item: BaseMobileFooterItem) => void;
}

export function BaseMobileFooter({
  items,
  activeItemId,
  iconSize = 24,
  className,
  itemClassName,
  activeItemClassName,
  onItemClick,
}: BaseMobileFooterProps) {
  // Limit to maximum 4 items for mobile UI
  const displayItems = items.slice(0, 4);

  return (
    <Grid px={0} gutter={0} h="100%" className={className}>
      {displayItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeItemId === item.id;

        return (
          <Grid.Col key={item.id} span={3}>
            <UnstyledButton
              className={`${classes.navItem} ${itemClassName || ''} ${
                isActive ? `${classes.navItemActive} ${activeItemClassName || ''}` : ''
              }`}
              onClick={() => !item.disabled && onItemClick?.(item)}
              w="100%"
              h="100%"
              disabled={item.disabled}
              style={{
                opacity: item.disabled ? 0.5 : 1,
                cursor: item.disabled ? 'not-allowed' : 'pointer',
              }}
            >
              <Stack gap={4} align="center" justify="center" h="100%">
                <Icon size={iconSize} stroke={isActive ? 2.5 : 1.5} className={classes.navIcon} />
                <Text size="xs" fw={isActive ? 600 : 400}>
                  {item.label}
                </Text>
              </Stack>
              {item.badge}
            </UnstyledButton>
          </Grid.Col>
        );
      })}
    </Grid>
  );
}
