import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Container, Loader, Center, Alert } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconAlertCircle } from '@tabler/icons-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useDeviceType } from '@/hooks/useDeviceType';
import { AppPageTitle, AppMobileLayout, AppDesktopLayout } from '@/components/common';
import { POForm, POErrorBoundary } from '@/components/app/po';
import { usePOActions, useCustomerList, usePOLoading, usePOError } from '@/stores/usePOStore';
import { purchaseOrderService } from '@/services/sales/purchaseOrder';
import { ROUTERS } from '@/config/routeConfig';
import { getPODetailRoute } from '@/config/routeConfig';
import { useAction } from '@/hooks/useAction';
import { useOnce } from '@/hooks/useOnce';
import { type POFormValues, usePOForm } from '@/hooks/usePOForm';
import type { PurchaseOrder } from '@/services/sales/purchaseOrder';
import { logError } from '@/utils/logger';

type PageMode = 'create' | 'edit';

type POFormPageProps = {
  readonly mode: PageMode;
};

export function POFormPage({ mode }: POFormPageProps) {
  const { poId: id } = useParams<{ poId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isMobile } = useDeviceType();
  const customers = useCustomerList();
  const isLoading = usePOLoading();
  const error = usePOError();
  const { loadCustomers, clearError, createPurchaseOrder, updatePurchaseOrder } = usePOActions();

  const [isLoadingPO, setIsLoadingPO] = useState(mode === 'edit');
  const [currentPO, setCurrentPO] = useState<PurchaseOrder | null>(null);

  const isEditMode = mode === 'edit';

  // Use the PO form hook
  const { initialValues, validation } = usePOForm({ isEditMode });

  const form = useForm<POFormValues>({
    initialValues,
    validate: validation,
  });

  // Load PO data for edit mode
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
        shippingAddress: po.shippingAddress || initialValues.shippingAddress,
        billingAddress: po.billingAddress,
        paymentTerms: po.paymentTerms || 'Net 30',
        notes: po.notes || '',
        useSameAddress: !po.billingAddress,
      });
    } catch (error) {
      logError('Failed to load PO:', error, {
        module: 'POFormPagePage',
        action: 'catch',
      });
      navigate(ROUTERS.PO_MANAGEMENT);
    } finally {
      setIsLoadingPO(false);
    }
  };

  // Load initial data
  useOnce(() => {
    void loadCustomers();
    if (isEditMode) {
      void loadPO();
    }
  });

  // Unified submit handler
  const handleSubmit = useAction<POFormValues>({
    options: {
      successTitle: t('common.success'),
      successMessage: t(isEditMode ? 'po.updated' : 'po.created'),
      navigateTo: isEditMode && id ? getPODetailRoute(id) : ROUTERS.PO_MANAGEMENT,
    },
    async actionHandler(values) {
      if (!values) return;
      if (isEditMode && (!id || !currentPO)) return;

      // Validate customer and credit limit
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

      // Prepare PO data
      const poData = {
        customerId: values.customerId,
        customer,
        totalAmount,
        items: values.items,
        shippingAddress: values.shippingAddress,
        billingAddress: values.useSameAddress ? undefined : values.billingAddress,
        paymentTerms: values.paymentTerms,
        notes: values.notes,
      };

      if (isEditMode && id) {
        await updatePurchaseOrder(id, poData);
      } else {
        const newPO = {
          ...poData,
          status: 'NEW' as const,
          orderDate: new Date(),
          createdBy: 'Current User', // In real app, get from auth context
          poNumber: `PO-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
        };
        await createPurchaseOrder(newPO as Omit<PurchaseOrder, 'id' | 'createdAt' | 'updatedAt'>);
      }
    },
  });

  // Page title - memoized
  const pageTitle = useMemo(() => t(isEditMode ? 'po.editPO' : 'po.createPO'), [isEditMode, t]);

  // Cancel navigation - memoized callback
  const handleCancel = useMemo(() => {
    if (isEditMode && id) {
      return () => navigate(getPODetailRoute(id));
    }
    return () => navigate(ROUTERS.PO_MANAGEMENT);
  }, [isEditMode, id, navigate]);

  const pageContent = (
    <Container fluid w="100%">
      <POErrorBoundary componentName="POFormPage">
        {isEditMode && isLoadingPO ? (
          <Center h={400}>
            <Loader size="lg" />
          </Center>
        ) : isEditMode && !currentPO ? (
          <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light">
            {t('po.notFound')}
          </Alert>
        ) : (
          <POForm
            form={form}
            customers={customers}
            isLoading={isLoading}
            error={error}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isEditMode={isEditMode}
          />
        )}
      </POErrorBoundary>
    </Container>
  );

  if (isMobile) {
    return (
      <AppMobileLayout
        showLogo
        withGoBack
        isLoading={isLoading}
        error={error}
        clearError={clearError}
        header={<AppPageTitle title={pageTitle} />}
      >
        {pageContent}
      </AppMobileLayout>
    );
  }

  return (
    <AppDesktopLayout isLoading={isLoading} error={error} clearError={clearError}>
      <AppPageTitle title={pageTitle} />
      {pageContent}
    </AppDesktopLayout>
  );
}
