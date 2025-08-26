import { useMemo, useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Stack, Group, SimpleGrid, Button, Loader, Text, Center } from '@mantine/core';
import { IconPlus, IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useDeliveryRequestFilters } from '@/hooks/useDeliveryRequestFilters';
import {
  useDeliveryRequests,
  useDeliveryRequestLoading,
  useDeliveryRequestError,
  useLoadDeliveryRequestsWithFilter,
  useClearDeliveryRequestError,
  useHasMoreDeliveryRequests,
  useHasPreviousPage,
  useIsLoadingMore,
  useCurrentPage,
  useLoadNextPage,
  useLoadPreviousPage,
} from '@/stores/useDeliveryRequestStore';
import { useCustomers } from '@/stores/useAppStore';
import {
  AppPageTitle,
  SwitchView,
  BlankState,
  AppMobileLayout,
  AppDesktopLayout,
} from '@/components/common';
import { DeliveryFilterBarDesktop } from '@/components/app/delivery/DeliveryFilterBarDesktop';
import { DeliveryFilterBarMobile } from '@/components/app/delivery/DeliveryFilterBarMobile';
import { DeliveryCard } from '@/components/app/delivery/DeliveryCard';
import { DeliveryDataTable } from '@/components/app/delivery/DeliveryDataTable';
import { useDeviceType } from '@/hooks/useDeviceType';
import { ROUTERS } from '@/config/routeConfig';
import { useViewMode } from '@/hooks/useViewMode';
import { useDisclosure, useDebouncedValue } from '@mantine/hooks';

