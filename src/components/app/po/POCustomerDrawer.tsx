import { Stack, Button, TextInput } from '@mantine/core';
import { Drawer } from '@/components/common';
import { useTranslation } from '@/hooks/useTranslation';
import type { Customer } from '@/services/sales/customer';
import { useState, useMemo } from 'react';
import { IconSearch } from '@tabler/icons-react';

interface POCustomerDrawerProps {
  readonly opened: boolean;
  readonly customers: readonly Customer[];
  readonly selectedCustomerId?: string;
  readonly onClose: () => void;
  readonly onCustomerSelect: (customerId?: string) => void;
}

export function POCustomerDrawer({
  opened,
  customers,
  selectedCustomerId,
  onClose,
  onCustomerSelect,
}: POCustomerDrawerProps) {
  const { t } = useTranslation();
  const [searchValue, setSearchValue] = useState('');

  const handleCustomerSelect = (customerId?: string) => {
    onCustomerSelect(customerId);
    onClose();
  };

  // Filter customers based on search
  const filteredCustomers = useMemo(() => {
    if (!searchValue.trim()) return customers;

    const searchLower = searchValue.toLowerCase();
    return customers.filter(
      (customer) =>
        customer.name.toLowerCase().includes(searchLower) ||
        (customer.companyName && customer.companyName.toLowerCase().includes(searchLower)),
    );
  }, [customers, searchValue]);

  return (
    <Drawer
      expandable
      opened={opened}
      size="300px"
      title={t('po.selectCustomer')}
      onClose={onClose}
    >
      <Stack gap="sm">
        {/* Search input for customers */}
        <TextInput
          placeholder={t('po.searchCustomer')}
          leftSection={<IconSearch size={16} />}
          value={searchValue}
          onChange={(event) => setSearchValue(event.currentTarget.value)}
        />

        {/* Customer list */}
        <Stack gap="xs">
          <Button
            size="sm"
            variant={!selectedCustomerId ? 'filled' : 'light'}
            onClick={() => handleCustomerSelect(undefined)}
            fullWidth
            styles={{ label: { textAlign: 'left' } }}
          >
            {t('po.allCustomers')}
          </Button>
          {filteredCustomers.map((customer) => (
            <Button
              key={customer.id}
              size="sm"
              variant={selectedCustomerId === customer.id ? 'filled' : 'light'}
              onClick={() => handleCustomerSelect(customer.id)}
              fullWidth
              styles={{ label: { textAlign: 'left' } }}
            >
              {customer.name}
              {customer.companyName && ` (${customer.companyName})`}
            </Button>
          ))}
        </Stack>
      </Stack>
    </Drawer>
  );
}
