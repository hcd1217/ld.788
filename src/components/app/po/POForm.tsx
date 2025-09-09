import { Stack, Box } from '@mantine/core';
import type { UseFormReturnType } from '@mantine/form';
import 'dayjs/locale/vi';
import 'dayjs/locale/en';
import { useDeviceType } from '@/hooks/useDeviceType';
import { POCustomerSelection } from './POCustomerSelection';
import { POAdditionalInfo } from './POAdditionalInfo';
import { POFormActions } from './POFormActions';
import { POFormDateSection } from './POFormDateSection';
import { POFormItemsSection } from './POFormItemsSection';
import { POFormAddressSection } from './POFormAddressSection';
import { createAddressFromCustomer } from './POFormHelpers';
import {
  FIXED_BUTTON_AREA_HEIGHT,
  MOBILE_FORM_ACTIONS_Z_INDEX,
  DESKTOP_FORM_ACTIONS_Z_INDEX,
} from '@/constants/po.constants';
import type { POItem } from '@/services/sales/purchaseOrder';
import { useMemo, useEffect, useCallback } from 'react';
import { ErrorAlert } from '@/components/common';
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
  readonly customers: readonly Customer[];
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
      <POFormDateSection form={form} isLoading={isLoading} />

      {/* Order Items */}
      <POFormItemsSection form={form} isLoading={isLoading} />

      {/* Shipping Address */}
      <POFormAddressSection form={form} selectedCustomer={selectedCustomer} />

      {/* Additional Information */}
      <POAdditionalInfo form={form} />
    </Stack>
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
