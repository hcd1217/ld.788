import React from 'react';
import { Stack, Alert, Transition, Card, Text, Box } from '@mantine/core';
import { modals } from '@mantine/modals';
import type { UseFormReturnType } from '@mantine/form';
import { IconAlertCircle } from '@tabler/icons-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useDeviceType } from '@/hooks/useDeviceType';
import { POItemsEditor, type POItemsEditorRef } from './POItemsEditor';
import { POCustomerSelection } from './POCustomerSelection';
import { POAddressFields } from './POAddressFields';
import { POAdditionalInfo } from './POAdditionalInfo';
import { POFormActions } from './POFormActions';
import {
  createAddressFromCustomer,
  prepareSubmissionValues,
  calculateCreditStatus,
} from './POFormHelpers';
import {
  FIXED_BUTTON_AREA_HEIGHT,
  MOBILE_FORM_ACTIONS_Z_INDEX,
  DESKTOP_FORM_ACTIONS_Z_INDEX,
} from '@/constants/po.constants';
import type { POItem } from '@/services/sales/purchaseOrder';
import type { Customer } from '@/services/sales/customer';
import { formatCurrency } from '@/utils/number';
import { useMemo, useEffect, useCallback, useRef, useState } from 'react';

export type POFormValues = {
  customerId: string;
  items: POItem[];
  shippingAddress: {
    oneLineAddress?: string;
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  billingAddress?: {
    oneLineAddress?: string;
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  paymentTerms?: string;
  notes?: string;
  useSameAddress?: boolean;
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
  const { t } = useTranslation();
  const { isMobile } = useDeviceType();
  const itemsEditorRef = useRef<POItemsEditorRef>(null);
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);

  // Computed values
  const selectedCustomer = useMemo(
    () => customers.find((c) => c.id === form.values.customerId),
    [customers, form.values.customerId],
  );

  const totalAmount = useMemo(
    () => form.values.items.reduce((sum, item) => sum + item.totalPrice, 0),
    [form.values.items],
  );

  const creditStatus = useMemo(
    () => calculateCreditStatus(selectedCustomer, totalAmount),
    [selectedCustomer, totalAmount],
  );

  // Auto-fill shipping address when customer is selected
  useEffect(() => {
    if (selectedCustomer?.address && !isEditMode) {
      const address = createAddressFromCustomer(selectedCustomer.address);
      form.setFieldValue('shippingAddress', address);
      form.setFieldValue('useSameAddress', true);
      form.setFieldValue('billingAddress', address);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCustomer?.id, isEditMode]);

  // Handle pending item confirmation
  const handlePendingItemConfirmation = useCallback(
    (values: POFormValues, pendingItem: any) => {
      modals.openConfirmModal({
        title: t('po.unsavedItem'),
        children: <PendingItemMessage pendingItem={pendingItem} />,
        labels: {
          confirm: t('po.addAndContinue'),
          cancel: t('po.continueWithoutAdding'),
        },
        confirmProps: { color: 'blue' },
        onConfirm: () => {
          const newItem = itemsEditorRef.current?.buildPendingItem();
          if (newItem) {
            const submissionValues = prepareSubmissionValues({
              ...values,
              items: [...values.items, newItem],
            });
            itemsEditorRef.current?.clearPendingItem();
            onSubmit(submissionValues);
          } else {
            onSubmit(prepareSubmissionValues(values));
          }
        },
        onCancel: () => {
          itemsEditorRef.current?.clearPendingItem();
          onSubmit(prepareSubmissionValues(values));
        },
      });
    },
    [onSubmit, t],
  );

  // Handle form submission
  const handleSubmit = useCallback(
    (values: POFormValues) => {
      if (itemsEditorRef.current?.hasPendingItem()) {
        const pendingItem = itemsEditorRef.current.getPendingItemDetails();
        handlePendingItemConfirmation(values, pendingItem);
      } else {
        onSubmit(prepareSubmissionValues(values));
      }
    },
    [handlePendingItemConfirmation, onSubmit],
  );

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
        creditStatus={creditStatus}
        isEditMode={isEditMode}
      />

      {/* Order Items */}
      <OrderItemsSection
        form={form}
        itemsEditorRef={itemsEditorRef}
        isLoading={isLoading}
        totalAmount={totalAmount}
        onModalStateChange={setIsAddItemModalOpen}
      />

      {/* Shipping Address */}
      <ShippingAddressSection form={form} selectedCustomer={selectedCustomer} />

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
            onCancel={onCancel}
            isLoading={isLoading}
            isEditMode={isEditMode}
            isMobile={true}
            formId="po-form"
            isHidden={isAddItemModalOpen}
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
        <Box style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <POFormActions
            onCancel={onCancel}
            isLoading={isLoading}
            isEditMode={isEditMode}
            isMobile={false}
            formId="po-form-desktop"
          />
        </Box>
      </Box>
    </>
  );
}

// Sub-components for cleaner organization
function ErrorAlert({ error }: { error?: string | null }) {
  const { t } = useTranslation();

  return (
    <Transition mounted={Boolean(error)} transition="fade">
      {(styles) => (
        <Alert
          withCloseButton
          style={styles}
          icon={<IconAlertCircle size={16} />}
          color="red"
          variant="light"
          onClose={() => {}}
        >
          {error || t('common.checkFormErrors')}
        </Alert>
      )}
    </Transition>
  );
}

function OrderItemsSection({
  form,
  itemsEditorRef,
  isLoading,
  totalAmount,
  onModalStateChange,
}: {
  form: UseFormReturnType<POFormValues>;
  itemsEditorRef: React.RefObject<POItemsEditorRef | null>;
  isLoading: boolean;
  totalAmount: number;
  onModalStateChange?: (isOpen: boolean) => void;
}) {
  const { t } = useTranslation();

  return (
    <Card withBorder radius="md" p="xl">
      <Stack gap="md">
        <Text fw={500} size="lg">
          {t('po.orderItems')}
        </Text>
        <POItemsEditor
          ref={itemsEditorRef}
          items={form.values.items}
          onChange={(items) => form.setFieldValue('items', items)}
          disabled={isLoading}
          onModalStateChange={onModalStateChange}
        />
        <Text size="lg" fw={600} ta="right">
          {t('po.totalAmount')}: {formatCurrency(totalAmount)}
        </Text>
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

  return (
    <Card withBorder radius="md" p="xl">
      <Stack gap="md">
        <Text fw={500} size="lg">
          {t('po.shippingAddress')}
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

function PendingItemMessage({ pendingItem }: { pendingItem: any }) {
  const { t } = useTranslation();

  return (
    <Stack gap="sm">
      <Text size="sm">{t('po.unsavedItemMessage')}</Text>
      {pendingItem && (
        <Stack gap="xs">
          <Text size="sm" fw={500}>
            {t('po.pendingItemDetails')}:
          </Text>
          <Text size="sm">
            • {t('po.productCode')}: {pendingItem.productCode || '-'}
          </Text>
          <Text size="sm">
            • {t('po.description')}: {pendingItem.description || '-'}
          </Text>
          <Text size="sm">
            • {t('po.quantity')}: {pendingItem.quantity || 0}
          </Text>
          <Text size="sm">
            • {t('po.unitPrice')}: {formatCurrency(pendingItem.unitPrice || 0)}
          </Text>
        </Stack>
      )}
    </Stack>
  );
}
