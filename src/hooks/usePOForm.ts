import { useMemo } from 'react';

import { useTranslation } from '@/hooks/useTranslation';
import type { POItem } from '@/services/sales/purchaseOrder';
import { getBasicValidators } from '@/utils/validation';

export type POFormValues = {
  customerId: string;
  items: POItem[];
  orderDate?: Date;
  deliveryDate?: Date;
  shippingAddress?: {
    oneLineAddress?: string;
    googleMapsUrl?: string;
  };
  notes?: string;
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
      orderDate: new Date(new Date().setHours(0, 0, 0, 1)),
    }),
    [],
  );

  // Form validation rules - memoized
  const validation = useMemo(
    () => ({
      customerId: validators.required(t('po.customerRequired')),
      items: (value: POItem[]) => {
        if (!value || value.length === 0) {
          return t('po.itemsRequired');
        }
        return null;
      },
      // No validation for address fields - all are optional
    }),
    [t, validators],
  );

  // Generate PO number for new orders
  const generatePONumber = (): string => {
    const year = new Date().getFullYear();
    const timestamp = String(Date.now()).slice(-6);
    return `PO-${year}-${timestamp}`;
  };

  // Prepare form data for submission
  const prepareFormData = (values: POFormValues, currentUserId: string = 'Current User') => {
    const baseData = {
      customerId: values.customerId,
      items: values.items,
      shippingAddress: values.shippingAddress,
      notes: values.notes,
    };

    if (!isEditMode) {
      return {
        ...baseData,
        status: 'NEW' as const,
        orderDate: new Date(),
        createdBy: currentUserId,
        poNumber: generatePONumber(),
      };
    }

    return baseData;
  };

  return {
    initialValues,
    validation,
    generatePONumber,
    prepareFormData,
  };
}
