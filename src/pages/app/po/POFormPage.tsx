import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Container, Loader, Center, Alert } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconAlertCircle } from '@tabler/icons-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useDeviceType } from '@/hooks/useDeviceType';
import { AppPageTitle, AppMobileLayout, AppDesktopLayout } from '@/components/common';
import { POForm, POErrorBoundary } from '@/components/app/po';
import { usePOActions, usePOLoading, usePOError } from '@/stores/usePOStore';
import { useCustomers } from '@/stores/useAppStore';
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
  const customers = useCustomers();

  const isLoading = usePOLoading();
  const error = usePOError();
  const { clearError, createPurchaseOrder, updatePurchaseOrder } = usePOActions();

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
        orderDate: po.orderDate ? new Date(po.orderDate) : undefined,
        deliveryDate: po.deliveryDate ? new Date(po.deliveryDate) : undefined,
        shippingAddress:
          po.address || po.googleMapsUrl
            ? {
                oneLineAddress: po.address,
                googleMapsUrl: po.googleMapsUrl,
              }
            : initialValues.shippingAddress,
        notes: po.notes || '',
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

      // Validate customer
      const customer = customers.find((c) => c.id === values.customerId);
      if (!customer) {
        throw new Error(t('po.customerNotFound'));
      }

      // Prepare PO data
      const poData = {
        customerId: values.customerId,
        customer,
        items: values.items,
        orderDate: values.orderDate,
        deliveryDate: values.deliveryDate,
        address: values.shippingAddress?.oneLineAddress,
        googleMapsUrl: values.shippingAddress?.googleMapsUrl,
        notes: values.notes,
      };

      if (isEditMode && id) {
        await updatePurchaseOrder(id, poData);
      } else {
        const newPO = {
          ...poData,
          status: 'NEW' as const,
          orderDate: poData.orderDate || new Date(),
        };
        await createPurchaseOrder(newPO);
      }
    },
  });

  // Page title
  const pageTitle = t(isEditMode ? 'po.editPO' : 'po.createPO');

  // Cancel navigation
  const handleCancel = () => {
    if (isEditMode && id) {
      navigate(getPODetailRoute(id));
    } else {
      navigate(ROUTERS.PO_MANAGEMENT);
    }
  };

  const content = (
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
        {content}
      </AppMobileLayout>
    );
  }

  return (
    <AppDesktopLayout isLoading={isLoading} error={error} clearError={clearError}>
      <AppPageTitle title={pageTitle} />
      <Container fluid>{content}</Container>
    </AppDesktopLayout>
  );
}
