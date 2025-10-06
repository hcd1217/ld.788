import { useMemo } from 'react';

import { useTranslation } from '@/hooks/useTranslation';
import type { POItem } from '@/services/sales/purchaseOrder';
import type { Address } from '@/types';
import { getBasicValidators } from '@/utils/validation';

export type POFormValues = {
  customerId: string;
  salesId?: string;
  items: POItem[];
  orderDate: Date;
  deliveryDate?: Date;
  customerPONumber?: string;
  isInternalDelivery: boolean;
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
  const validators = getBasicValidators();

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
      customerId: validators.required(t('po.customerRequired')),
      // Items are optional - PO can be created without items
      // No validation for address fields - all are optional
    }),
    [t, validators],
  );

  // Prepare form data for submission
  const prepareFormData = (values: POFormValues, currentUserId: string = 'Current User') => {
    const baseData = {
      customerId: values.customerId,
      items: values.items,
      shippingAddress: values.shippingAddress,
      notes: values.notes,
      isInternalDelivery: values.isInternalDelivery ?? false,
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
