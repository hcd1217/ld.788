import { useCallback, useMemo, useState } from 'react';

import { useLocation, useNavigate, useParams } from 'react-router';

import { Alert, Center, Container, Loader } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconAlertCircle } from '@tabler/icons-react';

import { POErrorBoundary, POForm } from '@/components/app/po';
import {
  AppDesktopLayout,
  AppMobileLayout,
  AppPageTitle,
  PermissionDeniedPage,
} from '@/components/common';
import { ROUTERS } from '@/config/routeConfig';
import { getPODetailRoute } from '@/config/routeConfig';
import { useDeviceType } from '@/hooks/useDeviceType';
import { useOnce } from '@/hooks/useOnce';
import { type POFormValues, usePOForm } from '@/hooks/usePOForm';
import { useSWRAction } from '@/hooks/useSWRAction';
import { useTranslation } from '@/hooks/useTranslation';
import { purchaseOrderService } from '@/services/sales/purchaseOrder';
import type { PurchaseOrder } from '@/services/sales/purchaseOrder';
import { useCustomers, usePermissions } from '@/stores/useAppStore';
import { usePOActions, usePOError, usePOLoading } from '@/stores/usePOStore';
import { logError } from '@/utils/logger';
import { canCreatePurchaseOrder, canEditPurchaseOrder } from '@/utils/permission.utils';
import { isPOLocked } from '@/utils/purchaseOrder';

type PageMode = 'create' | 'edit';

type POFormPageProps = {
  readonly mode: PageMode;
};

export function POFormPage({ mode }: POFormPageProps) {
  const { poId: id } = useParams<{ poId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { isMobile } = useDeviceType();
  const permissions = usePermissions();
  const customers = useCustomers();
  const isLoading = usePOLoading();
  const error = usePOError();
  const { clearError, createPurchaseOrder, updatePurchaseOrder } = usePOActions();

  const [isLoadingPO, setIsLoadingPO] = useState(mode === 'edit');
  const [currentPO, setCurrentPO] = useState<PurchaseOrder | null>(null);

  const isEditMode = mode === 'edit';
  const { canEdit, canCreate } = useMemo(
    () => ({
      canEdit: canEditPurchaseOrder(permissions),
      canCreate: canCreatePurchaseOrder(permissions),
    }),
    [permissions],
  );

  // Use the PO form hook
  const { initialValues, validation } = usePOForm({ isEditMode });

  const form = useForm<POFormValues>({
    initialValues,
    validate: validation,
  });

  // Handle copied PO data from navigation state
  useOnce(() => {
    if (mode === 'create' && location.state?.copyFrom) {
      const copyData = location.state.copyFrom;
      form.setValues({
        ...initialValues,
        customerId: copyData.customerId,
        salesId: copyData.salesId,
        items: copyData.items,
        shippingAddress: copyData.shippingAddress || initialValues.shippingAddress,
        notes: copyData.notes || '',
        isInternalDelivery: copyData.isInternalDelivery,
        // Don't copy dates - use fresh dates for new PO
        orderDate: initialValues.orderDate,
        deliveryDate: initialValues.deliveryDate,
      });
    }
  });

  // Load PO data for edit mode
  const loadPO = useCallback(async () => {
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
      if (isPOLocked(po)) {
        navigate(getPODetailRoute(po.id));
        return;
      }

      setCurrentPO(po);

      // Populate form with PO data
      form.setValues({
        customerId: po.customerId,
        salesId: po.salesId,
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
        isInternalDelivery: po.isInternalDelivery,
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
  }, [id, form, navigate, initialValues]);

  // Load initial data
  useOnce(() => {
    if (isEditMode) {
      void loadPO();
    }
  });

  // Unified submit handler
  const handleSubmit = useSWRAction(
    'submit-po',
    async (values: POFormValues) => {
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
        salesId: values.salesId,
        items: values.items,
        orderDate: values.orderDate,
        deliveryDate: values.deliveryDate,
        address: values.shippingAddress?.oneLineAddress,
        googleMapsUrl: values.shippingAddress?.googleMapsUrl,
        notes: values.notes,
        isInternalDelivery: values.isInternalDelivery,
      } satisfies Omit<
        PurchaseOrder,
        'id' | 'createdAt' | 'updatedAt' | 'clientId' | 'poNumber' | 'status'
      >;
      setIsLoadingPO(true);
      if (isEditMode && id) {
        await updatePurchaseOrder(id, poData);
      } else {
        const newPO = {
          ...poData,
          status: 'NEW' as const,
          orderDate: poData.orderDate || new Date(),
          isInternalDelivery: poData.isInternalDelivery,
        };
        await createPurchaseOrder(newPO);
      }
    },
    {
      notifications: {
        successTitle: t('common.success'),
        successMessage: t(isEditMode ? 'po.updated' : 'po.created'),
      },
      onSuccess: () => {
        form.reset();
        navigate(isEditMode && id ? getPODetailRoute(id) : ROUTERS.PO_MANAGEMENT);
      },
    },
  );

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

  if (isEditMode && !canEdit) {
    return <PermissionDeniedPage />;
  }

  if (!isEditMode && !canCreate) {
    return <PermissionDeniedPage />;
  }

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
          isLoading={isLoading}
          error={error}
          onSubmit={handleSubmit.trigger}
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
      <AppPageTitle withGoBack title={pageTitle} route={ROUTERS.PO_MANAGEMENT} />
      <Container fluid>{content}</Container>
    </AppDesktopLayout>
  );
}
