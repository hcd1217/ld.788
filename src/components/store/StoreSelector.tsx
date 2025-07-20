import {Select, Text, Group, Box} from '@mantine/core';
import {IconBuildingStore, IconChevronDown} from '@tabler/icons-react';
import {useTranslation} from '@/hooks/useTranslation';
import {
  useCurrentStore,
  useStores,
  useStoreActions,
} from '@/stores/useStoreConfigStore';
import type {Store} from '@/lib/api/schemas/store.schemas';

type StoreSelectorProps = {
  readonly placeholder?: string;
  readonly disabled?: boolean;
  readonly size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  readonly variant?: 'default' | 'filled' | 'unstyled';
};

export function StoreSelector({
  placeholder,
  disabled = false,
  size = 'sm',
  variant = 'default',
}: StoreSelectorProps) {
  const {t} = useTranslation();
  const currentStore = useCurrentStore();
  const stores = useStores();
  const {setCurrentStore} = useStoreActions();

  const defaultPlaceholder = placeholder || t('store.selectAStore');

  const storeOptions = stores.map((store) => ({
    value: store.id,
    label: store.name,
  }));

  const handleStoreChange = (storeId: string | undefined) => {
    if (storeId) {
      const selectedStore = stores.find((store) => store.id === storeId);
      setCurrentStore(selectedStore);
    } else {
      setCurrentStore(undefined);
    }
  };

  const renderSelectOption = (store: Store) => (
    <Group gap="sm" wrap="nowrap">
      <IconBuildingStore size={16} />
      <Box style={{flex: 1}}>
        <Text size="sm" fw={500}>
          {store.name}
        </Text>
        <Text truncate size="xs" c="dimmed">
          {store.address}
        </Text>
      </Box>
    </Group>
  );

  if (stores.length === 0) {
    return (
      <Select
        disabled
        placeholder={t('store.noStoresAvailable')}
        data={[]}
        size={size}
        variant={variant}
        leftSection={<IconBuildingStore size={16} />}
        rightSection={<IconChevronDown size={16} />}
      />
    );
  }

  if (stores.length === 1) {
    return (
      <Select
        disabled
        value={stores[0].id}
        data={storeOptions}
        size={size}
        variant={variant}
        leftSection={<IconBuildingStore size={16} />}
        rightSection={<IconChevronDown size={16} />}
        renderOption={({option}) => {
          const store = stores.find((s) => s.id === option.value);
          return store ? renderSelectOption(store) : option.label;
        }}
      />
    );
  }

  return (
    <Select
      searchable
      clearable
      placeholder={defaultPlaceholder}
      value={currentStore?.id || null}
      data={storeOptions}
      disabled={disabled}
      size={size}
      variant={variant}
      leftSection={<IconBuildingStore size={16} />}
      rightSection={<IconChevronDown size={16} />}
      maxDropdownHeight={300}
      renderOption={({option}) => {
        const store = stores.find((s) => s.id === option.value);
        return store ? renderSelectOption(store) : option.label;
      }}
      onChange={(value) => {
        handleStoreChange(value ?? undefined);
      }}
    />
  );
}
