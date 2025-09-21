import React from 'react';

import { Group, Stack, Text, type TextProps } from '@mantine/core';

import { getIcon, type IconIdentifier } from '@/utils/iconRegistry';

type InfoFieldProps = {
  readonly label: React.ReactNode;
  readonly value: React.ReactNode;
  readonly icon?: IconIdentifier;
  readonly layout?: 'vertical' | 'horizontal';
  readonly labelProps?: TextProps;
  readonly valueProps?: TextProps;
};

/**
 * A flexible component for displaying label-value pairs with optional icons.
 * Supports both vertical and horizontal layouts.
 *
 * @example
 * // Simple text label and value
 * <InfoField label={t('po.salesPerson')} value={purchaseOrder.salesPerson} />
 *
 * // With icon
 * <InfoField
 *   label={t('po.orderDate')}
 *   icon={IconIdentifiers.CALENDAR}
 *   value={formatDate(purchaseOrder.orderDate)}
 * />
 *
 * // With custom label content
 * <InfoField
 *   label={
 *     <Group gap="xs">
 *       <Text size="xs" fw={500} c="dimmed">{t('po.poNumber')}</Text>
 *       <PODeliveryBadge isInternalDelivery={purchaseOrder.isInternalDelivery} />
 *     </Group>
 *   }
 *   value={purchaseOrder.poNumber}
 *   valueProps={{ fw: 600 }}
 * />
 */
export function InfoField({
  label,
  value,
  icon,
  layout = 'vertical',
  labelProps,
  valueProps,
}: InfoFieldProps) {
  const Icon = icon ? getIcon(icon) : null;

  const renderLabel = () => {
    if (typeof label === 'string') {
      return (
        <Text size="xs" fw={500} c="dimmed" {...labelProps}>
          {label}
        </Text>
      );
    }
    return label;
  };

  const renderValue = () => {
    const content =
      typeof value === 'string' ? (
        <Text size="sm" {...valueProps}>
          {value || '-'}
        </Text>
      ) : (
        value || <Text size="sm">-</Text>
      );

    if (Icon) {
      return (
        <Group gap="xs">
          <Icon size={14} color="var(--mantine-color-gray-6)" />
          {content}
        </Group>
      );
    }

    return content;
  };

  if (layout === 'horizontal') {
    return (
      <Group gap="xs">
        {renderLabel()}
        {renderValue()}
      </Group>
    );
  }

  return (
    <Stack gap={0}>
      {renderLabel()}
      {renderValue()}
    </Stack>
  );
}
