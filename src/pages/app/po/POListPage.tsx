import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import {
  Stack,
  Group,
  Box,
  SimpleGrid,
  Select,
  Badge,
  Button,
} from '@mantine/core';
import { IconFileInvoice, IconFilter } from '@tabler/icons-react';
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
  Drawer,
} from '@/components/common';
import {
  POCard,
  PODataTable,
  POGridCard,
  POListSkeleton,
} from '@/components/app/po';
import useIsDesktop from '@/hooks/useIsDesktop';
import { ROUTERS } from '@/config/routeConfig';
import { useMobileDrawer } from '@/hooks/useMobileDrawer';
import { PO_STATUS, VIEW_MODE, type ViewModeType } from '@/constants/purchaseOrder';
import { DatePickerInput } from '@mantine/dates';

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
  const {
    filterDrawerOpened,
    drawerExpanded,
    openFilterDrawer,
    setDrawerExpanded,
    handleDrawerClose,
  } = useMobileDrawer();

  // Use client-side pagination hook with filtered POs
  const [paginatedPOs, paginationState, paginationHandlers] =
    useClientSidePagination({
      data: filteredPOs,
      defaultPageSize: isDesktop ? undefined : 1000,
    });

  useOnce(() => {
    void refreshPurchaseOrders();
    void loadCustomers();
  });

  // Prepare customer options for select
  const customerOptions = useMemo(() =>
    customers.map((customer) => ({
      value: customer.id,
      label: customer.name + (customer.companyName ? ` (${customer.companyName})` : ''),
    })),
    [customers]
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

  if (!isDesktop) {
    return (
      <AppMobileLayout
        showLogo
        isLoading={isLoading}
        error={error}
        clearError={clearError}
        header={<AppPageTitle title={t('po.title')} />}
      >
        {/* Search & Filter Controls */}
        <Stack gap="sm" p="sm">
          <Group justify="space-between" align="center">
            <Button
              variant="subtle"
              leftSection={<IconFilter size={20} />}
              size="compact-md"
              onClick={openFilterDrawer}
            >
              {t('common.filter')}
            </Button>
            <Group gap="xs">
              {/* Show active filter indicators */}
              {filters.searchQuery ? (
                <Badge size="sm" variant="light" color="gray">
                  {t('common.search')}: {filters.searchQuery}
                </Badge>
              ) : null}
              {filters.customerId ? (
                <Badge size="sm" variant="light" color="gray">
                  {customers.find((c) => c.id === filters.customerId)?.name}
                </Badge>
              ) : null}
              {filters.status !== PO_STATUS.ALL && (
                <Badge size="sm" variant="light" color="gray">
                  {t(`po.status.${filters.status}`)}
                </Badge>
              )}
            </Group>
          </Group>
        </Stack>

        {/* Filter Drawer */}
        <Drawer
          expandable
          opened={filterDrawerOpened}
          size="300px"
          title={t('po.filterTitle')}
          expanded={drawerExpanded}
          onClose={handleDrawerClose}
          onExpandedChange={setDrawerExpanded}
        >
          <Stack gap="md">
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
              onChange={(value) => filterHandlers.setCustomerId(value || undefined)}
            />
            <Select
              clearable
              placeholder={t('po.selectStatus')}
              data={statusOptions}
              value={filters.status}
              onChange={(value) => filterHandlers.setStatus(value as typeof PO_STATUS[keyof typeof PO_STATUS])}
            />
            <DatePickerInput
              clearable
              placeholder={t('po.startDate')}
              value={filters.dateRange.start}
              onChange={(date) => filterHandlers.setDateRange(date ? new Date(date) : undefined, filters.dateRange.end)}
            />
            <DatePickerInput
              clearable
              placeholder={t('po.endDate')}
              value={filters.dateRange.end}
              onChange={(date) => filterHandlers.setDateRange(filters.dateRange.start, date ? new Date(date) : undefined)}
            />
            <Button fullWidth onClick={handleDrawerClose}>
              {t('common.applyFilter')}
            </Button>
          </Stack>
        </Drawer>

        <BlankState
          hidden={paginationState.totalItems > 0 || isLoading}
          icon={<IconFileInvoice size={48} color="var(--mantine-color-gray-5)" aria-hidden="true" />}
          title={
            filters.searchQuery
              ? t('po.noPOsFoundSearch')
              : t('po.noPOsFound')
          }
          description={
            filters.searchQuery
              ? t('po.tryDifferentSearch')
              : t('po.createFirstPODescription')
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
    <AppDesktopLayout
      isLoading={isLoading}
      error={error}
      clearError={clearError}
    >
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
            onChange={(value) => filterHandlers.setStatus(value as typeof PO_STATUS[keyof typeof PO_STATUS])}
          />
          <SwitchView viewMode={viewMode} setViewMode={setViewMode} />
        </Group>
      </Group>

      <div>
        <BlankState
          hidden={paginationState.totalItems > 0 || isLoading}
          icon={<IconFileInvoice size={48} color="var(--mantine-color-gray-5)" aria-hidden="true" />}
          title={
            filters.searchQuery
              ? t('po.noPOsFoundSearch')
              : t('po.noPOsFound')
          }
          description={
            filters.searchQuery
              ? t('po.tryDifferentSearch')
              : t('po.createFirstPODescription')
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
