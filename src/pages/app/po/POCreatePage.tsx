import { useNavigate } from 'react-router';
import { Container } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useTranslation } from '@/hooks/useTranslation';
import { useDeviceType } from '@/hooks/useDeviceType';
import { getBasicValidators } from '@/utils/validation';
import { AppPageTitle, AppMobileLayout, AppDesktopLayout, GoBack } from '@/components/common';
import { POForm } from '@/components/app/po/POForm';
import { usePOActions, useCustomerList, usePOLoading, usePOError } from '@/stores/usePOStore';
import { ROUTERS } from '@/config/routeConfig';
import { useAction } from '@/hooks/useAction';
import { useOnce } from '@/hooks/useOnce';
import type { PurchaseOrder, POItem } from '@/services/sales/purchaseOrder';

type POFormValues = {
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

export function POCreatePage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isMobile } = useDeviceType();
  const customers = useCustomerList();
  const isLoading = usePOLoading();
  const error = usePOError();
  const { loadCustomers, clearError, createPurchaseOrder } = usePOActions();

  const validators = getBasicValidators();

  const form = useForm<POFormValues>({
    initialValues: {
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
    },
    validate: {
      customerId: validators.required(t('po.customerRequired')),
      items: (value) => {
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
    },
  });

  useOnce(() => {
    void loadCustomers();
  });

  const handleSubmit = useAction<POFormValues>({
    options: {
      successTitle: t('common.success'),
      successMessage: t('po.created'),
      navigateTo: ROUTERS.PO_MANAGEMENT,
    },
    async actionHandler(values) {
      // Check customer credit limit
      if (!values) return;

      const customer = customers.find((c) => c.id === values.customerId);
      if (!customer) {
        throw new Error(t('po.customerNotFound'));
      }

      const totalAmount = values.items.reduce((sum, item) => sum + item.totalPrice, 0);

      if (customer.creditLimit && totalAmount > customer.creditLimit) {
        const overAmount = totalAmount - customer.creditLimit;
        throw new Error(
          t('po.exceedsCreditLimit', {
            amount: new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND',
            }).format(overAmount),
          }),
        );
      }

      const newPO = {
        customerId: values.customerId,
        customer,
        status: 'NEW' as const,
        totalAmount,
        orderDate: new Date(),
        items: values.items,
        createdBy: 'Current User', // In real app, get from auth context
        shippingAddress: values.shippingAddress,
        billingAddress: values.useSameAddress ? undefined : values.billingAddress,
        paymentTerms: values.paymentTerms,
        notes: values.notes,
        poNumber: `PO-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
      };

      await createPurchaseOrder(newPO as Omit<PurchaseOrder, 'id' | 'createdAt' | 'updatedAt'>);
    },
  });

  const pageContent = (
    <Container fluid w="100%">
      <POForm
        form={form}
        customers={customers}
        isLoading={isLoading}
        error={error}
        onSubmit={handleSubmit}
        onCancel={() => navigate(ROUTERS.PO_MANAGEMENT)}
      />
    </Container>
  );

  if (isMobile) {
    return (
      <AppMobileLayout
        showLogo
        isLoading={isLoading}
        error={error}
        clearError={clearError}
        header={
          <>
            <GoBack />
            <AppPageTitle title={t('po.createPO')} />
          </>
        }
      >
        {pageContent}
      </AppMobileLayout>
    );
  }

  return (
    <AppDesktopLayout isLoading={isLoading} error={error} clearError={clearError}>
      <AppPageTitle title={t('po.createPO')} />
      {pageContent}
    </AppDesktopLayout>
  );
}
