import { useMemo } from 'react';

import { useTranslation } from '@/hooks/useTranslation';
import type { POItem } from '@/services/sales/purchaseOrder';
import type { Address } from '@/types';

export type POFormValues = {
  customerId: string;
  salesId?: string;
  items: POItem[];
  orderDate: Date;
  deliveryDate?: Date;
  customerPONumber?: string;
  isInternalDelivery: boolean;
  isPersonalCustomer?: boolean;
  personalCustomerName?: string;
  isUrgentPO: boolean;
  shippingAddress?: Address;
  notes?: string;
  attachments?: File[];
};

type UsePOFormOptions = {
  readonly isEditMode: boolean;
};

export function usePOForm({ isEditMode }: UsePOFormOptions) {
  const { t } = useTranslation();

  // Initial form values - memoized for stability
  const initialValues = useMemo<POFormValues>(
    () => ({
      customerId: '',
      items: [],
      isInternalDelivery: true,
      isUrgentPO: false,
      customerPONumber: '',
      orderDate: new Date(new Date().setHours(0, 0, 0, 1)),
    }),
    [],
  );

  // Form validation rules - memoized
  const validation = useMemo(
    () => ({
      customerId: (value: string, values: POFormValues) =>
        !values.isPersonalCustomer && !value ? t('po.customerRequired') : null,
      // Items are optional - PO can be created without items
      // No validation for address fields - all are optional
    }),
    [t],
  );

  // Prepare form data for submission
  const prepareFormData = (values: POFormValues, currentUserId: string = 'Current User') => {
    const baseData = {
      customerId: values.customerId,
      items: values.items,
      shippingAddress: values.shippingAddress,
      notes: values.notes,
      isInternalDelivery: values.isInternalDelivery ?? false,
      isPersonalCustomer: values.isPersonalCustomer ?? false,
      personalCustomerName: values.personalCustomerName,
      isUrgentPO: values.isUrgentPO ?? false,
      customerPONumber: values.customerPONumber,
    };

    if (!isEditMode) {
      return {
        ...baseData,
        status: 'NEW' as const,
        orderDate: new Date(),
        createdBy: currentUserId,
      };
    }

    return baseData;
  };

  return {
    initialValues,
    validation,
    prepareFormData,
  };
}
