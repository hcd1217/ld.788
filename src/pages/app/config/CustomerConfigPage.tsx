import { useMemo, useState } from 'react';

import { Button, Group, Paper, Stack, Text } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import { IconPlus, IconUpload } from '@tabler/icons-react';

import { CustomerFormModal, type CustomerFormValues } from '@/components/app/config';
import {
  ActiveBadge,
  AppDesktopLayout,
  AppPageTitle,
  BulkImportModalContent,
  ContactInfo,
  DataTable,
  Pagination,
  PermissionDeniedPage,
  SearchBar,
  ViewOnMap,
} from '@/components/common';
import { useClientSidePagination } from '@/hooks/useClientSidePagination';
import { useOnce } from '@/hooks/useOnce';
import { useSimpleSWRAction, useSWRAction } from '@/hooks/useSWRAction';
import { useTranslation } from '@/hooks/useTranslation';
import {
  type BulkUpsertCustomersRequest,
  type BulkUpsertCustomersResponse,
  type Customer,
  customerService,
} from '@/services/sales/customer';
import { usePermissions } from '@/stores/useAppStore';
import { generateCustomerExcelTemplate, parseCustomerExcelFile } from '@/utils/excelParser';
import { showErrorNotification, showSuccessNotification } from '@/utils/notifications';
import { validateEmail } from '@/utils/validation';

// Form values type will be imported from CustomerFormModal

export function CustomerConfigPage() {
  const { t, i18n } = useTranslation();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [createOpened, { open: openCreate, close: closeCreate }] = useDisclosure(false);
  const [editOpened, { open: openEdit, close: closeEdit }] = useDisclosure(false);
  const permissions = usePermissions();

  const form = useForm<CustomerFormValues>({
    initialValues: {
      name: '',
      companyName: '',
      contactEmail: '',
      contactPhone: '',
      address: '',
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
    defaultPageSize: 20,
  });

  const loadCustomersAction = useSimpleSWRAction(
    'load-customers',
    async () => {
      if (!permissions.customer.canView) {
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
      if (!permissions.customer.canCreate || !values) {
        throw new Error(t('common.addFailed', { entity: t('common.entity.customer') }));
      }
      const data = {
        name: values.name,
        companyName: values.companyName || undefined,
        contactEmail: values.contactEmail || undefined,
        contactPhone: values.contactPhone || undefined,
        address: values.address || undefined,
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
      if (!permissions.customer.canEdit || !values || !selectedCustomer) {
        throw new Error(t('common.updateFailed', { entity: t('common.entity.customer') }));
      }
      setIsLoading(true);
      return await customerService.updateCustomer(selectedCustomer.id, {
        name: values.name,
        companyName: values.companyName || undefined,
        contactEmail: values.contactEmail || undefined,
        contactPhone: values.contactPhone || undefined,
        address: values.address || undefined,
        googleMapsUrl: values.googleMapsUrl || undefined,
        memo: values.memo || undefined,
        pic: values.pic || undefined,
        taxCode: values.taxCode || undefined,
        isActive: values.isActive,
      });
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

  const deleteCustomerAction = useSWRAction(
    'delete-customer',
    async (customer: Customer) => {
      return await customerService.deleteCustomer(customer.id);
    },
    {
      notifications: {
        errorTitle: t('common.errors.notificationTitle'),
        errorMessage: t('common.deleteFailed', { entity: t('common.entity.customer') }),
      },
      onSuccess: () => {
        showSuccessNotification(
          t('customer.deleted'),
          t('customer.deletedMessage', { name: selectedCustomer?.name || '' }),
        );
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
      googleMapsUrl: customer?.googleMapsUrl || '',
      taxCode: customer.taxCode || '',
      isActive: customer.isActive,
      memo: customer?.memo || '',
      pic: customer?.pic || '',
    });
    openEdit();
  };

  const openCreateModal = () => {
    if (!permissions.customer.canCreate) {
      return;
    }
    form.reset();
    openCreate();
  };

  const confirmDelete = (customer: Customer) => {
    if (!permissions.customer.canDelete) {
      throw new Error(t('common.deleteFailed', { entity: t('common.entity.customer') }));
    }
    modals.openConfirmModal({
      title: t('common.confirmDelete'),
      children: <Text size="sm">{t('common.confirmDeleteMessage', { name: customer.name })}</Text>,
      labels: { confirm: t('common.delete'), cancel: t('common.cancel') },
      confirmProps: { color: 'red' },
      onConfirm: () => deleteCustomerAction.trigger(customer),
    });
  };

  // Open bulk import modal
  const openBulkImportModal = () => {
    if (!permissions.customer.canCreate) {
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
          onDownloadTemplate={() => generateCustomerExcelTemplate(i18n.language)}
          entityType="customer"
          language={i18n.language}
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
      if (!permissions.customer.canCreate) {
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
          companyName: c.companyName,
          contactEmail: c.contactEmail,
          contactPhone: c.contactPhone,
          address: c.address,
          metadata: {
            googleMapsUrl: c.googleMapsUrl,
          },
          taxCode: c.taxCode,
        })),
        skipInvalid: false,
      };

      const result = await customerService.bulkUpsertCustomers(request);
      return result;
    },
    {
      notifications: {
        errorTitle: t('common.errors.notificationTitle'),
        errorMessage: t('auth.importFailed'),
      },
      onSuccess: async (result: BulkUpsertCustomersResponse) => {
        const message = t('customer.bulkImportSuccess', {
          created: result.created,
          updated: result.updated,
          failed: result.failed,
        });
        showSuccessNotification(t('auth.importSuccess'), message);
        modals.closeAll();
        loadCustomersAction.trigger();
      },
      onSettled: () => {
        setIsLoading(false);
      },
    },
  );

  if (!permissions.customer.canView) {
    return <PermissionDeniedPage />;
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
            disabled={!permissions.customer.canCreate}
            onClick={openBulkImportModal}
          >
            {t('customer.bulkImport')}
          </Button>
          <Button
            disabled={!permissions.customer.canCreate}
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
          ariaLabel={t('customer.tableAriaLabel')}
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
        canCreate={permissions.customer.canCreate}
        canEdit={permissions.customer.canEdit}
        canDelete={permissions.customer.canDelete}
        form={form}
        onSubmit={createCustomerAction.trigger}
        isLoading={isLoading}
      />

      <CustomerFormModal
        opened={editOpened}
        onClose={closeEdit}
        mode="edit"
        canCreate={permissions.customer.canCreate}
        canEdit={permissions.customer.canEdit}
        canDelete={permissions.customer.canDelete}
        form={form}
        onSubmit={updateCustomerAction.trigger}
        onDelete={() => {
          if (selectedCustomer) {
            confirmDelete(selectedCustomer);
            closeEdit();
          }
        }}
        isLoading={isLoading}
      />
    </AppDesktopLayout>
  );
}
