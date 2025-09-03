import { useMemo, useState, useEffect, useRef } from 'react';
import { Stack, Group, SimpleGrid, Button, Loader, Text, Center, Flex } from '@mantine/core';
import type { Timeout } from '@/types';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useDeliveryRequestFilters } from '@/hooks/useDeliveryRequestFilters';
import {
  useDeliveryRequests,
  useDeliveryRequestLoading,
  useDeliveryRequestError,
  useDeliveryRequestActions,
  useDeliveryRequestPaginationState,
} from '@/stores/useDeliveryRequestStore';
import { useCustomers, usePermissions } from '@/stores/useAppStore';
import {
  AppPageTitle,
  SwitchView,
  BlankState,
  AppMobileLayout,
  AppDesktopLayout,
  PermissionDeniedPage,
} from '@/components/common';
import {
  DeliveryCard,
  DeliveryDataTable,
  DeliveryGridCard,
  DeliveryListSkeleton,
  DeliveryFilterBarDesktop,
  DeliveryFilterBarMobile,
  DeliveryCustomerDrawer,
  DeliveryStatusDrawer,
  DeliveryDateDrawer,
  DeliveryErrorBoundary,
} from '@/components/app/delivery';
import { useDeviceType } from '@/hooks/useDeviceType';
import { DELIVERY_STATUS } from '@/constants/deliveryRequest';
import { useViewMode } from '@/hooks/useViewMode';
import { useDisclosure, useDebouncedValue } from '@mantine/hooks';

