import { useState, useEffect, useCallback, useMemo } from 'react';
import { Paper, Text, Stack } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import { IconPlus } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import {
  DataTable,
  PCOnlyAlert,
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
import { showErrorNotification, showSuccessNotification } from '@/utils/notifications';
import { validateEmail } from '@/utils/validation';
import { isDevelopment } from '@/utils/env';
import { useIsDesktop } from '@/hooks/useIsDesktop';
import { useClientSidePagination } from '@/hooks/useClientSidePagination';

export type CustomerFormValues = {
  name: string;
  companyName?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
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
  const isDesktop = useIsDesktop();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [editOpened, { open: openEdit, close: closeEdit }] = useDisclosure(false);
  const [createOpened, { open: openCreate, close: closeCreate }] = useDisclosure(false);

  const form = useForm<CustomerFormValues>({
    initialValues: {
      name: '',
      companyName: '',
      contactEmail: '',
      contactPhone: '',
      address: '',
      isActive: true,
    },
    validate: {
      name: (value) => (!value ? t('common.error') : null),
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
    defaultPageSize: 10,
  });

  const loadCustomers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(undefined);
      const data = await customerService.getAllCustomers();
      setCustomers(data);
    } catch (err) {
      if (isDevelopment) {
        console.error('Failed to load customers:', err);
      }
      setError(t('common.loadingFailed'));
      showErrorNotification(t('common.error'), t('common.loadingFailed'));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  const clearError = useCallback(() => {
    setError(undefined);
  }, []);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  const handleCreateCustomer = async (values: CustomerFormValues) => {
    try {
      setIsLoading(true);
      const data: CreateCustomerRequest = {
        name: values.name,
        companyName: values.companyName || undefined,
        contactEmail: values.contactEmail || undefined,
        contactPhone: values.contactPhone || undefined,
        address: values.address || undefined,
      };
      await customerService.createCustomer(data);
      showSuccessNotification(
        t('customer.created'),
        t('customer.createdMessage', { name: values.name }),
      );
      closeCreate();
      form.reset();
      await loadCustomers();
    } catch (error) {
      if (isDevelopment) {
        console.error('Failed to create customer:', error);
      }
      showErrorNotification(t('common.error'), t('common.addFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateCustomer = async (values: CustomerFormValues) => {
    if (!selectedCustomer) return;

    try {
      setIsLoading(true);
      const data: UpdateCustomerRequest = {
        name: values.name,
        companyName: values.companyName || undefined,
        contactEmail: values.contactEmail || undefined,
        contactPhone: values.contactPhone || undefined,
        address: values.address || undefined,
        isActive: values.isActive,
      };
      await customerService.updateCustomer(selectedCustomer.id, data);
      showSuccessNotification(
        t('customer.updated'),
        t('customer.updatedMessage', { name: values.name }),
      );
      closeEdit();
      await loadCustomers();
    } catch (error) {
      if (isDevelopment) {
        console.error('Failed to update customer:', error);
      }
      showErrorNotification(t('common.error'), t('common.updateFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCustomer = (customer: Customer) => {
    modals.openConfirmModal({
      title: t('common.confirmDelete'),
      children: <Text size="sm">{t('common.confirmDeleteMessage', { name: customer.name })}</Text>,
      labels: { confirm: t('common.delete'), cancel: t('common.cancel') },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        try {
          setIsLoading(true);
          await customerService.deleteCustomer(customer.id);
          showSuccessNotification(
            t('customer.deleted'),
            t('customer.deletedMessage', { name: customer.name }),
          );
          await loadCustomers();
        } catch (error) {
          if (isDevelopment) {
            console.error('Failed to delete customer:', error);
          }
          showErrorNotification(t('common.error'), t('common.deleteFailed'));
        } finally {
          setIsLoading(false);
        }
      },
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
      isActive: customer.isActive,
    });
    openEdit();
  };

  const openCreateModal = () => {
    form.reset();
    openCreate();
  };

  // PC-only check at the beginning
  if (!isDesktop) {
    return <PCOnlyAlert />;
  }

  return (
    <AppDesktopLayout
      isLoading={isLoading && !createOpened && !editOpened}
      error={error}
      clearError={clearError}
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
              render: (customer: Customer) => customer.companyName || '-',
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
        hidden={paginationState.totalItems === 0}
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