export function DeliveryListPage() {
  const navigate = useNavigate();
  const { isMobile, isDesktop } = useDeviceType();
  const { t } = useTranslation();
  const deliveryRequests = useDeliveryRequests();
  const customers = useCustomers();
  const isLoading = useDeliveryRequestLoading();
  const error = useDeliveryRequestError();
  const loadDeliveryRequestsWithFilter = useLoadDeliveryRequestsWithFilter();
  const clearError = useClearDeliveryRequestError();
  const hasMoreDeliveryRequests = useHasMoreDeliveryRequests();
  const hasPreviousPage = useHasPreviousPage();
  const isLoadingMore = useIsLoadingMore();
  const currentPage = useCurrentPage();
  const loadNextPage = useLoadNextPage();
  const loadPreviousPage = useLoadPreviousPage();

  // Search input state with debounce
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch] = useDebouncedValue(searchInput, 300);

  // Use the delivery request filters hook for filter state management only
  // Note: We don't use filteredDeliveryRequests anymore since filtering happens server-side
  const { filters, filterHandlers, hasActiveFilters, clearAllFilters } = useDeliveryRequestFilters(
    [], // Empty array since we don't need client-side filtering
  );

  const { viewMode, isTableView, setViewMode } = useViewMode();

  // Drawer states using Mantine's useDisclosure directly
  const [, { open: openCustomerDrawer }] = useDisclosure(false);
  const [, { open: openStatusDrawer }] = useDisclosure(false);
  const [, { open: openDateDrawer }] = useDisclosure(false);

  // Create stable filter params with useMemo to prevent unnecessary re-renders
  const filterParams = useMemo(
    () => ({
      status:
        filters.statuses.length === 1 && filters.statuses[0] !== 'ALL'
          ? filters.statuses[0]
          : undefined,
      assignedTo: filters.assignedTo,
      customerId: filters.customerId,
      purchaseOrderId: debouncedSearch || undefined, // Search by PO number
      scheduledDateFrom: filters.scheduledDateRange.start?.toISOString(),
      scheduledDateTo: filters.scheduledDateRange.end?.toISOString(),
      completedDateFrom: filters.completedDateRange.start?.toISOString(),
      completedDateTo: filters.completedDateRange.end?.toISOString(),
      sortBy: 'scheduledDate' as const,
      sortOrder: 'asc' as const,
      limit: 20,
    }),
    [
      filters.statuses,
      filters.assignedTo,
      filters.customerId,
      debouncedSearch,
      filters.scheduledDateRange.start,
      filters.scheduledDateRange.end,
      filters.completedDateRange.start,
      filters.completedDateRange.end,
    ],
  );

  // Load delivery requests on mount and when filters change
  useEffect(() => {
    loadDeliveryRequestsWithFilter(filterParams, true);
  }, [loadDeliveryRequestsWithFilter, filterParams]);

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      if (error) {
        clearError();
      }
    };
  }, [error, clearError]);

  // Handle creating new delivery request
  const handleCreateDeliveryRequest = useCallback(() => {
    navigate(ROUTERS.DELIVERY_MANAGEMENT + '/create');
  }, [navigate]);

  // Pagination handlers
  const handleNextPage = useCallback(() => {
    loadNextPage();
  }, [loadNextPage]);

  const handlePreviousPage = useCallback(() => {
    loadPreviousPage();
  }, [loadPreviousPage]);

  // Clear filters handler
  const handleClearFilters = useCallback(() => {
    setSearchInput('');
    clearAllFilters();
  }, [clearAllFilters]);

  // Main content component
  const MainContent = () => (
    <Stack gap="md">
      {/* Header */}
      <Group justify="space-between">
        <AppPageTitle title={t('delivery.list.title')} />
        {isDesktop && (
          <Group gap="sm">
            <SwitchView viewMode={viewMode} setViewMode={setViewMode} />
            <Button leftSection={<IconPlus size={16} />} onClick={handleCreateDeliveryRequest}>
              {t('delivery.actions.create')}
            </Button>
          </Group>
        )}
      </Group>

      {/* Filters */}
      {isDesktop ? (
        <DeliveryFilterBarDesktop
          searchQuery={searchInput}
          customerId={filters.customerId}
          selectedStatuses={filters.statuses}
          scheduledDateStart={filters.scheduledDateRange.start}
          scheduledDateEnd={filters.scheduledDateRange.end}
          completedDateStart={filters.completedDateRange.start}
          completedDateEnd={filters.completedDateRange.end}
          customers={customers}
          hasActiveFilters={hasActiveFilters}
          onSearchChange={setSearchInput}
          onCustomerChange={filterHandlers.setCustomerId}
          onStatusesChange={filterHandlers.setStatuses}
          onScheduledDateChange={filterHandlers.setScheduledDateRange}
          onCompletedDateChange={filterHandlers.setCompletedDateRange}
          onClearFilters={handleClearFilters}
        />
      ) : (
        <DeliveryFilterBarMobile
          searchQuery={searchInput}
          customerId={filters.customerId}
          selectedStatuses={filters.statuses}
          hasScheduledDateFilter={Boolean(
            filters.scheduledDateRange.start || filters.scheduledDateRange.end,
          )}
          hasCompletedDateFilter={Boolean(
            filters.completedDateRange.start || filters.completedDateRange.end,
          )}
          customers={customers}
          hasActiveFilters={hasActiveFilters}
          onSearchChange={setSearchInput}
          onCustomerClick={openCustomerDrawer}
          onStatusClick={openStatusDrawer}
          onDateClick={openDateDrawer}
          onClearFilters={handleClearFilters}
        />
      )}

      {/* Results count */}
      <Group justify="space-between">
        <Text size="sm" c="dimmed">
          {t('delivery.list.count', { count: deliveryRequests.length })}
        </Text>
      </Group>

      {/* Content */}
      {isLoading && deliveryRequests.length === 0 ? (
        <Center py="xl">
          <Loader size="md" />
        </Center>
      ) : error ? (
        <Center py="xl">
          <Text c="red">{error}</Text>
        </Center>
      ) : deliveryRequests.length === 0 ? (
        <BlankState
          title={t('delivery.list.empty.title')}
          description={t('delivery.list.empty.description')}
          button={{
            label: t('delivery.actions.create'),
            onClick: handleCreateDeliveryRequest,
            icon: <IconPlus size={16} />,
          }}
        />
      ) : (
        <Stack gap="md">
          {/* List/Grid View */}
          {isTableView ? (
            <DeliveryDataTable deliveryRequests={deliveryRequests} isLoading={isLoading} />
          ) : (
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
              {deliveryRequests.map((deliveryRequest) => (
                <DeliveryCard key={deliveryRequest.id} deliveryRequest={deliveryRequest} />
              ))}
            </SimpleGrid>
          )}

          {/* Pagination */}
          {(hasMoreDeliveryRequests || hasPreviousPage) && (
            <Group justify="center" mt="md">
              <Button
                variant="outline"
                leftSection={<IconChevronLeft size={16} />}
                onClick={handlePreviousPage}
                disabled={!hasPreviousPage || isLoading}
              >
                {t('common.previous')}
              </Button>
              <Text size="sm" c="dimmed">
                {t('common.page')} {currentPage}
              </Text>
              <Button
                variant="outline"
                rightSection={<IconChevronRight size={16} />}
                onClick={handleNextPage}
                disabled={!hasMoreDeliveryRequests || isLoading}
              >
                {t('common.next')}
              </Button>
            </Group>
          )}

          {/* Loading more indicator */}
          {isLoadingMore && (
            <Center py="sm">
              <Loader size="sm" />
            </Center>
          )}
        </Stack>
      )}

      {/* Mobile FAB */}
      {isMobile && (
        <Button
          pos="fixed"
          bottom={20}
          right={20}
          style={{ zIndex: 1000 }}
          onClick={handleCreateDeliveryRequest}
        >
          <IconPlus size={16} />
        </Button>
      )}
    </Stack>
  );

  return (
    <>
      {isMobile ? (
        <AppMobileLayout>
          <MainContent />
        </AppMobileLayout>
      ) : (
        <AppDesktopLayout>
          <MainContent />
        </AppDesktopLayout>
      )}
    </>
  );
}
