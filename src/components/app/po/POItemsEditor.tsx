import { useState, useCallback, useMemo } from 'react';
import {
  Table,
  TextInput,
  NumberInput,
  ActionIcon,
  Button,
  Box,
  Group,
  Stack,
  Card,
  Title,
  Text,
  Autocomplete,
} from '@mantine/core';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useDeviceType } from '@/hooks/useDeviceType';
import { showErrorNotification } from '@/utils/notifications';
import type { POItem } from '@/lib/api/schemas/sales.schemas';
import { createPOItem } from '@/utils/poItemUtils';
import { useAppStore } from '@/stores/useAppStore';

type POItemsEditorProps = {
  readonly items: POItem[];
  readonly onChange: (items: POItem[]) => void;
  readonly isReadOnly?: boolean;
};

export function POItemsEditor({ items, onChange, isReadOnly = false }: POItemsEditorProps) {
  const { t } = useTranslation();
  const { isMobile } = useDeviceType();
  const [productSearch, setProductSearch] = useState('');
  const { overviewData } = useAppStore();

  const [newItem, setNewItem] = useState<Partial<POItem>>({
    productCode: '',
    description: '',
    quantity: 1,
    category: '',
  });

  // Generate autocomplete data from products with search filter
  const productOptions = useMemo(() => {
    // For Mantine Autocomplete, we need to return an array of strings
    // We'll create a map to look up products by their display label
    return overviewData?.products.map((p) => `${p.code} - ${p.name}`) || [];
  }, [overviewData]);

  const handleAddItem = useCallback(() => {
    const result = createPOItem(newItem, items);

    if (result.error) {
      showErrorNotification(t('common.error'), result.error);
      return null;
    }

    if (result.item) {
      onChange([...items, result.item]);

      // Reset form
      setNewItem({
        productCode: '',
        description: '',
        quantity: 1,
        category: '',
      });
      setProductSearch('');
      return result.item;
    }

    return null;
  }, [items, newItem, onChange, t]);

  const handleRemoveItem = useCallback(
    (id: string) => {
      onChange(items.filter((item) => item.id !== id));
    },
    [items, onChange],
  );

  const handleUpdateItem = useCallback(
    (id: string, field: keyof POItem, value: string | number | undefined) => {
      onChange(
        items.map((item) => {
          if (item.id === id) {
            const updated = { ...item, [field]: value };
            return updated;
          }
          return item;
        }),
      );
    },
    [items, onChange],
  );

  const handleQuantityChange = useCallback(
    (id: string, value: string | number) => {
      handleUpdateItem(id, 'quantity', value || 1);
    },
    [handleUpdateItem],
  );

  const handleProductSelection = useCallback(
    (itemId: string | 'new', value: string) => {
      // Parse the selection to get product code
      const productCode = value.split(' - ')[0];
      const product = overviewData?.products.find((p) => p.code === productCode);

      if (product) {
        if (itemId === 'new') {
          setNewItem({
            ...newItem,
            productCode: product.code,
            description: product.name,
            category: newItem.category || '',
          });
        } else {
          // Find current item to preserve quantity and other fields
          const currentItem = items.find((i) => i.id === itemId);
          if (currentItem) {
            handleUpdateItem(itemId, 'productCode', product.code);
            handleUpdateItem(itemId, 'description', product.name);
            handleUpdateItem(itemId, 'category', currentItem.category);
          }
        }
      }
    },
    [overviewData, newItem, items, handleUpdateItem],
  );

  // Empty state
  if (!isReadOnly && items.length === 0) {
    return (
      <Card shadow="sm" padding="xl" radius="md">
        <Stack gap="lg">
          <Title order={3}>{t('po.orderItems')}</Title>
          <Text c="dimmed" ta="center" py="xl">
            {t('po.noItemsMessage')}
          </Text>
          {/* Add first item form */}
          <Box>
            <Text size="sm" fw={500} mb="sm">
              {t('po.addFirstItem')}
            </Text>
            <Stack gap="sm">
              <Autocomplete
                placeholder={t('po.searchProduct')}
                data={productOptions}
                value={productSearch}
                onChange={(value) => {
                  setProductSearch(value);
                  handleProductSelection('new', value);
                }}
                limit={10}
              />
              <TextInput
                placeholder={t('po.description')}
                value={newItem.description || ''}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
              />
              <NumberInput
                placeholder={t('po.quantity')}
                value={newItem.quantity || 1}
                min={1}
                onChange={(value) =>
                  setNewItem({ ...newItem, quantity: typeof value === 'number' ? value : 1 })
                }
              />
              <Button
                leftSection={<IconPlus size={16} />}
                onClick={handleAddItem}
                disabled={
                  !newItem.productCode ||
                  !newItem.description ||
                  !newItem.quantity ||
                  newItem.quantity <= 0
                }
              >
                {t('po.addItem')}
              </Button>
            </Stack>
          </Box>
        </Stack>
      </Card>
    );
  }

  // Mobile layout with cards
  if (isMobile) {
    return (
      <Card shadow="sm" padding="xs" radius="md">
        <Stack gap="lg">
          <Title order={3}>{t('po.orderItems')}</Title>

          {/* Existing items as cards */}
          <Stack gap="md">
            {items.map((item) => (
              <Card key={item.id} withBorder padding="md" radius="md">
                <Stack gap="sm">
                  <Group justify="space-between" align="flex-start">
                    <Text size="sm" fw={500}>
                      {item.productCode}
                    </Text>
                    {!isReadOnly && (
                      <ActionIcon
                        color="red"
                        variant="subtle"
                        size="sm"
                        onClick={() => handleRemoveItem(item.id)}
                        aria-label={t('common.delete')}
                      >
                        <IconTrash size={14} />
                      </ActionIcon>
                    )}
                  </Group>

                  {/* Product Code */}
                  <Box>
                    <Text size="xs" c="dimmed" mb={4}>
                      {t('po.productCode')}
                    </Text>
                    {isReadOnly ? (
                      <Text size="sm">{item.productCode}</Text>
                    ) : (
                      <Autocomplete
                        data={productOptions}
                        value={`${item.productCode} - ${item.description}`}
                        onChange={(value) => handleProductSelection(item.id, value)}
                        size="sm"
                        limit={5}
                      />
                    )}
                  </Box>

                  {/* Description */}
                  <Box>
                    <Text size="xs" c="dimmed" mb={4}>
                      {t('po.description')}
                    </Text>
                    {isReadOnly ? (
                      <Text size="sm">{item.description}</Text>
                    ) : (
                      <TextInput
                        value={item.description}
                        onChange={(e) => handleUpdateItem(item.id, 'description', e.target.value)}
                        size="sm"
                      />
                    )}
                  </Box>

                  {/* Quantity */}
                  <Box>
                    <Text size="xs" c="dimmed" mb={4}>
                      {t('po.quantity')}
                    </Text>
                    {isReadOnly ? (
                      <Text size="sm">{item.quantity}</Text>
                    ) : (
                      <NumberInput
                        value={item.quantity}
                        min={1}
                        onChange={(value) => handleQuantityChange(item.id, value)}
                        size="sm"
                        style={{ maxWidth: 120 }}
                      />
                    )}
                  </Box>
                </Stack>
              </Card>
            ))}
          </Stack>

          {/* Add new item form */}
          {!isReadOnly && (
            <Card
              withBorder
              padding="md"
              radius="md"
              style={{ backgroundColor: 'var(--mantine-color-gray-0)' }}
            >
              <Stack gap="sm">
                <Text size="sm" fw={500} c="blue">
                  {t('po.addItem')}
                </Text>

                <Box>
                  <Text size="xs" c="dimmed" mb={4}>
                    {t('po.searchProduct')}
                  </Text>
                  <Autocomplete
                    placeholder={t('po.searchProduct')}
                    data={productOptions}
                    value={productSearch}
                    onChange={(value) => {
                      setProductSearch(value);
                      handleProductSelection('new', value);
                    }}
                    size="sm"
                    limit={5}
                  />
                </Box>

                <Box>
                  <Text size="xs" c="dimmed" mb={4}>
                    {t('po.description')}
                  </Text>
                  <TextInput
                    placeholder={t('po.description')}
                    value={newItem.description || ''}
                    onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                    size="sm"
                  />
                </Box>

                <Group>
                  <Box style={{ flex: 1 }}>
                    <Text size="xs" c="dimmed" mb={4}>
                      {t('po.quantity')}
                    </Text>
                    <NumberInput
                      placeholder={t('po.quantity')}
                      value={newItem.quantity || 1}
                      min={1}
                      onChange={(value) =>
                        setNewItem({ ...newItem, quantity: typeof value === 'number' ? value : 1 })
                      }
                      size="sm"
                    />
                  </Box>
                  <Button
                    leftSection={<IconPlus size={16} />}
                    onClick={handleAddItem}
                    disabled={
                      !newItem.productCode ||
                      !newItem.description ||
                      !newItem.quantity ||
                      newItem.quantity <= 0
                    }
                    size="sm"
                    style={{ alignSelf: 'flex-end' }}
                  >
                    {t('common.add')}
                  </Button>
                </Group>
              </Stack>
            </Card>
          )}
        </Stack>
      </Card>
    );
  }

  // Desktop layout with table
  return (
    <Card shadow="sm" padding="xl" radius="md">
      <Stack gap="lg">
        <Title order={3}>{t('po.orderItems')}</Title>
        <Box style={{ overflowX: 'auto' }}>
          <Table withTableBorder withColumnBorders aria-label={t('po.itemsTableAriaLabel')}>
            <Table.Thead>
              <Table.Tr>
                <Table.Th style={{ width: 200 }}>{t('po.productCode')}</Table.Th>
                <Table.Th style={{ minWidth: 200 }}>{t('po.description')}</Table.Th>
                <Table.Th style={{ width: 80 }}>{t('po.quantity')}</Table.Th>
                {!isReadOnly && <Table.Th style={{ width: 60 }}>{t('common.actions')}</Table.Th>}
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {items.map((item) => (
                <Table.Tr key={item.id}>
                  <Table.Td>
                    {isReadOnly ? (
                      <Text size="sm">{item.productCode}</Text>
                    ) : (
                      <Autocomplete
                        data={productOptions}
                        value={`${item.productCode} - ${item.description}`}
                        onChange={(value) => handleProductSelection(item.id, value)}
                        size="xs"
                        limit={5}
                      />
                    )}
                  </Table.Td>
                  <Table.Td>
                    {isReadOnly ? (
                      <Text size="sm">{item.description}</Text>
                    ) : (
                      <TextInput
                        value={item.description}
                        onChange={(e) => handleUpdateItem(item.id, 'description', e.target.value)}
                        size="xs"
                      />
                    )}
                  </Table.Td>
                  <Table.Td>
                    {isReadOnly ? (
                      <Text size="sm" ta="center">
                        {item.quantity}
                      </Text>
                    ) : (
                      <NumberInput
                        value={item.quantity}
                        min={1}
                        onChange={(value) => handleQuantityChange(item.id, value)}
                        size="xs"
                      />
                    )}
                  </Table.Td>
                  {!isReadOnly && (
                    <Table.Td>
                      <ActionIcon
                        color="red"
                        variant="subtle"
                        onClick={() => handleRemoveItem(item.id)}
                        aria-label={t('common.delete')}
                      >
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Table.Td>
                  )}
                </Table.Tr>
              ))}
              {!isReadOnly && (
                <Table.Tr>
                  <Table.Td>
                    <Autocomplete
                      placeholder={t('po.searchProduct' as any)}
                      data={productOptions}
                      value={productSearch}
                      onChange={(value) => {
                        setProductSearch(value);
                        handleProductSelection('new', value);
                      }}
                      size="xs"
                      limit={5}
                    />
                  </Table.Td>
                  <Table.Td>
                    <TextInput
                      placeholder={t('po.description')}
                      value={newItem.description || ''}
                      onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                      size="xs"
                    />
                  </Table.Td>
                  <Table.Td>
                    <NumberInput
                      placeholder={t('po.quantity')}
                      value={newItem.quantity || 1}
                      min={1}
                      onChange={(value) =>
                        setNewItem({ ...newItem, quantity: typeof value === 'number' ? value : 1 })
                      }
                      size="xs"
                    />
                  </Table.Td>
                  <Table.Td>
                    <Button
                      size="xs"
                      variant="light"
                      onClick={handleAddItem}
                      disabled={
                        !newItem.productCode ||
                        !newItem.description ||
                        !newItem.quantity ||
                        newItem.quantity <= 0
                      }
                    >
                      {t('common.add')}
                    </Button>
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>
        </Box>
      </Stack>
    </Card>
  );
}
