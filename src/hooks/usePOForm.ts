import { useMemo } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { getBasicValidators } from '@/utils/validation';
import type { POItem } from '@/lib/api/schemas/sales.schemas';

export type POFormValues = {
  customerId: string;
  items: POItem[];
  shippingAddress: {
    street: string;
    city: string;
    state?: string;
    postalCode?: string;
    country: string;
  };
  billingAddress?: {
    street: string;
    city: string;
    state?: string;
    postalCode?: string;
    country: string;
  };
  paymentTerms?: string;
  notes?: string;
  useSameAddress?: boolean;
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
      shippingAddress: {
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'Vietnam',
      },
      billingAddress: undefined,
      paymentTerms: 'Net 30',
      notes: '',
      useSameAddress: true,
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
      shippingAddress: {
        street: validators.required(t('po.streetRequired')),
        city: validators.required(t('po.cityRequired')),
        country: validators.required(t('po.countryRequired')),
      },
    }),
    [t, validators],
  );

  // Validate credit limit
  const validateCreditLimit = (
    totalAmount: number,
    creditLimit?: number,
  ): { isValid: boolean; overAmount?: number } => {
    if (!creditLimit || totalAmount <= creditLimit) {
      return { isValid: true };
    }
    return {
      isValid: false,
      overAmount: totalAmount - creditLimit,
    };
  };

  // Calculate total amount from items
  const calculateTotalAmount = (items: POItem[]): number => {
    return items.reduce((sum, item) => sum + item.totalPrice, 0);
  };

  // Generate PO number for new orders
  const generatePONumber = (): string => {
    const year = new Date().getFullYear();
    const timestamp = String(Date.now()).slice(-6);
    return `PO-${year}-${timestamp}`;
  };

  // Format currency for display
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  // Prepare form data for submission
  const prepareFormData = (values: POFormValues, currentUserId: string = 'Current User') => {
    const totalAmount = calculateTotalAmount(values.items);

    const baseData = {
      customerId: values.customerId,
      totalAmount,
      items: values.items,
      shippingAddress: values.shippingAddress,
      billingAddress: values.useSameAddress ? undefined : values.billingAddress,
      paymentTerms: values.paymentTerms,
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
    validateCreditLimit,
    calculateTotalAmount,
    generatePONumber,
    formatCurrency,
    prepareFormData,
  };
}
