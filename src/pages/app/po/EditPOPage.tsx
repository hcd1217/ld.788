import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Container, Loader, Center, Alert } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconAlertCircle } from '@tabler/icons-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useDeviceType } from '@/hooks/useDeviceType';
import { getBasicValidators } from '@/utils/validation';
import { AppPageTitle, AppMobileLayout, AppDesktopLayout, GoBack } from '@/components/common';
import { POForm } from '@/components/app/po';
import { usePOActions, useCustomerList, usePOLoading, usePOError } from '@/stores/usePOStore';
import { purchaseOrderService } from '@/services/sales/purchaseOrder';
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

export function EditPOPage() {
  const { poId: id } = useParams<{ poId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isMobile } = useDeviceType();
  const customers = useCustomerList();
  const isLoading = usePOLoading();
  const error = usePOError();
  const { loadCustomers, clearError, updatePurchaseOrder } = usePOActions();

  const [isLoadingPO, setIsLoadingPO] = useState(true);
  const [currentPO, setCurrentPO] = useState<PurchaseOrder | null>(null);

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

  // Load customers and PO data on mount
  useOnce(() => {
    void loadCustomers();
    void loadPO();
  });

  const loadPO = async () => {
    if (!id) {
      navigate(ROUTERS.PO_MANAGEMENT);
      return;
    }

    try {
      setIsLoadingPO(true);
      const po = await purchaseOrderService.getPOById(id);

      if (!po) {
        navigate(ROUTERS.PO_MANAGEMENT);
        return;
      }

      // Check if PO can be edited (only NEW status)
      if (po.status !== 'NEW') {
        navigate(getPODetailRoute(po.id));
        return;
      }

      setCurrentPO(po);

      // Populate form with PO data
      form.setValues({
        customerId: po.customerId,
        items: po.items,
        shippingAddress: po.shippingAddress || {
          street: '',
          city: '',
          state: '',
          postalCode: '',
          country: 'Vietnam',
        },
        billingAddress: po.billingAddress,
        paymentTerms: po.paymentTerms || 'Net 30',
        notes: po.notes || '',
        useSameAddress: !po.billingAddress,
      });
    } catch (error) {
      console.error('Failed to load PO:', error);
      navigate(ROUTERS.PO_MANAGEMENT);
    } finally {
      setIsLoadingPO(false);
    }
  };

  const handleSubmit = useAction<POFormValues>({
    options: {
      successTitle: t('common.success'),
      successMessage: t('po.updated'),
      navigateTo: getPODetailRoute(id!),
    },
    async actionHandler(values) {
      if (!id || !currentPO) return;

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

      const updatedPO: Partial<PurchaseOrder> = {
        customerId: values.customerId,
        customer,
        totalAmount,
        items: values.items,
        shippingAddress: values.shippingAddress,
        billingAddress: values.useSameAddress ? undefined : values.billingAddress,
        paymentTerms: values.paymentTerms,
        notes: values.notes,
      };

      await updatePurchaseOrder(id, updatedPO);
    },
  });

  const pageContent = (
    <Container fluid w="100%">
      {isLoadingPO ? (
        <Center h={400}>
          <Loader size="lg" />
        </Center>
      ) : currentPO ? (
        <POForm
          form={form}
          customers={customers}
          isLoading={isLoading}
          error={error}
          onSubmit={handleSubmit}
          onCancel={() => navigate(getPODetailRoute(id!))}
          isEditMode
        />
      ) : (
        <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light">
          {t('po.notFound')}
        </Alert>
      )}
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
            <AppPageTitle title={t('po.editPO')} />
          </>
        }
      >
        {pageContent}
      </AppMobileLayout>
    );
  }

  return (
    <AppDesktopLayout isLoading={isLoading} error={error} clearError={clearError}>
      <AppPageTitle title={t('po.editPO')} />
      {pageContent}
    </AppDesktopLayout>
  );
}

// Import helper function
import { getPODetailRoute } from '@/config/routeConfig';
