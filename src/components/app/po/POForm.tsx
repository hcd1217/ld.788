import { useCallback, useEffect, useMemo } from 'react';

import { Box, Stack } from '@mantine/core';
import 'dayjs/locale/vi';
import 'dayjs/locale/en';

import { ErrorAlert } from '@/components/common';
import {
  DESKTOP_FORM_ACTIONS_Z_INDEX,
  FIXED_BUTTON_AREA_HEIGHT,
  MOBILE_FORM_ACTIONS_Z_INDEX,
} from '@/constants/po.constants';
import { useDeviceType } from '@/hooks/useDeviceType';
import type { POFormValues } from '@/hooks/usePOForm';
import { useCustomers } from '@/stores/useAppStore';

import { POAdditionalInfo } from './POAdditionalInfo';
import { POCustomerAndSalesSelection } from './POCustomerAndSalesSelection';
import { POFormActions } from './POFormActions';
import { POFormAddressSection } from './POFormAddressSection';
import { POFormAttachmentsSection } from './POFormAttachmentsSection';
import { POFormDateSection } from './POFormDateSection';
import { POFormItemsSection } from './POFormItemsSection';

import type { UseFormReturnType } from '@mantine/form';

type POFormProps = {
  readonly form: UseFormReturnType<POFormValues>;
  readonly isLoading: boolean;
  readonly error?: string | null;
  readonly onSubmit: (values: POFormValues) => void;
  readonly onCancel: () => void;
  readonly isEditMode?: boolean;
};

export function POForm({
  form,
  isLoading,
  error,
  onSubmit,
  onCancel,
  isEditMode = false,
}: POFormProps) {
  const { isMobile } = useDeviceType();
  const customers = useCustomers();

  // Computed values
  const selectedCustomer = useMemo(
    () => customers.find((c) => c.id === form.values.customerId),
    [customers, form.values.customerId],
  );

  const isDisabled = useMemo(() => {
    if (!form.values.orderDate) {
      return true;
    }
    if (!form.values.customerId) {
      return true;
    }
    return false;
  }, [form.values]);

  // Auto-fill shipping address when customer is selected
  useEffect(() => {
    if (!isEditMode) {
      form.setFieldValue('shippingAddress', {
        oneLineAddress: selectedCustomer?.deliveryAddress ?? '',
        googleMapsUrl: selectedCustomer?.googleMapsUrl ?? '',
      });
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

      {/* Customer and Sales Selection */}
      <POCustomerAndSalesSelection
        form={form}
        selectedCustomer={selectedCustomer}
        isEditMode={isEditMode}
      />

      {/* Date Fields and Internal Delivery */}
      <POFormDateSection form={form} isLoading={isLoading} />

      {/* Order Items */}
      <POFormItemsSection form={form} isLoading={isLoading} />

      {/* Attachments */}
      <POFormAttachmentsSection form={form} isLoading={isLoading} />

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
