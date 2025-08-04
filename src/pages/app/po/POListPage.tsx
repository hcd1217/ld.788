import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { Stack, Group, Box, SimpleGrid, Select } from '@mantine/core';
import { IconFileInvoice } from '@tabler/icons-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useClientSidePagination } from '@/hooks/useClientSidePagination';
import { useOnce } from '@/hooks/useOnce';
import { usePOFilters } from '@/hooks/usePOFilters';
import {
  usePurchaseOrderList,
  useCustomerList,
  usePOLoading,
  usePOError,
  usePOActions,
} from '@/stores/usePOStore';
import {
  Pagination,
  AppPageTitle,
  SearchBar,
  SwitchView,
  BlankState,
  AppMobileLayout,
  AppDesktopLayout,
} from '@/components/common';
import {
  POCard,
  PODataTable,
  POGridCard,
  POListSkeleton,
  POFilterBar,
  POCustomerDrawer,
  POStatusDrawer,
  PODateDrawer,
} from '@/components/app/po';
import useIsDesktop from '@/hooks/useIsDesktop';
import { ROUTERS } from '@/config/routeConfig';
import { PO_STATUS, VIEW_MODE, type ViewModeType } from '@/constants/purchaseOrder';
import { useDisclosure } from '@mantine/hooks';

