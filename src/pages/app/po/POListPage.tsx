import { useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { Stack, Group, Box, SimpleGrid, Select, Button, Affix, ActionIcon } from '@mantine/core';
import { IconFileInvoice, IconClearAll, IconPlus } from '@tabler/icons-react';
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
  POErrorBoundary,
} from '@/components/app/po';
import { useDeviceType } from '@/hooks/useDeviceType';
import { ROUTERS } from '@/config/routeConfig';
import { PO_STATUS } from '@/constants/purchaseOrder';
import { useViewMode } from '@/hooks/useViewMode';
import { useDisclosure, useDebouncedValue } from '@mantine/hooks';

export function POListPage() {
  const navigate = useNavigate();
  const { isMobile, isDesktop } = useDeviceType();
  const { t } = useTranslation();
  const purchaseOrders = usePurchaseOrderList();
  const customers = useCustomerList();
  const isLoading = usePOLoading();
  const error = usePOError();
  const { refreshPurchaseOrders, clearError, loadCustomers } = usePOActions();

  // Search input state with debounce
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch] = useDebouncedValue(searchInput, 300);

  // Use the PO filters hook with debounced search
  const { filteredPOs, filters, filterHandlers, hasActiveFilters, clearAllFilters } = usePOFilters(
    purchaseOrders,
    debouncedSearch,
  );

  const { viewMode, isTableView, setViewMode } = useViewMode();

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
  const statusOptions = useMemo(() => {
    return [
      { value: PO_STATUS.ALL, label: t('po.allStatus') },
      { value: PO_STATUS.NEW, label: t('po.status.NEW') },
      { value: PO_STATUS.CONFIRMED, label: t('po.status.CONFIRMED') },
      { value: PO_STATUS.PROCESSING, label: t('po.status.PROCESSING') },
      { value: PO_STATUS.SHIPPED, label: t('po.status.SHIPPED') },
      { value: PO_STATUS.DELIVERED, label: t('po.status.DELIVERED') },
      { value: PO_STATUS.CANCELLED, label: t('po.status.CANCELLED') },
      { value: PO_STATUS.REFUNDED, label: t('po.status.REFUNDED') },
    ];
  }, [t]);

  const hasDateFilter = !!(filters.dateRange.start || filters.dateRange.end);

  // Memoized navigation handlers
  const handleNavigateToAdd = useCallback(() => {
    navigate(ROUTERS.PO_ADD);
  }, [navigate]);

  // Memoized filter handlers
  const handleCustomerChange = useCallback(
    (value: string | null) => {
      filterHandlers.setCustomerId(value || undefined);
    },
    [filterHandlers],
  );

  const handleStatusChange = useCallback(
    (value: string | null) => {
      filterHandlers.setStatus(value as (typeof PO_STATUS)[keyof typeof PO_STATUS]);
    },
    [filterHandlers],
  );

  useOnce(() => {
    void refreshPurchaseOrders();
    void loadCustomers();
  });

  if (isMobile) {
    return (
      <AppMobileLayout
        showLogo
        isLoading={isLoading}
        error={error}
        clearError={clearError}
        header={<AppPageTitle title={t('po.title')} />}
      >
        <POErrorBoundary componentName="POListPage">
          {/* Filter Bar */}
          <POFilterBar
            searchQuery={searchInput}
            customerId={filters.customerId}
            status={filters.status}
            hasDateFilter={hasDateFilter}
            customers={customers}
            hasActiveFilters={hasActiveFilters}
            onSearchChange={setSearchInput}
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
            title={hasActiveFilters ? t('po.noPOsFoundSearch') : t('po.noPOsFound')}
            description={
              hasActiveFilters ? t('po.tryDifferentSearch') : t('po.createFirstPODescription')
            }
          />
          <Box mt="md">
            {isLoading && purchaseOrders.length === 0 ? (
              <POListSkeleton count={5} />
            ) : (
              <Stack gap="sm" px="sm">
                {paginatedPOs.map((po) => (
                  <POCard key={po.id} noActions isLoading={isLoading} purchaseOrder={po} />
                ))}
              </Stack>
            )}
          </Box>

          {/* Floating Action Button for Add PO */}
          {!isLoading && (
            <Affix position={{ bottom: 80, right: 20 }}>
              <ActionIcon
                size="xl"
                radius="xl"
                color="blue"
                onClick={handleNavigateToAdd}
                aria-label={t('po.addPO')}
              >
                <IconPlus size={24} />
              </ActionIcon>
            </Affix>
          )}
        </POErrorBoundary>
      </AppMobileLayout>
    );
  }

  return (
    <AppDesktopLayout isLoading={isLoading} error={error} clearError={clearError}>
      <POErrorBoundary componentName="POListPage">
        <AppPageTitle
          title={t('po.title')}
          button={{
            label: t('po.addPO'),
            onClick: handleNavigateToAdd,
          }}
        />

        {/* Search Bar and View Mode Selector */}
        <Group justify="space-between" align="flex-end">
          <SearchBar
            placeholder={t('po.searchPlaceholder')}
            searchQuery={searchInput}
            setSearchQuery={setSearchInput}
          />
          <Select
            clearable
            searchable
            placeholder={t('po.selectCustomer')}
            data={[{ value: '', label: t('po.allCustomers') }, ...customerOptions]}
            value={filters.customerId || ''}
            style={{ flex: 1, maxWidth: 300 }}
            onChange={handleCustomerChange}
          />
          {/* Filter Controls */}
          <Group justify="space-between" align="center" gap="xl">
            <Select
              clearable
              placeholder={t('po.selectStatus')}
              data={statusOptions}
              value={filters.status}
              style={{ width: 180 }}
              onChange={handleStatusChange}
            />
            <Button
              disabled={!hasActiveFilters}
              variant="subtle"
              leftSection={<IconClearAll size={16} />}
              onClick={clearAllFilters}
            >
              {t('common.clear')}
            </Button>
            <SwitchView viewMode={viewMode} setViewMode={setViewMode} />
          </Group>
        </Group>

        <div>
          <BlankState
            hidden={paginationState.totalItems > 0 || isLoading}
            icon={
              <IconFileInvoice size={48} color="var(--mantine-color-gray-5)" aria-hidden="true" />
            }
            title={hasActiveFilters ? t('po.noPOsFoundSearch') : t('po.noPOsFound')}
            description={
              hasActiveFilters ? t('po.tryDifferentSearch') : t('po.createFirstPODescription')
            }
            button={
              hasActiveFilters
                ? undefined
                : {
                    label: t('po.createFirstPO'),
                    onClick: handleNavigateToAdd,
                  }
            }
          />

          {paginationState.totalItems === 0 && !isLoading ? null : (
            <>
              {/* Desktop View - Table or Grid based on selection */}
              {isLoading && purchaseOrders.length === 0 ? (
                <POListSkeleton viewMode={viewMode} count={10} />
              ) : isTableView ? (
                <PODataTable noAction isLoading={isLoading} purchaseOrders={paginatedPOs} />
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
      </POErrorBoundary>
    </AppDesktopLayout>
  );
}
