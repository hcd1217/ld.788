import { Card, Stack, Text } from '@mantine/core';
import type { UseFormReturnType } from '@mantine/form';
import { useTranslation } from '@/hooks/useTranslation';
import { useDeviceType } from '@/hooks/useDeviceType';
import { POItemsEditor } from './POItemsEditor';

type POFormItemsSectionProps = {
  readonly form: UseFormReturnType<any>;
  readonly isLoading: boolean;
};

export function POFormItemsSection({ form, isLoading }: POFormItemsSectionProps) {
  const { t } = useTranslation();
  const { isMobile } = useDeviceType();

  return (
    <Card withBorder radius="md" p={isMobile ? 'xs' : 'xl'}>
      <Stack gap="md">
        <Text fw={500} size="lg">
          {t('po.orderItems')}
        </Text>
        <POItemsEditor
          items={form.values.items}
          onChange={(items) => form.setFieldValue('items', items)}
          isReadOnly={isLoading}
        />
      </Stack>
    </Card>
  );
}
