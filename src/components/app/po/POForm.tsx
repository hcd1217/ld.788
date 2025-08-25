import {
  Stack,
  Card,
  Text,
  Box,
  Group,
  ActionIcon,
  Tooltip,
  TextInput,
  Textarea,
  SimpleGrid,
} from '@mantine/core';
import { DateInput, DatesProvider } from '@mantine/dates';
import type { UseFormReturnType } from '@mantine/form';
import 'dayjs/locale/vi';
import 'dayjs/locale/en';
import { useDeviceType } from '@/hooks/useDeviceType';
import { POItemsEditor } from './POItemsEditor';
import { POCustomerSelection } from './POCustomerSelection';
import { POAdditionalInfo } from './POAdditionalInfo';
import { POFormActions } from './POFormActions';
import { createAddressFromCustomer } from './POFormHelpers';
import {
  FIXED_BUTTON_AREA_HEIGHT,
  MOBILE_FORM_ACTIONS_Z_INDEX,
  DESKTOP_FORM_ACTIONS_Z_INDEX,
} from '@/constants/po.constants';
import type { POItem } from '@/services/sales/purchaseOrder';
import { useMemo, useEffect, useCallback } from 'react';
import { ErrorAlert } from '@/components/common';
import { IconMapPin } from '@tabler/icons-react';
import { useTranslation } from '@/hooks/useTranslation';
import type { CustomerOverview as Customer } from '@/services/client/overview';

export type POFormValues = {
  customerId: string;
  items: POItem[];
  orderDate?: Date;
  deliveryDate?: Date;
  shippingAddress: {
    oneLineAddress?: string;
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    googleMapsUrl?: string;
  };
  notes?: string;
};

type POFormProps = {
  readonly form: UseFormReturnType<POFormValues>;
  readonly customers: Customer[];
  readonly isLoading: boolean;
  readonly error?: string | null;
  readonly onSubmit: (values: POFormValues) => void;
  readonly onCancel: () => void;
  readonly isEditMode?: boolean;
};

export function POForm({
  form,
  customers,
  isLoading,
  error,
  onSubmit,
  onCancel,
  isEditMode = false,
}: POFormProps) {
  const { isMobile } = useDeviceType();
  const { currentLanguage } = useTranslation();
  const valueFormat = currentLanguage === 'vi' ? 'DD/MM/YYYY' : 'MMM DD, YYYY';

  // Computed values
  const selectedCustomer = useMemo(
    () => customers.find((c) => c.id === form.values.customerId),
    [customers, form.values.customerId],
  );

  const isDisabled = useMemo(() => {
    if (form.values.items.length === 0) {
      return true;
    }
    if (!form.values.customerId) {
      return true;
    }
    return false;
  }, [form.values]);

  // Auto-fill shipping address when customer is selected
  useEffect(() => {
    if (selectedCustomer?.address && !isEditMode) {
      const address = createAddressFromCustomer(
        selectedCustomer.address,
        selectedCustomer.googleMapsUrl,
      );
      form.setFieldValue('shippingAddress', address);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCustomer?.id, isEditMode]);

  // Handle form submission - directly pass values to parent
  const handleSubmit = useCallback(onSubmit, [onSubmit]);

  // Form content without actions
  const formContent = (
    <DatesProvider settings={{ locale: currentLanguage, firstDayOfWeek: 0, weekendDays: [0, 6] }}>
      <Stack gap="lg">
        {/* Error Alert */}
        <ErrorAlert error={error} />

        {/* Customer Selection */}
        <POCustomerSelection
          form={form}
          customers={customers}
          selectedCustomer={selectedCustomer}
          isEditMode={isEditMode}
        />

        {/* Date Fields */}
        <PODateSection form={form} isLoading={isLoading} valueFormat={valueFormat} />

        {/* Order Items */}
        <OrderItemsSection form={form} isLoading={isLoading} />

        {/* Shipping Address */}
        <ShippingAddressSection form={form} selectedCustomer={selectedCustomer} />

        {/* Additional Information */}
        <POAdditionalInfo form={form} />
      </Stack>
    </DatesProvider>
  );

  // Mobile layout with fixed buttons
  if (isMobile) {
    return (
      <>
        <form id="po-form" onSubmit={form.onSubmit(handleSubmit)}>
          <Box pb={FIXED_BUTTON_AREA_HEIGHT}>
            {/* Padding to ensure content isn't hidden behind fixed buttons */}
            {formContent}
          </Box>
        </form>

        {/* Fixed buttons at bottom of viewport */}
        <Box
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: 'var(--mantine-color-body)',
            borderTop: '1px solid var(--mantine-color-gray-3)',
            padding: '12px 16px',
            zIndex: MOBILE_FORM_ACTIONS_Z_INDEX,
          }}
        >
          <POFormActions
            isDisabled={isDisabled}
            onCancel={onCancel}
            isLoading={isLoading}
            isEditMode={isEditMode}
            isMobile={true}
            formId="po-form"
            isHidden={false}
          />
        </Box>
      </>
    );
  }

  // Desktop layout - simple approach with fixed buttons at viewport bottom
  return (
    <>
      <form id="po-form-desktop" onSubmit={form.onSubmit(handleSubmit)}>
        <Box pb={FIXED_BUTTON_AREA_HEIGHT}>
          {/* Padding to prevent content overlap with fixed buttons */}
          {formContent}
        </Box>
      </form>
      {/* Fixed buttons at bottom of viewport for desktop */}
      <Box
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          borderTop: '1px solid var(--mantine-color-gray-3)',
          padding: 'var(--mantine-spacing-md) var(--mantine-spacing-xl)',
          backgroundColor: 'var(--mantine-color-body)',
          zIndex: DESKTOP_FORM_ACTIONS_Z_INDEX,
        }}
      >
        <POFormActions
          isDisabled={isDisabled}
          onCancel={onCancel}
          isLoading={isLoading}
          isEditMode={isEditMode}
          isMobile={false}
          formId="po-form-desktop"
        />
      </Box>
    </>
  );
}

