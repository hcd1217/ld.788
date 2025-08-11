import { useState, useMemo } from 'react';
import { Paper, Text, Stack, Group } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import { IconPlus } from '@tabler/icons-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useAction } from '@/hooks/useAction';
import {
  DataTable,
  AppDesktopLayout,
  AppPageTitle,
  SearchBar,
  Pagination,
  ActiveBadge,
} from '@/components/common';
import { CustomerFormModal } from '@/components/app/config';
import {
  customerService,
  type Customer,
  type CreateCustomerRequest,
  type UpdateCustomerRequest,
} from '@/services/sales/customer';
import { showSuccessNotification } from '@/utils/notifications';
import { validateEmail } from '@/utils/validation';
import { isDevelopment } from '@/utils/env';
import { useClientSidePagination } from '@/hooks/useClientSidePagination';
import { useOnce } from '@/hooks/useOnce';

export type CustomerFormValues = {
  name: string;
  companyName?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  taxCode?: string;
  isActive?: boolean;
};

// Helper function to render contact information
const renderContactInfo = (customer: Customer) => {
  const hasEmail = customer.contactEmail && customer.contactEmail.length > 0;
  const hasPhone = customer.contactPhone && customer.contactPhone.length > 0;

  if (!hasEmail && !hasPhone) {
    return '-';
  }

  if (hasEmail && hasPhone) {
    return (
      <Stack gap={4}>
        <Text size="sm">{customer.contactEmail}</Text>
        <Text size="sm" c="dimmed">
          {customer.contactPhone}
        </Text>
      </Stack>
    );
  }

  return hasEmail ? customer.contactEmail : customer.contactPhone;
};

