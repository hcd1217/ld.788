import { useMemo, useState } from 'react';

import { Box, Button, Group, Paper, Stack, Text } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import { IconPlus, IconUpload } from '@tabler/icons-react';

import { CustomerCard, CustomerFormModal, type CustomerFormValues } from '@/components/app/config';
import {
  ActiveBadge,
  AppDesktopLayout,
  AppMobileLayout,
  AppPageTitle,
  BlankState,
  BulkImportModalContent,
  ContactInfo,
  DataTable,
  Pagination,
  PermissionDeniedPage,
  SearchBar,
  ViewOnMap,
} from '@/components/common';
import { useClientSidePagination } from '@/hooks/useClientSidePagination';
import { useDeviceType } from '@/hooks/useDeviceType';
import { useOnce } from '@/hooks/useOnce';
import { useSimpleSWRAction, useSWRAction } from '@/hooks/useSWRAction';
import { useTranslation } from '@/hooks/useTranslation';
import {
  type BulkUpsertCustomersRequest,
  type BulkUpsertCustomersResponse,
  type Customer,
  customerService,
} from '@/services/sales/customer';
import { useClientConfig, usePermissions } from '@/stores/useAppStore';
import { generateCustomerExcelTemplate, parseCustomerExcelFile } from '@/utils/excelParser';
import { showErrorNotification, showSuccessNotification } from '@/utils/notifications';
import {
  canCreateCustomer,
  canDeleteCustomer,
  canEditCustomer,
  canViewCustomer,
} from '@/utils/permission.utils';
import { validateEmail } from '@/utils/validation';

// Form values type will be imported from CustomerFormModal