export function POListPage() {
  const navigate = useNavigate();
  const isDesktop = useIsDesktop();
  const { t } = useTranslation();
  const purchaseOrders = usePurchaseOrderList();
  const customers = useCustomerList();
  const isLoading = usePOLoading();
  const error = usePOError();
  const { refreshPurchaseOrders, clearError, loadCustomers } = usePOActions();

  // Use the PO filters hook
  const [filteredPOs, filters, filterHandlers] = usePOFilters(purchaseOrders);

  const [viewMode, setViewMode] = useState<ViewModeType>(VIEW_MODE.TABLE);

  // Drawer states using Mantine's useDisclosure directly
  const [customerDrawerOpened, { open: openCustomerDrawer, close: closeCustomerDrawer }] =
    useDisclosure(false);
  const [statusDrawerOpened, { open: openStatusDrawer, close: closeStatusDrawer }] =
    useDisclosure(false);
  const [dateDrawerOpened, { open: openDateDrawer, close: closeDateDrawer }] = useDisclosure(false);

  // Use client-side pagination hook with filtered POs
  const [paginatedPOs, paginationState, paginationHandlers] = useClientSidePagination({
    data: filteredPOs,
    defaultPageSize: isDesktop ? undefined : 1000,
  });

  useOnce(() => {
    void refreshPurchaseOrders();
    void loadCustomers();
  });

  // Prepare customer options for select
  const customerOptions = useMemo(
    () =>
      customers.map((customer) => ({
        value: customer.id,
        label: customer.name + (customer.companyName ? ` (${customer.companyName})` : ''),
      })),
    [customers],
  );

  // Status options for select
  const statusOptions = [
    { value: PO_STATUS.ALL, label: t('po.allStatus') },
    { value: PO_STATUS.NEW, label: t('po.status.NEW') },
    { value: PO_STATUS.CONFIRMED, label: t('po.status.CONFIRMED') },
    { value: PO_STATUS.PROCESSING, label: t('po.status.PROCESSING') },
    { value: PO_STATUS.SHIPPED, label: t('po.status.SHIPPED') },
    { value: PO_STATUS.DELIVERED, label: t('po.status.DELIVERED') },
    { value: PO_STATUS.CANCELLED, label: t('po.status.CANCELLED') },
    { value: PO_STATUS.REFUNDED, label: t('po.status.REFUNDED') },
  ];

  // Check if any filters are active
  const hasActiveFilters = !!(
    filters.searchQuery ||
    filters.customerId ||
    filters.status !== PO_STATUS.ALL ||
    filters.dateRange.start ||
    filters.dateRange.end
  );
  const hasDateFilter = !!(filters.dateRange.start || filters.dateRange.end);

  // Clear all filters
  const clearAllFilters = () => {
    filterHandlers.setSearchQuery('');
    filterHandlers.setCustomerId(undefined);
    filterHandlers.setStatus(PO_STATUS.ALL);
    filterHandlers.setDateRange(undefined, undefined);
  };

  if (!isDesktop) {
    return (
      <AppMobileLayout
        showLogo
        isLoading={isLoading}
        error={error}
        clearError={clearError}
        header={<AppPageTitle title={t('po.title')} />}
      >
        {/* Filter Bar */}
        <POFilterBar
          searchQuery={filters.searchQuery}
          customerId={filters.customerId}
          status={filters.status}
          hasDateFilter={hasDateFilter}
          customers={customers}
          hasActiveFilters={hasActiveFilters}
          onSearchChange={filterHandlers.setSearchQuery}
          onCustomerClick={openCustomerDrawer}
          onStatusClick={openStatusDrawer}
          onDateClick={openDateDrawer}
          onClearFilters={clearAllFilters}
        />

        {/* Customer Selection Drawer */}
        <POCustomerDrawer
          opened={customerDrawerOpened}
          customers={customers}
          selectedCustomerId={filters.customerId}
          onClose={closeCustomerDrawer}
          onCustomerSelect={filterHandlers.setCustomerId}
        />

        {/* Status Selection Drawer */}
        <POStatusDrawer
          opened={statusDrawerOpened}
          selectedStatus={filters.status}
          onClose={closeStatusDrawer}
          onStatusSelect={filterHandlers.setStatus}
        />

        {/* Date Range Selection Drawer */}
        <PODateDrawer
          opened={dateDrawerOpened}
          startDate={filters.dateRange.start}
          endDate={filters.dateRange.end}
          onClose={closeDateDrawer}
          onDateRangeSelect={filterHandlers.setDateRange}
        />

        <BlankState
          hidden={paginationState.totalItems > 0 || isLoading}
          icon={
            <IconFileInvoice size={48} color="var(--mantine-color-gray-5)" aria-hidden="true" />
          }
          title={filters.searchQuery ? t('po.noPOsFoundSearch') : t('po.noPOsFound')}
          description={
            filters.searchQuery ? t('po.tryDifferentSearch') : t('po.createFirstPODescription')
          }
        />
        <Box mt="md">
          {isLoading && purchaseOrders.length === 0 ? (
            <POListSkeleton count={5} />
          ) : (
            <Stack gap="sm" px="sm">
              {paginatedPOs.map((po) => (
                <POCard key={po.id} noActions purchaseOrder={po} />
              ))}
            </Stack>
          )}
        </Box>
      </AppMobileLayout>
    );
  }

  return (
    <AppDesktopLayout isLoading={isLoading} error={error} clearError={clearError}>
      <AppPageTitle
        title={t('po.title')}
        button={{
          label: t('po.addPO'),
          onClick() {
            navigate(ROUTERS.PO_ADD);
          },
        }}
      />

      {/* Search Bar and View Mode Selector */}
      <Group justify="space-between" align="flex-end">
        <SearchBar
          hidden={paginationState.totalPages < 2}
          placeholder={t('po.searchPlaceholder')}
          searchQuery={filters.searchQuery}
          setSearchQuery={filterHandlers.setSearchQuery}
        />
        <Select
          clearable
          searchable
          placeholder={t('po.selectCustomer')}
          data={[{ value: '', label: t('po.allCustomers') }, ...customerOptions]}
          value={filters.customerId || ''}
          style={{ flex: 1, maxWidth: 300 }}
          onChange={(value) => filterHandlers.setCustomerId(value || undefined)}
        />
        {/* Filter Controls */}
        <Group justify="space-between" align="center" gap="xl">
          <Select
            clearable
            placeholder={t('po.selectStatus')}
            data={statusOptions}
            value={filters.status}
            style={{ width: 180 }}
            onChange={(value) =>
              filterHandlers.setStatus(value as (typeof PO_STATUS)[keyof typeof PO_STATUS])
            }
          />
          <SwitchView viewMode={viewMode} setViewMode={setViewMode} />
        </Group>
      </Group>

      <div>
        <BlankState
          hidden={paginationState.totalItems > 0 || isLoading}
          icon={
            <IconFileInvoice size={48} color="var(--mantine-color-gray-5)" aria-hidden="true" />
          }
          title={filters.searchQuery ? t('po.noPOsFoundSearch') : t('po.noPOsFound')}
          description={
            filters.searchQuery ? t('po.tryDifferentSearch') : t('po.createFirstPODescription')
          }
          button={
            filters.searchQuery
              ? undefined
              : {
                  label: t('po.createFirstPO'),
                  onClick: () => navigate(ROUTERS.PO_ADD),
                }
          }
        />

        {paginationState.totalItems === 0 && !isLoading ? null : (
          <>
            {/* Desktop View - Table or Grid based on selection */}
            {isLoading && purchaseOrders.length === 0 ? (
              <POListSkeleton viewMode={viewMode} count={10} />
            ) : viewMode === VIEW_MODE.TABLE ? (
              <PODataTable noAction purchaseOrders={paginatedPOs} />
            ) : (
              <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing="lg">
                {paginatedPOs.map((po) => (
                  <POGridCard key={po.id} purchaseOrder={po} />
                ))}
              </SimpleGrid>
            )}
          </>
        )}
      </div>

      <Pagination
        hidden={paginationState.totalItems === 0}
        totalPages={paginationState.totalPages}
        pageSize={paginationState.pageSize}
        currentPage={paginationState.currentPage}
        onPageSizeChange={paginationHandlers.setPageSize}
        onPageChange={paginationHandlers.setCurrentPage}
      />
    </AppDesktopLayout>
  );
}
