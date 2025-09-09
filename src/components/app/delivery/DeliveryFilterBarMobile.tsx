import { Stack, Group, Button } from '@mantine/core';
import { IconChevronDown, IconClearAll, IconCalendar } from '@tabler/icons-react';
import { useTranslation } from '@/hooks/useTranslation';
import { SearchBar } from '@/components/common';
import type { DeliveryStatusType } from '@/constants/deliveryRequest';

interface DeliveryFilterBarMobileProps {
  readonly searchQuery: string;
  readonly selectedStatuses: DeliveryStatusType[];
  readonly hasDateFilter: boolean;
  readonly quickAction?: string;
  readonly hasActiveFilters: boolean;
  readonly onSearchChange: (query: string) => void;
  readonly onQuickActionsClick: () => void;
  readonly onStatusClick: () => void;
  readonly onClearFilters: () => void;
}

export function DeliveryFilterBarMobile({
  searchQuery,
  selectedStatuses,
  hasDateFilter,
  quickAction,
  hasActiveFilters,
  onSearchChange,
  onQuickActionsClick,
  onStatusClick,
  onClearFilters,
}: DeliveryFilterBarMobileProps) {
  const { t } = useTranslation();

  const getStatusLabel = () => {
    if (selectedStatuses.length === 0) {
      return t('delivery.filters.allStatus');
    }
    if (selectedStatuses.length === 1) {
      const statusKey = `delivery.status.${selectedStatuses[0].toLowerCase()}` as any;
      return t(statusKey);
    }
    return `${t('delivery.status')} (${selectedStatuses.length})`;
  };

  const getQuickActionLabel = () => {
    if (quickAction) {
      return quickAction;
    }
    return hasDateFilter
      ? `${t('delivery.quickActions.title')} (1)`
      : t('delivery.quickActions.title');
  };

  return (
    <Stack p="sm" gap="sm" style={{ borderBottom: '1px solid var(--mantine-color-gray-3)' }}>
      {/* Search Input for Delivery Number */}
      <SearchBar
        placeholder={t('delivery.filters.searchPlaceholder')}
        searchQuery={searchQuery}
        setSearchQuery={onSearchChange}
      />

      {/* Filter Buttons */}
      <Group gap="xs">
        <Button
          size="xs"
          variant={hasDateFilter || quickAction ? 'filled' : 'light'}
          rightSection={<IconCalendar size={16} />}
          onClick={onQuickActionsClick}
          style={{ flex: 1 }}
        >
          {getQuickActionLabel()}
        </Button>

        <Button
          size="xs"
          variant={selectedStatuses.length > 0 ? 'filled' : 'light'}
          rightSection={<IconChevronDown size={16} />}
          onClick={onStatusClick}
          style={{ flex: 1 }}
        >
          {getStatusLabel()}
        </Button>

        <Button
          size="xs"
          variant="subtle"
          color="red"
          disabled={!hasActiveFilters}
          onClick={onClearFilters}
          leftSection={<IconClearAll size={16} color="var(--mantine-color-red-6)" />}
        >
          {t('common.clear')}
        </Button>
      </Group>
    </Stack>
  );
}
