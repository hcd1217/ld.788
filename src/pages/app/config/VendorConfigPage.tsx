import { useMemo } from 'react';

import { Box, Button, Group, Paper, Stack, Text } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconPlus, IconUpload } from '@tabler/icons-react';

import { VendorCard, VendorFormModal, type VendorFormValues } from '@/components/app/config';
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
} from '@/components/common';
import { useConfigPage } from '@/hooks/useConfigPage';
import { useDeviceType } from '@/hooks/useDeviceType';
import { useTranslation } from '@/hooks/useTranslation';
import type { BulkUpsertVendorsRequest, BulkUpsertVendorsResponse, Vendor } from '@/services/sales';
// eslint-disable-next-line import/order
import { vendorService } from '@/services/sales';

// Use the service's expected types
type CreateVendorRequest = Parameters<typeof vendorService.createVendor>[0];
type UpdateVendorRequest = Parameters<typeof vendorService.updateVendor>[1];
import { useClientConfig, usePermissions } from '@/stores/useAppStore';
import { generateVendorExcelTemplate, parseVendorExcelFile } from '@/utils/excelParser';
import { canCreateVendor, canEditVendor, canViewVendor } from '@/utils/permission.utils';
import { validateEmail } from '@/utils/validation';

export function VendorConfigPage() {
  const { t } = useTranslation();
  const { isMobile } = useDeviceType();
  const permissions = usePermissions();
  const clientConfig = useClientConfig();

  const { canView, canCreate, canEdit } = useMemo(() => {
    return {
      canView: canViewVendor(permissions),
      canCreate: canCreateVendor(permissions),
      canEdit: canEditVendor(permissions),
    };
  }, [permissions]);

  const { noEmail, noTaxCode } = useMemo(() => {
    return clientConfig.features?.vendor ?? { noEmail: false, noTaxCode: false };
  }, [clientConfig]);

  const form = useForm<VendorFormValues>({
    initialValues: {
      name: '',
      contactEmail: '',
      contactPhone: '',
      pic: '',
      googleMapsUrl: '',
      address: '',
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
      getAll: vendorService.getAllVendors,
      create: vendorService.createVendor,
      update: vendorService.updateVendor,
      activate: vendorService.activateVendor,
      deactivate: vendorService.deactivateVendor,
      bulkUpsert: vendorService.bulkUpsertVendors,
    }),
    [],
  );

  const {
    allItems: vendors,
    createOpened,
    editOpened,
    error,
    isLoading,
    items: paginatedVendors,
    paginationHandlers,
    paginationState,
    searchQuery,
    selectedItem: selectedVendor,
    clearError,
    closeCreate,
    closeEdit,
    handleActivate,
    handleCreate,
    handleDeactivate,
    handleUpdate,
    openBulkImportModal,
    openCreateModal,
    openEditModal,
    setSearchQuery,
  } = useConfigPage<
    Vendor,
    VendorFormValues,
    CreateVendorRequest,
    UpdateVendorRequest,
    BulkUpsertVendorsRequest,
    BulkUpsertVendorsResponse
  >({
    service,
    permissions: { canView, canCreate, canEdit },
    entityName: 'vendor',
    form,
    transformToCreateRequest: (values) => ({
      name: values.name,
      contactEmail: values.contactEmail || undefined,
      contactPhone: values.contactPhone || undefined,
      address: values.address || undefined,
      taxCode: values.taxCode || undefined,
      googleMapsUrl: values.googleMapsUrl || undefined,
      pic: values.pic || undefined,
      isActive: true,
      memo: values.memo || undefined,
    }),
    transformToUpdateRequest: (values) => ({
      name: values.name,
      contactEmail: values.contactEmail || undefined,
      contactPhone: values.contactPhone || undefined,
      address: values.address || undefined,
      googleMapsUrl: values.googleMapsUrl || undefined,
      pic: values.pic || undefined,
      memo: values.memo || undefined,
      taxCode: values.taxCode || undefined,
      isActive: values.isActive,
    }),
    transformToBulkRequest: (vendors) => ({
      vendors: vendors.map((v) => ({
        name: v.name,
        metadata: {
          contactEmail: v.contactEmail,
          contactPhone: v.contactPhone,
          address: v.address,
          taxCode: v.taxCode,
          isActive: true,
        },
      })),
      skipInvalid: false,
    }),
    parseExcelFile: parseVendorExcelFile,
    generateExcelTemplate: (language) =>
      generateVendorExcelTemplate(language, { noEmail, noTaxCode }),
    setFormValues: (vendor, form) => {
      form.setValues({
        name: vendor.name,
        contactEmail: vendor.contactEmail || '',
        contactPhone: vendor.contactPhone || '',
        address: vendor.address || '',
        taxCode: vendor.taxCode || '',
        isActive: vendor.isActive,
        googleMapsUrl: vendor.googleMapsUrl || '',
        pic: vendor.pic || '',
        memo: vendor?.memo || '',
      });
    },
    searchFilter: (vendor, query) =>
      vendor.name.toLowerCase().includes(query) ||
      (vendor.contactEmail?.toLowerCase().includes(query) ?? false) ||
      (vendor.contactPhone?.toLowerCase().includes(query) ?? false),
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
        header={<AppPageTitle title={t('common.pages.vendorManagement')} />}
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
            placeholder={t('vendor.searchPlaceholder')}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        </Box>

        {/* Blank State for no results */}
        <BlankState
          hidden={paginatedVendors.length > 0 || isLoading}
          title={t('common.noDataFound')}
          description={searchQuery ? t('common.tryDifferentSearch') : t('common.noDataFound')}
        />

        {/* Vendor List */}
        <Box mb="xl">
          {paginatedVendors.length > 0 && (
            <Stack gap="sm" px="sm">
              {paginatedVendors.map((vendor) => (
                <VendorCard key={vendor.id} vendor={vendor} />
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
        <AppPageTitle title={t('common.pages.vendorManagement')} />
        <Group gap="sm">
          <Button
            variant="light"
            leftSection={<IconUpload size={16} />}
            disabled={!canCreate}
            onClick={() => openBulkImportModal({})}
          >
            {t('vendor.bulkImport')}
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
        hidden={vendors.length < 20}
        placeholder={t('vendor.searchPlaceholder')}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Data Table */}
      <Paper withBorder shadow="md" p="md" radius="md">
        <DataTable
          withIndex
          indexStart={(paginationState.currentPage - 1) * paginationState.pageSize + 1}
          data={paginatedVendors as Vendor[]}
          emptyMessage={t('common.noDataFound')}
          onRowClick={openEditModal}
          columns={[
            {
              width: '200px',
              key: 'name',
              header: t('common.name'),
              render: (vendor: Vendor) => vendor.name,
            },
            {
              key: 'address',
              header: t('vendor.address'),
              render: (vendor: Vendor) => {
                return (
                  <Stack gap={4}>
                    <Group gap="xs">
                      <Text>{vendor.address || '-'}</Text>
                      {vendor.taxCode && (
                        <Text c="dimmed" size="xs" fw={600}>
                          (MST: {vendor.taxCode})
                        </Text>
                      )}
                    </Group>
                  </Stack>
                );
              },
            },
            {
              key: 'contact',
              header: t('common.contact'),
              width: '200px',
              render: (vendor: Vendor) => <ContactInfo {...vendor} />,
            },
            {
              key: 'status',
              width: '150px',
              header: t('common.status'),
              render: (vendor: Vendor) => <ActiveBadge isActive={vendor.isActive} />,
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

      <VendorFormModal
        opened={createOpened}
        onClose={closeCreate}
        mode="create"
        form={form}
        onSubmit={handleCreate}
        isLoading={isLoading}
      />

      <VendorFormModal
        opened={editOpened}
        onClose={closeEdit}
        mode="edit"
        form={form}
        vendor={selectedVendor}
        onSubmit={handleUpdate}
        onActivate={() => selectedVendor && handleActivate(selectedVendor)}
        onDeactivate={() => selectedVendor && handleDeactivate(selectedVendor)}
        isLoading={isLoading}
      />
    </AppDesktopLayout>
  );
}