export function DeliveryListPage() {
  const { isMobile, isDesktop } = useDeviceType();
  const { t } = useTranslation();
  const permissions = usePermissions();
  const deliveryRequests = useDeliveryRequests();
  const customers = useCustomers();
  const isLoading = useDeliveryRequestLoading();
  const error = useDeliveryRequestError();
  const {
    loadDeliveryRequestsWithFilter,
    loadMoreDeliveryRequests,
    loadNextPage,
    loadPreviousPage,
    clearError,
  } = useDeliveryRequestActions();
  const { hasMoreDeliveryRequests, hasPreviousPage, isLoadingMore, currentPage } =
    useDeliveryRequestPaginationState();

  // Use the delivery request filters hook for filter state management
  const { filters, filterHandlers, hasActiveFilters } = useDeliveryRequestFilters([]);

  // Debounce the search query for API calls (1 second delay)
  const [debouncedSearch] = useDebouncedValue(filters.searchQuery, 1000);

  // Filter loading state for UI lock
  const [isFilterLoading, setIsFilterLoading] = useState(false);
  const filterTimeoutRef = useRef<Timeout | undefined>(undefined);

  // Track previous date ranges to detect incomplete changes
  const prevScheduledDateRangeRef = useRef(filters.scheduledDateRange);
  const prevCompletedDateRangeRef = useRef(filters.completedDateRange);

  const { viewMode, isTableView, setViewMode } = useViewMode();

  // Drawer states using Mantine's useDisclosure directly
  const [customerDrawerOpened, { open: openCustomerDrawer, close: closeCustomerDrawer }] =
    useDisclosure(false);
  const [statusDrawerOpened, { open: openStatusDrawer, close: closeStatusDrawer }] =
    useDisclosure(false);
  const [dateDrawerOpened, { open: openDateDrawer, close: closeDateDrawer }] = useDisclosure(false);

  // Scroll detection state
  const [isNearBottom, setIsNearBottom] = useState(false);
  const lastLoadTimeRef = useRef<number>(0);

  // Create stable filter params with useMemo to prevent unnecessary re-renders
  const filterParams = useMemo(
    () => ({
      customerId: filters.customerId,
      // Filter out 'all' status before passing to API
      status:
        filters.statuses.length === 1 && filters.statuses[0] !== DELIVERY_STATUS.ALL
          ? filters.statuses[0]
          : undefined,
      assignedTo: filters.assignedTo,
      purchaseOrderId: debouncedSearch || undefined,
      scheduledDateFrom: filters.scheduledDateRange.start?.toISOString(),
      scheduledDateTo: filters.scheduledDateRange.end?.toISOString(),
      completedDateFrom: filters.completedDateRange.start?.toISOString(),
      completedDateTo: filters.completedDateRange.end?.toISOString(),
      sortBy: 'scheduledDate' as const,
      sortOrder: 'asc' as const,
    }),
    [
      filters.customerId,
      filters.statuses,
      filters.assignedTo,
      debouncedSearch,
      filters.scheduledDateRange.start,
      filters.scheduledDateRange.end,
      filters.completedDateRange.start,
      filters.completedDateRange.end,
    ],
  );

  // Effect to load delivery requests when filter params change with forced delay for ALL filters
  useEffect(() => {
    // Check if date range change is incomplete
    const prevScheduledDate = prevScheduledDateRangeRef.current;
    const prevCompletedDate = prevCompletedDateRangeRef.current;
    const currScheduledDate = filters.scheduledDateRange;
    const currCompletedDate = filters.completedDateRange;

    // Check if this is just setting the first date of a range (incomplete)
    const isSettingScheduledDateStart =
      !prevScheduledDate.start && currScheduledDate.start && !currScheduledDate.end;
    const isSettingScheduledDateEnd =
      !prevScheduledDate.end && currScheduledDate.end && !currScheduledDate.start;
    const isSettingCompletedDateStart =
      !prevCompletedDate.start && currCompletedDate.start && !currCompletedDate.end;
    const isSettingCompletedDateEnd =
      !prevCompletedDate.end && currCompletedDate.end && !currCompletedDate.start;

    // Update refs for next comparison
    prevScheduledDateRangeRef.current = currScheduledDate;
    prevCompletedDateRangeRef.current = currCompletedDate;

    // Skip API call if setting incomplete date range
    if (
      isSettingScheduledDateStart ||
      isSettingScheduledDateEnd ||
      isSettingCompletedDateStart ||
      isSettingCompletedDateEnd
    ) {
      setIsFilterLoading(false);
      return;
    }

    // Clear any existing timeout
    if (filterTimeoutRef.current) {
      clearTimeout(filterTimeoutRef.current);
    }

    // Apply delay with UI lock for all filter changes
    setIsFilterLoading(true);
    filterTimeoutRef.current = setTimeout(() => {
      void loadDeliveryRequestsWithFilter(filterParams, true);
      setIsFilterLoading(false);
    }, 1500);

    return () => {
      if (filterTimeoutRef.current) {
        clearTimeout(filterTimeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterParams]);

  // Effect to detect scroll position for infinite scroll (desktop only)
  useEffect(() => {
    if (!isDesktop) return;

    const handleScroll = () => {
      const element = document.documentElement;
      const scrollTop = window.scrollY;
      const scrollHeight = element.scrollHeight;
      const clientHeight = window.innerHeight;

      // Only trigger if there's enough content to scroll (page is taller than viewport)
      // and user has actually scrolled down
      if (scrollHeight > clientHeight && scrollTop > 0) {
        // Load more when user scrolls to 80% of the content
        const threshold = 0.8;
        const isNear = scrollTop + clientHeight >= scrollHeight * threshold;
        setIsNearBottom(isNear);
      } else {
        setIsNearBottom(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    // Don't check initial position to prevent auto-loading on short pages

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isDesktop]);

  // Effect to load more when near bottom
  useEffect(() => {
    if (isNearBottom && hasMoreDeliveryRequests && !isLoadingMore && !isLoading) {
      // Prevent rapid successive loads (minimum 500ms between loads)
      const now = Date.now();
      const timeSinceLastLoad = now - lastLoadTimeRef.current;

      if (timeSinceLastLoad >= 500) {
        lastLoadTimeRef.current = now;
        void loadMoreDeliveryRequests();
      }
    }
  }, [isNearBottom, hasMoreDeliveryRequests, isLoadingMore, isLoading, loadMoreDeliveryRequests]);

  // Common BlankState configuration to reduce duplication
  const blankStateProps = useMemo(
    () => ({
      hidden: deliveryRequests.length > 0 || isLoading,
      title: hasActiveFilters
        ? t('delivery.noDeliveryRequestsFoundSearch')
        : t('delivery.noDeliveryRequestsFound'),
      description: hasActiveFilters
        ? t('delivery.tryDifferentSearch')
        : t('delivery.createFirstDeliveryRequestDescription'),
    }),
    [deliveryRequests.length, isLoading, hasActiveFilters, t],
  );

  // Initial load is handled by filter effect

  // Check view permission
  if (!permissions.deliveryRequest.canView) {
    return <PermissionDeniedPage />;
  }

  if (isMobile) {
    // Date filter indicators for mobile view
    const hasScheduledDateFilter = !!(
      filters.scheduledDateRange.start || filters.scheduledDateRange.end
    );
    const hasCompletedDateFilter = !!(
      filters.completedDateRange.start || filters.completedDateRange.end
    );

    return (
      <AppMobileLayout
        showLogo
        isLoading={isLoading || isFilterLoading}
        error={error}
        clearError={clearError}
        header={<AppPageTitle title={t('delivery.list.title')} />}
      >
        <DeliveryErrorBoundary componentName="DeliveryListPage">
          {/* Mobile Filter Bar */}
          <DeliveryFilterBarMobile
            searchQuery={filters.searchQuery}
            customerId={filters.customerId}
            selectedStatuses={filters.statuses}
            hasScheduledDateFilter={hasScheduledDateFilter}
            hasCompletedDateFilter={hasCompletedDateFilter}
            customers={customers}
            hasActiveFilters={hasActiveFilters}
            onSearchChange={filterHandlers.setSearchQuery}
            onCustomerClick={openCustomerDrawer}
            onStatusClick={openStatusDrawer}
            onDateClick={openDateDrawer}
            onClearFilters={filterHandlers.resetFilters}
          />

          {/* Customer Selection Drawer */}
          <DeliveryCustomerDrawer
            opened={customerDrawerOpened}
            customers={customers}
            selectedCustomerId={filters.customerId}
            onClose={closeCustomerDrawer}
            onCustomerSelect={filterHandlers.setCustomerId}
          />

          {/* Status Selection Drawer */}
          <DeliveryStatusDrawer
            opened={statusDrawerOpened}
            selectedStatuses={filters.statuses}
            onClose={closeStatusDrawer}
            onStatusToggle={filterHandlers.toggleStatus}
            onApply={() => closeStatusDrawer()}
            onClear={() => {
              filterHandlers.setStatuses([]);
              closeStatusDrawer();
            }}
          />

          {/* Date Range Selection Drawer */}
          <DeliveryDateDrawer
            opened={dateDrawerOpened}
            scheduledDateStart={filters.scheduledDateRange.start}
            scheduledDateEnd={filters.scheduledDateRange.end}
            completedDateStart={filters.completedDateRange.start}
            completedDateEnd={filters.completedDateRange.end}
            onClose={closeDateDrawer}
            onScheduledDateRangeSelect={filterHandlers.setScheduledDateRange}
            onCompletedDateRangeSelect={filterHandlers.setCompletedDateRange}
          />

          <BlankState {...blankStateProps} />
          <Stack mt="md" gap={0}>
            {isLoading && deliveryRequests.length === 0 ? (
              <DeliveryListSkeleton count={5} />
            ) : (
              <Stack gap="sm" px="sm">
                {deliveryRequests.map((dr) => (
                  <DeliveryCard key={dr.id} deliveryRequest={dr} />
                ))}
              </Stack>
            )}
          </Stack>

          {/* Mobile Pagination Controls */}
          {deliveryRequests.length > 0 && !isLoading && (
            <Flex justify="space-between" align="center" px="md" py="sm" mt="md">
              <Button
                variant="light"
                leftSection={<IconChevronLeft size={16} />}
                onClick={() => void loadPreviousPage()}
                disabled={!hasPreviousPage || isLoading}
                size="sm"
              >
                {t('common.previous')}
              </Button>

              <Text size="sm" c="dimmed">
                {t('common.page', { page: currentPage })}
              </Text>

              <Button
                variant="light"
                rightSection={<IconChevronRight size={16} />}
                onClick={() => void loadNextPage()}
                disabled={!hasMoreDeliveryRequests || isLoading}
                size="sm"
              >
                {t('common.next')}
              </Button>
            </Flex>
          )}

          {/* Note: Delivery requests are created from PO pages, not directly */}
        </DeliveryErrorBoundary>
      </AppMobileLayout>
    );
  }

  return (
    <AppDesktopLayout
      isLoading={isLoading || isFilterLoading}
      error={error}
      clearError={clearError}
    >
      <DeliveryErrorBoundary componentName="DeliveryListPage">
        <Group justify="space-between" mb="lg">
          <AppPageTitle title={t('delivery.list.title')} />
          <Group gap="sm">
            <SwitchView viewMode={viewMode} setViewMode={setViewMode} />
            {/* Note: Delivery requests are created from PO pages, not directly */}
          </Group>
        </Group>

        {/* Desktop Filter Controls */}
        <DeliveryFilterBarDesktop
          searchQuery={filters.searchQuery}
          customerId={filters.customerId}
          selectedStatuses={filters.statuses}
          scheduledDateStart={filters.scheduledDateRange.start}
          scheduledDateEnd={filters.scheduledDateRange.end}
          completedDateStart={filters.completedDateRange.start}
          completedDateEnd={filters.completedDateRange.end}
          customers={customers}
          hasActiveFilters={hasActiveFilters}
          onSearchChange={filterHandlers.setSearchQuery}
          onCustomerChange={filterHandlers.setCustomerId}
          onStatusesChange={filterHandlers.setStatuses}
          onScheduledDateChange={filterHandlers.setScheduledDateRange}
          onCompletedDateChange={filterHandlers.setCompletedDateRange}
          onClearFilters={filterHandlers.resetFilters}
        />

        {/* Content Area */}
        <BlankState
          {...blankStateProps}
          // Note: Delivery requests are created from PO pages, not directly
        />

        {/* Data Display */}
        {(deliveryRequests.length > 0 || isLoading || isFilterLoading) && (
          <>
            {(isLoading || isFilterLoading) && deliveryRequests.length === 0 ? (
              <DeliveryListSkeleton viewMode={viewMode} count={10} />
            ) : isTableView ? (
              <DeliveryDataTable
                deliveryRequests={deliveryRequests}
                isLoading={isLoading || isFilterLoading}
              />
            ) : (
              <SimpleGrid
                cols={{ base: 1, md: 2, lg: 3 }}
                spacing="lg"
                style={{ opacity: isFilterLoading ? 0.5 : 1 }}
              >
                {deliveryRequests.map((dr) => (
                  <DeliveryGridCard key={dr.id} deliveryRequest={dr} />
                ))}
              </SimpleGrid>
            )}

            {/* Loading more indicator */}
            {isLoadingMore && (
              <Center py="md">
                <Loader size="sm" />
                <Text ml="xs" size="sm" c="dimmed">
                  {t('common.loadingMore')}
                </Text>
              </Center>
            )}

            {/* End of list message */}
            {!hasMoreDeliveryRequests && deliveryRequests.length > 0 && (
              <Center py="md">
                <Text size="sm" c="dimmed">
                  {t('delivery.noMoreDeliveryRequests')}
                </Text>
              </Center>
            )}
          </>
        )}

        {/* Note: Desktop now uses inline controls in DeliveryFilterBarDesktop, no drawers needed */}
      </DeliveryErrorBoundary>
    </AppDesktopLayout>
  );
}
