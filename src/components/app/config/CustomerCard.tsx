import { Box, Card, Group, type MantineStyleProp, Stack, Text } from '@mantine/core';

import { ActiveBadge, ContactInfo, ViewOnMap } from '@/components/common';
import { useTranslation } from '@/hooks/useTranslation';
import type { Customer } from '@/services/sales/customer';

type CustomerCardProps = {
  readonly customer: Customer;
  /** Custom styles for the card container */
  readonly style?: MantineStyleProp;
  /** Custom className for the card container */
  readonly className?: string;
};

export function CustomerCard({ customer, style, className }: CustomerCardProps) {
  const { t } = useTranslation();

  return (
    <Card withBorder shadow="sm" padding="xs" radius="md" style={style} className={className}>
      <Group justify="space-between" align="flex-start" style={{ position: 'relative' }}>
        <Stack gap="xs" style={{ flex: 1, paddingRight: 60 }}>
          <Group gap="xs" wrap="nowrap">
            <Text fw={500} size="sm">
              {customer.name}
            </Text>
          </Group>
          <Group gap="xs" wrap="nowrap">
            <Text size="xs" c="dimmed">
              {t('customer.company')}:
            </Text>
            <Text size="xs" fw={500}>
              {customer.companyName}
            </Text>
          </Group>

          <Text size="xs" c="dimmed">
            {t('customer.address')}:
          </Text>
          <Group gap="xs" wrap="nowrap">
            <Text size="xs" fw={500}>
              {customer.address}
            </Text>
            <ViewOnMap googleMapsUrl={customer.googleMapsUrl} />
          </Group>

          {customer.deliveryAddress && (
            <>
              <Text size="xs" c="dimmed">
                {t('customer.deliveryAddress')}:
              </Text>
              <Text size="xs" fw={500}>
                {customer.deliveryAddress}
              </Text>
            </>
          )}

          <Group gap="xs" wrap="nowrap">
            <Text size="xs" c="dimmed">
              {t('common.contact')}:
            </Text>
            <ContactInfo {...customer} />
          </Group>
        </Stack>
        <Box
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
          }}
        >
          <ActiveBadge isActive={customer.isActive} />
        </Box>
      </Group>
    </Card>
  );
}
