import { useState, useMemo } from 'react';
import { Paper, Text, Group, Button, Stack, ActionIcon, Tooltip } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import { IconPlus, IconUpload, IconMapPin } from '@tabler/icons-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useAction } from '@/hooks/useAction';
import {
  DataTable,
  AppDesktopLayout,
  AppPageTitle,
  SearchBar,
  Pagination,
  ActiveBadge,
  ContactInfo,
  BulkImportModalContent,
} from '@/components/common';
import { CustomerFormModal, type CustomerFormValues } from '@/components/app/config';
import {
  customerService,
  type Customer,
  type CreateCustomerRequest,
  type UpdateCustomerRequest,
  type BulkUpsertCustomersRequest,
} from '@/services/sales/customer';
import { showSuccessNotification, showErrorNotification } from '@/utils/notifications';
import { validateEmail } from '@/utils/validation';
import { useClientSidePagination } from '@/hooks/useClientSidePagination';
import { useOnce } from '@/hooks/useOnce';
import { logError } from '@/utils/logger';
import { parseCustomerExcelFile, generateCustomerExcelTemplate } from '@/utils/excelParser';

// Form values type will be imported from CustomerFormModal

export function CustomerConfigPage() {
  const { t, i18n } = useTranslation();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [createOpened, { open: openCreate, close: closeCreate }] = useDisclosure(false);
  const [editOpened, { open: openEdit, close: closeEdit }] = useDisclosure(false);

  const form = useForm<CustomerFormValues>({
    initialValues: {
      name: '',
      companyName: '',
      contactEmail: '',
      contactPhone: '',
      address: '',
      googleMapsUrl: '',
      taxCode: '',
      isActive: true,
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

  const loadCustomers = useAction({
    options: {
      errorTitle: t('common.error'),
      errorMessage: t('common.loadingFailed'),
    },
    async actionHandler() {
      setIsLoading(true);
      const data = await customerService.getAllCustomers();
      setCustomers(data);
    },
    errorHandler(err) {
      logError('Failed to load customers:', err, {
        module: 'CustomerConfigPage',
        action: 'loadCustomers',
      });
    },
    cleanupHandler() {
      setIsLoading(false);
    },
  });

  useOnce(() => {
    loadCustomers();
  });

  const handleCreateCustomer = useAction<CustomerFormValues>({
    options: {
      errorTitle: t('common.error'),
      errorMessage: t('common.addFailed'),
    },
    async actionHandler(values) {
      if (!values) return;

      setIsLoading(true);
      const data: CreateCustomerRequest = {
        name: values.name,
        companyName: values.companyName || undefined,
        contactEmail: values.contactEmail || undefined,
        contactPhone: values.contactPhone || undefined,
        address: values.address || undefined,
        metadata: {
          googleMapsUrl: values.googleMapsUrl || undefined,
        },
        taxCode: values.taxCode || undefined,
      };

      await customerService.createCustomer(data);
      showSuccessNotification(
        t('customer.created'),
        t('customer.createdMessage', { name: values.name }),
      );
      closeCreate();
      form.reset();
      await loadCustomers();
    },
    errorHandler(error) {
      logError('Failed to create customer:', error, {
        module: 'CustomerConfigPage',
        action: 'handleCreateCustomer',
      });
    },
    cleanupHandler() {
      setIsLoading(false);
    },
  });

  const handleUpdateCustomer = useAction<CustomerFormValues>({
    options: {
      errorTitle: t('common.error'),
      errorMessage: t('common.updateFailed'),
    },
    async actionHandler(values) {
      if (!values || !selectedCustomer) return;

      setIsLoading(true);
      const data: UpdateCustomerRequest = {
        name: values.name,
        companyName: values.companyName || undefined,
        contactEmail: values.contactEmail || undefined,
        contactPhone: values.contactPhone || undefined,
        address: values.address || undefined,
        metadata: {
          googleMapsUrl: values.googleMapsUrl || undefined,
        },
        taxCode: values.taxCode || undefined,
        isActive: values.isActive,
      };

      await customerService.updateCustomer(selectedCustomer.id, data);
      showSuccessNotification(
        t('customer.updated'),
        t('customer.updatedMessage', { name: values.name }),
      );
      closeEdit();
      await loadCustomers();
    },
    errorHandler(error) {
      logError('Failed to update customer:', error, {
        module: 'CustomerConfigPage',
        action: 'handleUpdateCustomer',
      });
    },
    cleanupHandler() {
      setIsLoading(false);
    },
  });

  const handleDelete = useAction<Customer>({
    options: {
      errorTitle: t('common.error'),
      errorMessage: t('common.deleteFailed'),
    },
    async actionHandler(customer) {
      if (!customer) return;

      setIsLoading(true);
      await customerService.deleteCustomer(customer.id);
      showSuccessNotification(
        t('customer.deleted'),
        t('customer.deletedMessage', { name: customer.name }),
      );
      await loadCustomers();
    },
    errorHandler(error) {
      logError('Failed to delete customer:', error, {
        module: 'CustomerConfigPage',
        action: 'handleDelete',
      });
    },
    cleanupHandler() {
      setIsLoading(false);
    },
  });

  const openEditModal = (customer: Customer) => {
    setSelectedCustomer(customer);
    form.setValues({
      name: customer.name,
      companyName: customer.companyName || '',
      contactEmail: customer.contactEmail || '',
      contactPhone: customer.contactPhone || '',
      address: customer.address || '',
      googleMapsUrl: customer.metadata?.googleMapsUrl || '',
      taxCode: customer.taxCode || '',
      isActive: customer.isActive,
    });
    openEdit();
  };

  const openCreateModal = () => {
    form.reset();
    openCreate();
  };

  const confirmDelete = (customer: Customer) => {
    modals.openConfirmModal({
      title: t('common.confirmDelete'),
      children: <Text size="sm">{t('common.confirmDeleteMessage', { name: customer.name })}</Text>,
      labels: { confirm: t('common.delete'), cancel: t('common.cancel') },
      confirmProps: { color: 'red' },
      onConfirm: () => handleDelete(customer),
    });
  };

  // Open bulk import modal
  const openBulkImportModal = () => {
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
          handleExcelImport({ file: selectedFile });
        } else {
          showErrorNotification(t('common.error'), t('common.selectFile'));
        }
      },
    });
  };

  // Handle Excel file import
  const handleExcelImport = useAction<{ file: File }>({
    options: {
      errorTitle: t('common.error'),
      errorMessage: t('auth.importFailed'),
    },
    async actionHandler(data) {
      if (!data?.file) return;
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

      // Show results
      const message = t('customer.bulkImportSuccess', {
        created: result.created,
        updated: result.updated,
        failed: result.failed,
      });

      showSuccessNotification(t('auth.importSuccess'), message);
      modals.closeAll();
      await loadCustomers();
    },
    errorHandler(error) {
      logError('Failed to import customers from Excel:', error, {
        module: 'CustomerConfigPage',
        action: 'handleExcelImport',
      });
    },
    cleanupHandler() {
      setIsLoading(false);
    },
  });

  return (
    <AppDesktopLayout isLoading={isLoading && !createOpened && !editOpened}>
      {/* Page Title with Actions */}
      <Group justify="space-between" align="center" mb="xl">
        <AppPageTitle title={t('common.pages.customerManagement')} />
        <Group gap="sm">
          <Button
            variant="light"
            leftSection={<IconUpload size={16} />}
            onClick={openBulkImportModal}
          >
            {t('customer.bulkImport')}
          </Button>
          <Button leftSection={<IconPlus size={16} />} onClick={openCreateModal}>
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
                const googleMapsUrl = customer.metadata?.googleMapsUrl || customer.googleMapsUrl;
                return (
                  <Stack gap={4}>
                    <Group gap="xs">
                      <Text>{customer.companyName || '-'}</Text>
                      {customer.taxCode && (
                        <Text c="dimmed" size="xs" fw={600}>
                          (MST: {customer.taxCode})
                        </Text>
                      )}
                      {googleMapsUrl && (
                        <Tooltip label={t('customer.viewOnMap')}>
                          <ActionIcon
                            size="xs"
                            variant="subtle"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(googleMapsUrl, '_blank', 'noopener,noreferrer');
                            }}
                          >
                            <IconMapPin size={14} />
                          </ActionIcon>
                        </Tooltip>
                      )}
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
        hidden={paginationState.totalPages < 2}
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
        onSubmit={handleCreateCustomer}
        isLoading={isLoading}
      />

      <CustomerFormModal
        opened={editOpened}
        onClose={closeEdit}
        mode="edit"
        form={form}
        onSubmit={handleUpdateCustomer}
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
