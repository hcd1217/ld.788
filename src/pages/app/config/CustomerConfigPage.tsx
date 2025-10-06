import { useMemo } from 'react';

import { Box, Button, Group, Paper, Stack, Text } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconPlus, IconUpload } from '@tabler/icons-react';

import { CustomerCard, CustomerFormModal, type CustomerFormValues } from '@/components/app/config';
import {
  ActiveBadge,
  AppDesktopLayout,
  AppMobileLayout,
  AppPageTitle,
  BlankState,
  ContactInfo,
  DataTable,
  Pagination,
  PermissionDeniedPage,
  SearchBar,
  ViewOnMap,
} from '@/components/common';
import { useConfigPage } from '@/hooks/useConfigPage';
import { useDeviceType } from '@/hooks/useDeviceType';
import { useTranslation } from '@/hooks/useTranslation';
import type {
  BulkUpsertCustomersRequest,
  BulkUpsertCustomersResponse,
  Customer,
} from '@/services/sales';
// eslint-disable-next-line import/order
import { customerService } from '@/services/sales';

// Use the service's expected types
type CreateCustomerRequest = Parameters<typeof customerService.createCustomer>[0];
type UpdateCustomerRequest = Parameters<typeof customerService.updateCustomer>[1];
import { useClientConfig, usePermissions } from '@/stores/useAppStore';
import { generateCustomerExcelTemplate, parseCustomerExcelFile } from '@/utils/excelParser';
import { canCreateCustomer, canEditCustomer, canViewCustomer } from '@/utils/permission.utils';
import { validateEmail } from '@/utils/validation';

export function CustomerConfigPage() {
  const { t } = useTranslation();
  const { isMobile } = useDeviceType();
  const permissions = usePermissions();
  const clientConfig = useClientConfig();

  const { canView, canCreate, canEdit } = useMemo(() => {
    return {
      canView: canViewCustomer(permissions),
      canCreate: canCreateCustomer(permissions),
      canEdit: canEditCustomer(permissions),
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

  // Service adapter for the generic hook
  const service = useMemo(
    () => ({
      getAll: customerService.getAllCustomers,
      create: customerService.createCustomer,
      update: customerService.updateCustomer,
      activate: customerService.activateCustomer,
      deactivate: customerService.deactivateCustomer,
      bulkUpsert: customerService.bulkUpsertCustomers,
    }),
    [],
  );

  const {
    items: paginatedCustomers,
    allItems: customers,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    selectedItem: selectedCustomer,
    editOpened,
    createOpened,
    closeEdit,
    closeCreate,
    handleCreate,
    handleUpdate,
    handleActivate,
    handleDeactivate,
    openEditModal,
    openCreateModal,
    openBulkImportModal,
    paginationState,
    paginationHandlers,
    clearError,
  } = useConfigPage<
    Customer,
    CustomerFormValues,
    CreateCustomerRequest,
    UpdateCustomerRequest,
    BulkUpsertCustomersRequest,
    BulkUpsertCustomersResponse
  >({
    service,
    permissions: { canView, canCreate, canEdit },
    entityName: 'customer',
    form,
    transformToCreateRequest: (values) => ({
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
    }),
    transformToUpdateRequest: (values) => ({
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
    }),
    transformToBulkRequest: (customers) => ({
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
    }),
    parseExcelFile: parseCustomerExcelFile,
    generateExcelTemplate: (language) =>
      generateCustomerExcelTemplate(language, { noEmail, noTaxCode }),
    setFormValues: (customer, form) => {
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
    },
    searchFilter: (customer, query) =>
      customer.name.toLowerCase().includes(query) ||
      (customer.companyName?.toLowerCase().includes(query) ?? false) ||
      (customer.contactEmail?.toLowerCase().includes(query) ?? false) ||
      (customer.contactPhone?.toLowerCase().includes(query) ?? false),
  });

  if (!canView) {
    return <PermissionDeniedPage />;
  }

  if (isMobile) {
    return (
      <AppMobileLayout
        showLogo
        withGoBack
        isLoading={isLoading}
        error={error}
        clearError={clearError}
        header={<AppPageTitle title={t('common.pages.customerManagement')} />}
      >
        {/* Sticky Search Bar */}
        <Box
          py="xs"
          bg="var(--mantine-color-body)"
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 100,
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
          title={t('common.noDataFound')}
          description={searchQuery ? t('common.tryDifferentSearch') : t('common.noDataFound')}
        />

        {/* Customer List */}
        <Box mb="xl">
          {paginatedCustomers.length > 0 && (
            <Stack gap="sm" px="sm">
              {paginatedCustomers.map((customer) => (
                <CustomerCard key={customer.id} customer={customer} />
              ))}
            </Stack>
          )}
        </Box>
      </AppMobileLayout>
    );
  }

  return (
    <AppDesktopLayout
      isLoading={isLoading && !createOpened && !editOpened}
      error={error}
      clearError={clearError}
    >
      {/* Page Title with Actions */}
      <Group justify="space-between" align="center" mb="xl">
        <AppPageTitle title={t('common.pages.customerManagement')} />
        <Group gap="sm">
          <Button
            variant="light"
            leftSection={<IconUpload size={16} />}
            disabled={!canCreate}
            onClick={() => openBulkImportModal({ noEmail, noTaxCode })}
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
          withIndex
          indexStart={(paginationState.currentPage - 1) * paginationState.pageSize + 1}
          data={paginatedCustomers as Customer[]}
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
                const googleMapsUrl = customer?.googleMapsUrl;
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
        onSubmit={handleCreate}
        isLoading={isLoading}
      />

      <CustomerFormModal
        opened={editOpened}
        onClose={closeEdit}
        mode="edit"
        form={form}
        customer={selectedCustomer}
        onSubmit={handleUpdate}
        onActivate={() => selectedCustomer && handleActivate(selectedCustomer)}
        onDeactivate={() => selectedCustomer && handleDeactivate(selectedCustomer)}
        isLoading={isLoading}
      />
    </AppDesktopLayout>
  );
}