export function CustomerConfigPage() {
  const { t, currentLanguage } = useTranslation();
  const { isMobile } = useDeviceType();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [createOpened, { open: openCreate, close: closeCreate }] = useDisclosure(false);
  const [editOpened, { open: openEdit, close: closeEdit }] = useDisclosure(false);
  const permissions = usePermissions();
  const clientConfig = useClientConfig();

  const { canView, canCreate, canEdit } = useMemo(() => {
    return {
      canView: canViewCustomer(permissions),
      canCreate: canCreateCustomer(permissions),
      canEdit: canEditCustomer(permissions),
      canDelete: canDeleteCustomer(permissions),
    };
  }, [permissions]);

  const { noEmail, noTaxCode } = useMemo(() => {
    return clientConfig.features?.customer ?? { noEmail: false, noTaxCode: false };
  }, [clientConfig]);

  const form = useForm<CustomerFormValues>({
    initialValues: {
      name: '',
      companyName: '',
      contactEmail: '',
      contactPhone: '',
      address: '',
      deliveryAddress: '',
      googleMapsUrl: '',
      pic: '',
      taxCode: '',
      isActive: true,
      memo: '',
    },
    validate: {
      name: (value) => (!value?.trim() ? t('validation.fieldRequired') : null),
      contactEmail: (value) => (value && value.length > 0 ? validateEmail(value, t) : null),
    },
  });

  // Filter customers based on search query
  const filteredCustomers = useMemo(() => {
    if (!searchQuery) return customers;
    const query = searchQuery.toLowerCase();
    return customers.filter(
      (customer) =>
        customer.name.toLowerCase().includes(query) ||
        customer.companyName?.toLowerCase().includes(query) ||
        customer.contactEmail?.toLowerCase().includes(query) ||
        customer.contactPhone?.toLowerCase().includes(query),
    );
  }, [customers, searchQuery]);

  // Use client-side pagination hook
  const [paginatedCustomers, paginationState, paginationHandlers] = useClientSidePagination({
    data: filteredCustomers,
    defaultPageSize: isMobile ? 1000 : 20,
  });

  const loadCustomersAction = useSimpleSWRAction(
    'load-customers',
    async () => {
      if (!canView) {
        return [];
      }
      setIsLoading(true);
      const data = await customerService.getAllCustomers();
      return data;
    },
    {
      notifications: {
        errorTitle: t('common.errors.notificationTitle'),
        errorMessage: t('common.loadingFailed'),
      },
      onSuccess: (data: Customer[]) => {
        setCustomers(data);
      },
      onSettled: () => {
        setIsLoading(false);
      },
    },
  );

  useOnce(() => {
    loadCustomersAction.trigger();
  });

  const createCustomerAction = useSWRAction(
    'create-customer',
    async (values: CustomerFormValues) => {
      if (!canCreate || !values) {
        throw new Error(t('common.addFailed', { entity: t('common.entity.customer') }));
      }
      const data = {
        name: values.name,
        companyName: values.companyName || undefined,
        contactEmail: values.contactEmail || undefined,
        contactPhone: values.contactPhone || undefined,
        address: values.address || undefined,
        deliveryAddress: values.deliveryAddress || undefined,
        googleMapsUrl: values.googleMapsUrl || undefined,
        taxCode: values.taxCode || undefined,
        isActive: true,
        memo: values.memo || undefined,
      };
      setIsLoading(true);
      const customer = await customerService.createCustomer(data);
      return customer;
    },
    {
      notifications: {
        errorTitle: t('common.errors.notificationTitle'),
        errorMessage: t('common.addFailed', { entity: t('common.entity.customer') }),
      },
      onSuccess: (customer) => {
        showSuccessNotification(
          t('customer.created'),
          t('customer.createdMessage', { name: customer.name }),
        );
        closeCreate();
        form.reset();
        loadCustomersAction.trigger();
      },
      onSettled: () => {
        setIsLoading(false);
      },
    },
  );

  const updateCustomerAction = useSWRAction(
    'update-customer',
    async (values: CustomerFormValues) => {
      if (!canEdit || !values || !selectedCustomer) {
        throw new Error(t('common.updateFailed', { entity: t('common.entity.customer') }));
      }
      setIsLoading(true);
      await customerService.updateCustomer(selectedCustomer.id, {
        name: values.name,
        companyName: values.companyName || undefined,
        contactEmail: values.contactEmail || undefined,
        contactPhone: values.contactPhone || undefined,
        address: values.address || undefined,
        deliveryAddress: values.deliveryAddress || undefined,
        googleMapsUrl: values.googleMapsUrl || undefined,
        memo: values.memo || undefined,
        pic: values.pic || undefined,
        taxCode: values.taxCode || undefined,
        isActive: values.isActive,
      });
      return selectedCustomer;
    },
    {
      notifications: {
        errorTitle: t('common.errors.notificationTitle'),
        errorMessage: t('common.updateFailed', { entity: t('common.entity.customer') }),
      },
      onSuccess: (customer) => {
        showSuccessNotification(
          t('customer.updated'),
          t('customer.updatedMessage', { name: customer.name }),
        );
        closeEdit();
        form.reset();
        loadCustomersAction.trigger();
      },
      onSettled: () => {
        setIsLoading(false);
      },
    },
  );

  const activateCustomerAction = useSWRAction(
    'activate-customer',
    async (customer: Customer) => {
      return await customerService.activateCustomer(customer);
    },
    {
      notifications: {
        errorTitle: t('common.errors.notificationTitle'),
        errorMessage: t('common.updateFailed', { entity: t('common.entity.customer') }),
      },
      onSuccess: () => {
        showSuccessNotification(
          t('common.activated', {
            entity: t('common.entity.customer'),
          }),
          t('customer.updatedMessage', { name: selectedCustomer?.name || '' }),
        );
        closeEdit();
        loadCustomersAction.trigger();
      },
      onSettled: () => {
        setIsLoading(false);
      },
    },
  );

  const deactivateCustomerAction = useSWRAction(
    'deactivate-customer',
    async (customer: Customer) => {
      return await customerService.deactivateCustomer(customer);
    },
    {
      notifications: {
        errorTitle: t('common.errors.notificationTitle'),
        errorMessage: t('common.updateFailed', { entity: t('common.entity.customer') }),
      },
      onSuccess: () => {
        showSuccessNotification(
          t('common.deactivated', {
            entity: t('common.entity.customer'),
          }),
          t('customer.updatedMessage', { name: selectedCustomer?.name || '' }),
        );
        closeEdit();
        loadCustomersAction.trigger();
      },
      onSettled: () => {
        setIsLoading(false);
      },
    },
  );

  const openEditModal = (customer: Customer) => {
    setSelectedCustomer(customer);
    form.setValues({
      name: customer.name,
      companyName: customer.companyName || '',
      contactEmail: customer.contactEmail || '',
      contactPhone: customer.contactPhone || '',
      address: customer.address || '',
      deliveryAddress: customer.deliveryAddress || '',
      googleMapsUrl: customer?.googleMapsUrl || '',
      taxCode: customer.taxCode || '',
      isActive: customer.isActive,
      memo: customer?.memo || '',
      pic: customer?.pic || '',
    });
    openEdit();
  };

  const openCreateModal = () => {
    if (!canCreate) {
      return;
    }
    form.reset();
    openCreate();
  };

  // Open bulk import modal
  const openBulkImportModal = () => {
    if (!canCreate) {
      return;
    }
    let selectedFile: File | undefined;

    modals.openConfirmModal({
      title: t('customer.bulkImport'),
      size: 'lg',
      children: (
        <BulkImportModalContent
          onFileSelect={(file) => {
            selectedFile = file;
          }}
          onDownloadTemplate={() =>
            generateCustomerExcelTemplate(currentLanguage, { noEmail, noTaxCode })
          }
          entityType="customer"
          language={currentLanguage}
        />
      ),
      labels: {
        confirm: t('common.import'),
        cancel: t('common.cancel'),
      },
      confirmProps: {
        loading: isLoading,
        leftSection: <IconUpload size={16} />,
      },
      onConfirm: () => {
        if (selectedFile) {
          handleExcelImportAction.trigger({ file: selectedFile });
        } else {
          showErrorNotification(t('common.errors.notificationTitle'), t('common.selectFile'));
        }
      },
    });
  };

  // Handle Excel file import
  const handleExcelImportAction = useSWRAction(
    'handle-excel-import',
    async (data: { file: File }): Promise<BulkUpsertCustomersResponse> => {
      if (!canCreate) {
        throw new Error(t('common.doNotHavePermissionForAction'));
      }
      if (!data?.file) {
        throw new Error(t('common.file.pleaseSelectFileFirst'));
      }
      const { file } = data;

      setIsLoading(true);

      // Parse Excel file
      const customers = await parseCustomerExcelFile(file);

      if (customers.length === 0) {
        throw new Error(t('customer.noValidDataFound'));
      }

      // Prepare request
      const request: BulkUpsertCustomersRequest = {
        customers: customers.map((c) => ({
          name: c.name,
          metadata: {
            companyName: c.companyName,
            contactEmail: c.contactEmail,
            contactPhone: c.contactPhone,
            address: c.address,
            googleMapsUrl: c.googleMapsUrl,
            taxCode: c.taxCode,
            isActive: true,
          },
        })),
        skipInvalid: false,
      };

      const result = await customerService.bulkUpsertCustomers(request);
      return result;
    },
    {
      notifications: {
        errorTitle: t('common.errors.notificationTitle'),
        errorMessage: t('common.bulkImport.importFailed', { entity: t('common.entity.customer') }),
      },
      onSuccess: async (result: BulkUpsertCustomersResponse) => {
        const message = t('common.bulkImportSuccess', {
          created: result.created,
          updated: result.updated,
          failed: result.failed,
        });
        showSuccessNotification(
          t('common.bulkImport.importSuccess', { entity: t('common.entity.customer') }),
          message,
        );
        modals.closeAll();
        loadCustomersAction.trigger();
      },
      onSettled: () => {
        setIsLoading(false);
      },
    },
  );

  if (!canView) {
    return <PermissionDeniedPage />;
  }

  if (isMobile) {
    return (
      <AppMobileLayout
        showLogo
        withGoBack
        isLoading={isLoading}
        error={undefined}
        clearError={() => {}}
        header={<AppPageTitle title={t('common.pages.customerManagement')} />}
      >
        {/* Sticky Search Bar */}
        <Box
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 100,
            backgroundColor: 'var(--mantine-color-body)',
            paddingTop: '0.5rem',
            paddingBottom: '0.5rem',
          }}
        >
          <SearchBar
            placeholder={t('customer.searchPlaceholder')}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        </Box>

        {/* Blank State for no results */}
        <BlankState
          hidden={paginatedCustomers.length > 0 || isLoading}
          title={searchQuery ? t('common.noDataFound') : t('common.noDataFound')}
          description={searchQuery ? t('common.tryDifferentSearch') : t('common.noDataFound')}
        />

        {/* Customer List */}
        <Box mt="md">
          {paginatedCustomers.length > 0 && (
            <Stack gap="sm" px="sm">
              {paginatedCustomers.map((customer) => (
                <CustomerCard key={customer.id} customer={customer} />
              ))}
            </Stack>
          )}
        </Box>

        {/* Pagination */}
        <Pagination
          totalPages={paginationState.totalPages}
          pageSize={paginationState.pageSize}
          currentPage={paginationState.currentPage}
          onPageSizeChange={paginationHandlers.setPageSize}
          onPageChange={paginationHandlers.setCurrentPage}
        />
      </AppMobileLayout>
    );
  }

  return (
    <AppDesktopLayout isLoading={isLoading && !createOpened && !editOpened}>
      {/* Page Title with Actions */}
      <Group justify="space-between" align="center" mb="xl">
        <AppPageTitle title={t('common.pages.customerManagement')} />
        <Group gap="sm">
          <Button
            variant="light"
            leftSection={<IconUpload size={16} />}
            disabled={!canCreate}
            onClick={openBulkImportModal}
          >
            {t('customer.bulkImport')}
          </Button>
          <Button
            disabled={!canCreate}
            leftSection={<IconPlus size={16} />}
            onClick={openCreateModal}
          >
            {t('common.add')}
          </Button>
        </Group>
      </Group>

      {/* Search Bar */}
      <SearchBar
        hidden={customers.length < 20}
        placeholder={t('customer.searchPlaceholder')}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Data Table */}
      <Paper withBorder shadow="md" p="md" radius="md">
        <DataTable
          data={paginatedCustomers as Customer[]}
          isLoading={false}
          emptyMessage={t('common.noDataFound')}
          onRowClick={openEditModal}
          columns={[
            {
              key: 'name',
              header: t('common.name'),
              render: (customer: Customer) => customer.name,
            },
            {
              key: 'companyName',
              header: t('customer.company'),
              render: (customer: Customer) => {
                const googleMapsUrl = customer?.googleMapsUrl || customer?.googleMapsUrl;
                return (
                  <Stack gap={4}>
                    <Group gap="xs">
                      <Text>{customer.companyName || '-'}</Text>
                      {customer.taxCode && (
                        <Text c="dimmed" size="xs" fw={600}>
                          (MST: {customer.taxCode})
                        </Text>
                      )}
                      <ViewOnMap googleMapsUrl={googleMapsUrl} />
                    </Group>
                    {customer.address && (
                      <Group gap={4}>
                        <Text size="sm" c="dimmed">
                          {customer.address}
                        </Text>
                      </Group>
                    )}
                  </Stack>
                );
              },
            },
            {
              key: 'contact',
              header: t('common.contact'),
              width: '200px',
              render: (customer: Customer) => <ContactInfo {...customer} />,
            },
            {
              key: 'status',
              width: '150px',
              header: t('common.status'),
              render: (customer: Customer) => <ActiveBadge isActive={customer.isActive} />,
            },
          ]}
        />
      </Paper>

      {/* Pagination */}
      <Pagination
        totalPages={paginationState.totalPages}
        pageSize={paginationState.pageSize}
        currentPage={paginationState.currentPage}
        onPageSizeChange={paginationHandlers.setPageSize}
        onPageChange={paginationHandlers.setCurrentPage}
      />

      <CustomerFormModal
        opened={createOpened}
        onClose={closeCreate}
        mode="create"
        form={form}
        onSubmit={createCustomerAction.trigger}
        isLoading={isLoading}
      />

      <CustomerFormModal
        opened={editOpened}
        onClose={closeEdit}
        mode="edit"
        form={form}
        customer={selectedCustomer}
        onSubmit={updateCustomerAction.trigger}
        onActivate={() => selectedCustomer && activateCustomerAction.trigger(selectedCustomer)}
        onDeactivate={() => selectedCustomer && deactivateCustomerAction.trigger(selectedCustomer)}
        isLoading={isLoading}
      />
    </AppDesktopLayout>
  );
}