export function CustomerConfigPage() {
  const { t } = useTranslation();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [editOpened, { open: openEdit, close: closeEdit }] = useDisclosure(false);
  const [createOpened, { open: openCreate, close: closeCreate }] = useDisclosure(false);

  const form = useForm<CustomerFormValues>({
    initialValues: isDevelopment
      ? {
          // cspell:disable
          name: 'CARMALL TYRE',
          companyName: 'CÔNG TY CỔ PHẦN CARMALL TYRE',
          contactEmail: '',
          contactPhone: '03-1234-2211',
          address:
            'Số 3 Đường số 32, Phường An Phú, Thành phố Thủ Đức, Thành phố Hồ Chí Minh, Việt Nam',
          taxCode: '0316162825',
          isActive: true,
          // cspell:enable
        }
      : {
          name: '',
          companyName: '',
          contactEmail: '',
          contactPhone: '',
          address: '',
          taxCode: '',
          isActive: true,
        },
    validate: {
      // name: (value) => (!value ? t('common.error') : null),
      contactEmail: (value) => {
        if (value && value.length > 0) {
          return validateEmail(value, t);
        }
        return null;
      },
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

  const loadCustomers = useAction<Record<string, never>>({
    options: {
      errorTitle: t('common.error'),
      errorMessage: t('common.loadingFailed'),
    },
    async actionHandler() {
      setIsLoading(true);
      setError(undefined);
      const data = await customerService.getAllCustomers();
      setCustomers(data);
    },
    errorHandler(err) {
      if (isDevelopment) {
        console.error('Failed to load customers:', err);
      }
      setError(t('common.loadingFailed'));
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
      if (!values) {
        throw new Error(t('common.addFailed'));
      }
      setIsLoading(true);
      const data: CreateCustomerRequest = {
        name: values.name,
        companyName: values.companyName || undefined,
        contactEmail: values.contactEmail || undefined,
        contactPhone: values.contactPhone || undefined,
        address: values.address || undefined,
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
      if (isDevelopment) {
        console.error('Failed to create customer:', error);
      }
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
      if (!values || !selectedCustomer) {
        throw new Error(t('po.customerNotFound'));
      }
      setIsLoading(true);
      const data: UpdateCustomerRequest = {
        name: values.name,
        companyName: values.companyName || undefined,
        contactEmail: values.contactEmail || undefined,
        contactPhone: values.contactPhone || undefined,
        address: values.address || undefined,
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
      if (isDevelopment) {
        console.error('Failed to update customer:', error);
      }
    },
    cleanupHandler() {
      setIsLoading(false);
    },
  });

  const confirmDeleteCustomer = useAction<{ customer: Customer }>({
    options: {
      successTitle: t('customer.deleted'),
      errorTitle: t('common.error'),
      errorMessage: t('common.deleteFailed'),
    },
    async actionHandler(values) {
      if (!values?.customer) {
        throw new Error(t('po.customerNotFound'));
      }
      setIsLoading(true);
      await customerService.deleteCustomer(values.customer.id);
      // Success message is handled by options with dynamic customer name
      showSuccessNotification(
        t('customer.deleted'),
        t('customer.deletedMessage', { name: values.customer.name }),
      );
      await loadCustomers();
    },
    errorHandler(error) {
      if (isDevelopment) {
        console.error('Failed to delete customer:', error);
      }
    },
    cleanupHandler() {
      setIsLoading(false);
    },
  });

  const handleDeleteCustomer = (customer: Customer) => {
    modals.openConfirmModal({
      title: t('common.confirmDelete'),
      children: <Text size="sm">{t('common.confirmDeleteMessage', { name: customer.name })}</Text>,
      labels: { confirm: t('common.delete'), cancel: t('common.cancel') },
      confirmProps: { color: 'red' },
      onConfirm: () => confirmDeleteCustomer({ customer }),
    });
  };

  const openEditModal = (customer: Customer) => {
    setSelectedCustomer(customer);
    form.setValues({
      name: customer.name,
      companyName: customer.companyName || '',
      contactEmail: customer.contactEmail || '',
      contactPhone: customer.contactPhone || '',
      address: customer.address || '',
      taxCode: customer.taxCode || '',
      isActive: customer.isActive,
    });
    openEdit();
  };

  const openCreateModal = () => {
    form.reset();
    openCreate();
  };

  return (
    <AppDesktopLayout
      isLoading={isLoading && !createOpened && !editOpened}
      error={error}
      clearError={() => {
        setError(undefined);
      }}
    >
      {/* Page Title with Actions */}
      <AppPageTitle
        title={t('common.pages.customerManagement')}
        button={{
          label: t('common.add'),
          onClick: openCreateModal,
          icon: <IconPlus size={16} />,
        }}
      />

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
          /**
           *  🎯 Minor Observations (Not Issues)
           *
           *  1. Type Assertion vs Type Guard
           *
           *  data={paginatedCustomers as Customer[]}
           *  While the type assertion works, a more robust approach would be:
           *  // Alternative: Type guard or proper typing in hook
           *  data={paginatedCustomers}
           *  Verdict: Acceptable given the hook's readonly constraint
           */
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
              render: (customer: Customer) => (
                <Group gap="xs">
                  {customer.companyName || '-'}
                  {customer.taxCode ? (
                    <Text c="dimmed" ml={2} size="xs" fw={600}>
                      (MST: {customer.taxCode})
                    </Text>
                  ) : (
                    ''
                  )}
                </Group>
              ),
            },
            {
              key: 'contact',
              header: t('customer.contact'),
              width: '200px',
              render: renderContactInfo,
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

      {/* Create Customer Modal */}
      <CustomerFormModal
        opened={createOpened}
        onClose={closeCreate}
        mode="create"
        form={form}
        onSubmit={handleCreateCustomer}
        isLoading={isLoading}
      />

      {/* Edit Customer Modal */}
      <CustomerFormModal
        opened={editOpened}
        onClose={closeEdit}
        mode="edit"
        form={form}
        onSubmit={handleUpdateCustomer}
        onDelete={() => {
          if (selectedCustomer) {
            handleDeleteCustomer(selectedCustomer);
            closeEdit();
          }
        }}
        isLoading={isLoading}
      />
    </AppDesktopLayout>
  );
}
