import {Group, Text, Stack, ActionIcon, Button} from '@mantine/core';
import {
  IconMapPin,
  IconClock,
  IconPhone,
  IconEdit,
  IconTrash,
} from '@tabler/icons-react';
import {useTranslation} from '@/hooks/useTranslation';
import {SelectableCard} from '@/components/common';
import type {Store} from '@/lib/api/schemas/store.schemas';

export interface StoreCardProps {
  readonly store: Store;
  readonly isSelected: boolean;
  readonly onSelect: (store: Store) => void;
  readonly onEdit: (store: Store) => void;
  readonly onDelete: (store: Store) => void;
  readonly formatOperatingHours: () => string;
}

export function StoreCard({
  store,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  formatOperatingHours,
}: StoreCardProps) {
  const {t} = useTranslation();

  return (
    <SelectableCard
      isSelected={isSelected}
      style={{position: 'relative'}}
      onClick={() => {
        onSelect(store);
      }}
    >
      {/* Action buttons positioned absolutely in top right */}
      <Group
        gap="xs"
        style={{
          position: 'absolute',
          top: 8,
          right: 8,
          zIndex: 1,
        }}
      >
        <ActionIcon
          variant="light"
          size="sm"
          title={t('store.editStoreTooltip')}
          onClick={(e) => {
            e.stopPropagation();
            onEdit(store);
          }}
        >
          <IconEdit size={14} />
        </ActionIcon>
        <ActionIcon
          color="red"
          variant="light"
          size="sm"
          title={t('store.deleteStoreTooltip')}
          onClick={(e) => {
            e.stopPropagation();
            onDelete(store);
          }}
        >
          <IconTrash size={14} />
        </ActionIcon>
      </Group>

      <Stack gap="md">
        <Stack gap={4} pr={80}>
          {' '}
          {/* Add padding-right to prevent overlap with action buttons */}
          <Group gap="xs">
            <Text fw={700} size="lg">
              {store.name}
            </Text>
            <Text size="sm" c="dimmed">
              ({store.code})
            </Text>
          </Group>
          <Group gap="xs" c="dimmed">
            <IconMapPin size={14} />
            <Text
              size="sm"
              maw={250}
              lineClamp={2}
              style={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {store.address}, {store.city}
              {store.state ? `, ${store.state}` : ''}, {store.country}
            </Text>
          </Group>
          {store.phoneNumber ? (
            <Group gap="xs" c="dimmed">
              <IconPhone size={14} />
              <Text size="sm">{store.phoneNumber}</Text>
            </Group>
          ) : null}
          <Group gap="xs" c="dimmed">
            <IconClock size={14} />
            <Text size="sm">{formatOperatingHours()}</Text>
          </Group>
        </Stack>

        <Group
          justify="space-between"
          pt="md"
          style={{borderTop: '1px solid var(--mantine-color-gray-3)'}}
        >
          <Text size="xs" c="dimmed">
            {t('common.created')}{' '}
            {new Date(store.createdAt).toLocaleDateString()}
          </Text>

          {!isSelected && (
            <Button
              opacity={0}
              size="xs"
              variant="light"
              onClick={() => {
                onSelect(store);
              }}
            >
              {t('store.selectStore')}
            </Button>
          )}
        </Group>
      </Stack>
    </SelectableCard>
  );
}