function PODateSection({
  form,
  isLoading,
  valueFormat,
}: {
  form: UseFormReturnType<POFormValues>;
  isLoading: boolean;
  valueFormat: string;
}) {
  const { t } = useTranslation();
  const { isMobile } = useDeviceType();

  return (
    <Card withBorder radius="md" p="xl">
      <Stack gap="md">
        <Text fw={500} size="lg">
          {t('po.orderDates')}
        </Text>
        <SimpleGrid cols={isMobile ? 1 : 2}>
          <DateInput
            label={t('po.orderDate')}
            placeholder={t('po.selectOrderDate')}
            clearable
            disabled={isLoading}
            valueFormat={valueFormat}
            value={form.values.orderDate}
            onChange={(date) => form.setFieldValue('orderDate', date ? new Date(date) : undefined)}
            maxDate={form.values.deliveryDate || undefined}
          />
          <DateInput
            label={t('po.deliveryDate')}
            placeholder={t('po.selectDeliveryDate')}
            clearable
            disabled={isLoading}
            valueFormat={valueFormat}
            value={form.values.deliveryDate}
            onChange={(date) =>
              form.setFieldValue('deliveryDate', date ? new Date(date) : undefined)
            }
            minDate={form.values.orderDate || undefined}
          />
        </SimpleGrid>
      </Stack>
    </Card>
  );
}

function OrderItemsSection({
  form,
  isLoading,
}: {
  form: UseFormReturnType<POFormValues>;
  isLoading: boolean;
}) {
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

function ShippingAddressSection({
  form,
  selectedCustomer,
}: {
  form: UseFormReturnType<POFormValues>;
  selectedCustomer?: Customer;
}) {
  const { t } = useTranslation();

  const customerGoogleMapsUrl = selectedCustomer?.googleMapsUrl;
  const formGoogleMapsUrl = form.values.shippingAddress?.googleMapsUrl;
  const displayGoogleMapsUrl = formGoogleMapsUrl || customerGoogleMapsUrl;

  return (
    <Card withBorder radius="md" p="xl">
      <Stack gap="md">
        <Text fw={500} size="lg">
          {t('po.shippingAddress')}
          {displayGoogleMapsUrl && (
            <Tooltip label={t('customer.viewOnMap')}>
              <ActionIcon
                ml="sm"
                size="sm"
                variant="subtle"
                onClick={() => {
                  window.open(displayGoogleMapsUrl, '_blank', 'noopener,noreferrer');
                }}
              >
                <IconMapPin size={16} />
              </ActionIcon>
            </Tooltip>
          )}
        </Text>
        <POAddressFields form={form} fieldPrefix="shippingAddress" />
        {selectedCustomer?.address && (
          <Text size="sm" c="dimmed" fs="italic">
            {t('po.autoFilledFromCustomerAddress')}
          </Text>
        )}
      </Stack>
    </Card>
  );
}

function POAddressFields({
  form,
  noDetail = true,
  fieldPrefix,
}: {
  readonly form: UseFormReturnType<any>;
  readonly fieldPrefix: string;
  readonly noDetail?: boolean;
}) {
  const { t } = useTranslation();

  return (
    <Stack gap="md">
      <Textarea
        label={t('po.address')}
        placeholder={t('po.addressPlaceholder')}
        // leftSection={<IconMapPin size={16} />}
        minRows={4}
        autosize
        maxRows={4}
        {...form.getInputProps(`${fieldPrefix}.oneLineAddress`)}
      />

      <TextInput
        label={t('customer.googleMapsUrl')}
        placeholder={t('customer.googleMapsUrlPlaceholder')}
        {...form.getInputProps(`${fieldPrefix}.googleMapsUrl`)}
      />

      {noDetail ? null : (
        <>
          <TextInput
            label={t('po.street')}
            placeholder={t('po.streetPlaceholder')}
            {...form.getInputProps(`${fieldPrefix}.street`)}
          />
          <Group grow>
            <TextInput
              label={t('po.city')}
              placeholder={t('po.cityPlaceholder')}
              {...form.getInputProps(`${fieldPrefix}.city`)}
            />
            <TextInput
              label={t('po.state')}
              placeholder={t('po.statePlaceholder')}
              {...form.getInputProps(`${fieldPrefix}.state`)}
            />
          </Group>

          <Group grow>
            <TextInput
              label={t('po.postalCode')}
              placeholder={t('po.postalCodePlaceholder')}
              {...form.getInputProps(`${fieldPrefix}.postalCode`)}
            />
            <TextInput
              label={t('po.country')}
              placeholder={t('po.countryPlaceholder')}
              {...form.getInputProps(`${fieldPrefix}.country`)}
            />
          </Group>
        </>
      )}
    </Stack>
  );
}
