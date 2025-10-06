import { Box, Card, Group, type MantineStyleProp, Stack, Text } from '@mantine/core';

import { ActiveBadge, ContactInfo, ViewOnMap } from '@/components/common';
import { useTranslation } from '@/hooks/useTranslation';
import type { Vendor } from '@/services/sales/vendor';

type VendorCardProps = {
  readonly vendor: Vendor;
  /** Custom styles for the card container */
  readonly style?: MantineStyleProp;
  /** Custom className for the card container */
  readonly className?: string;
};

export function VendorCard({ vendor, style, className }: VendorCardProps) {
  const { t } = useTranslation();

  return (
    <Card withBorder shadow="sm" padding="xs" radius="md" style={style} className={className}>
      <Group justify="space-between" align="flex-start" style={{ position: 'relative' }}>
        <Stack gap="xs" style={{ flex: 1, paddingRight: 60 }}>
          <Group gap="xs" wrap="nowrap">
            <Text fw={500} size="sm">
              {vendor.name}
            </Text>
          </Group>

          {vendor.address && (
            <>
              <Text size="xs" c="dimmed">
                {t('vendor.address')}:
              </Text>
              <Group gap="xs" wrap="nowrap">
                <Text size="xs" fw={500}>
                  {vendor.address}
                </Text>
                <ViewOnMap googleMapsUrl={vendor.googleMapsUrl} />
              </Group>
            </>
          )}

          {vendor.taxCode && (
            <Group gap="xs" wrap="nowrap">
              <Text size="xs" c="dimmed">
                {t('vendor.taxCode')}:
              </Text>
              <Text size="xs" fw={500}>
                {vendor.taxCode}
              </Text>
            </Group>
          )}

          <Group gap="xs" wrap="nowrap">
            <Text size="xs" c="dimmed">
              {t('common.contact')}:
            </Text>
            <ContactInfo {...vendor} />
          </Group>
        </Stack>
        <Box
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
          }}
        >
          <ActiveBadge isActive={vendor.isActive} />
        </Box>
      </Group>
    </Card>
  );
}
