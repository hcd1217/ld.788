import { useMemo, useState, useEffect, useRef } from 'react';
import { Stack, Group, SimpleGrid, Button, Loader, Text, Center, Flex } from '@mantine/core';
import type { Timeout } from '@/types';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useDeliveryRequestFilters } from '@/hooks/useDeliveryRequestFilters';
import { STORAGE_KEYS } from '@/utils/storageKeys';
import {
  useDeliveryRequests,
  useDeliveryRequestLoading,
  useDeliveryRequestError,
  useDeliveryRequestActions,
  useDeliveryRequestPaginationState,
} from '@/stores/useDeliveryRequestStore';
import { useCustomers, usePermissions, useMe } from '@/stores/useAppStore';
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
  DeliveryStatusFilterDrawer,
  DeliveryQuickActionsDrawer,
  DeliveryErrorBoundary,
} from '@/components/app/delivery';
import { useDeviceType } from '@/hooks/useDeviceType';
import { DELIVERY_STATUS } from '@/constants/deliveryRequest';
import { useViewMode } from '@/hooks/useViewMode';
import { useDebouncedValue } from '@mantine/hooks';

export function DeliveryListPage() {
  const { isMobile, isDesktop } = useDeviceType();
  const { t } = useTranslation();
  const permissions = usePermissions();
  const deliveryRequests = useDeliveryRequests();
  const customers = useCustomers();
  const isLoading = useDeliveryRequestLoading();
  const error = useDeliveryRequestError();
  const currentUser = useMe();
  const { currentEmployeeId, canFilter, canViewAll } = useMemo(() => {
    const employeeId = currentUser?.employee?.id ?? '-';
    return {
      currentEmployeeId: employeeId,
      canViewAll: permissions.deliveryRequest.query?.canViewAll ?? false,
      canFilter: permissions.deliveryRequest.query?.canFilter ?? false,
    };
  }, [currentUser, permissions.deliveryRequest]);

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

  // Mobile drawer states
  const [quickActionsDrawerOpened, setQuickActionsDrawerOpened] = useState(false);
  const [statusDrawerOpened, setStatusDrawerOpened] = useState(false);
  const [selectedQuickAction, setSelectedQuickAction] = useState<string | undefined>();

  // Debounce the search query for API calls (1 second delay)
  const [debouncedSearch] = useDebouncedValue(filters.searchQuery, 1000);

  // Filter loading state for UI lock
  const [isFilterLoading, setIsFilterLoading] = useState(false);
  const filterTimeoutRef = useRef<Timeout | undefined>(undefined);

  // Track previous date ranges to detect incomplete changes
  const prevScheduledDateRangeRef = useRef(filters.scheduledDateRange);

  const { viewMode, isTableView, setViewMode } = useViewMode();

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
      assignedTo: canViewAll ? filters.assignedTo : currentEmployeeId,
      deliveryRequestNumber: debouncedSearch || undefined,
      scheduledDateFrom: filters.scheduledDateRange.start?.toISOString(),
      scheduledDateTo: filters.scheduledDateRange.end?.toISOString(),
      sortBy: 'scheduledDate' as const,
      sortOrder: 'asc' as const,
    }),
    [canViewAll, filters, debouncedSearch, currentEmployeeId],
  );

  // Effect to load delivery requests when filter params change with forced delay for ALL filters
  useEffect(() => {
    // Check if date range change is incomplete
    const prevScheduledDate = prevScheduledDateRangeRef.current;
    const currScheduledDate = filters.scheduledDateRange;

    // Check if this is just setting the first date of a range (incomplete)
    const isSettingScheduledDateStart =
      !prevScheduledDate.start && currScheduledDate.start && !currScheduledDate.end;
    const isSettingScheduledDateEnd =
      !prevScheduledDate.end && currScheduledDate.end && !currScheduledDate.start;

    // Update refs for next comparison
    prevScheduledDateRangeRef.current = currScheduledDate;

    // Skip API call if setting incomplete date range
    if (isSettingScheduledDateStart || isSettingScheduledDateEnd) {
      setIsFilterLoading(false);
      return;
    }

    // Clear any existing timeout
    if (filterTimeoutRef.current) {
      clearTimeout(filterTimeoutRef.current);
    }

    // Apply delay with UI lock for all filter changes
    setIsFilterLoading(true);
    let delay = Number(localStorage.getItem(STORAGE_KEYS.CLIENT.API_DELAY) ?? 1500);
    if (Number.isNaN(delay)) {
      delay = 1500;
    }
    filterTimeoutRef.current = setTimeout(() => {
      void loadDeliveryRequestsWithFilter(filterParams, true);
      setIsFilterLoading(false);
    }, delay);

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

  // Mobile drawer handlers
  const handleQuickActionSelect = (
    action: string | undefined,
    dateRange?: { start: Date; end: Date },
  ) => {
    setSelectedQuickAction(action);
    if (dateRange) {
      filterHandlers.setScheduledDateRange(dateRange.start, dateRange.end);
    } else {
      filterHandlers.setScheduledDateRange(undefined, undefined);
    }
  };

  const handleStatusApply = () => {
    // The apply is handled within the drawer component
  };

  // Check view permission
  if (!permissions.deliveryRequest.canView) {
    return <PermissionDeniedPage />;
  }

  if (isMobile) {
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
            selectedStatuses={filters.statuses}
            hasDateFilter={!!filters.scheduledDateRange.start || !!filters.scheduledDateRange.end}
            quickAction={selectedQuickAction}
            hasActiveFilters={hasActiveFilters}
            onSearchChange={filterHandlers.setSearchQuery}
            onQuickActionsClick={() => setQuickActionsDrawerOpened(true)}
            onStatusClick={() => setStatusDrawerOpened(true)}
            onClearFilters={() => {
              filterHandlers.resetFilters();
              setSelectedQuickAction(undefined);
            }}
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

          {/* Mobile Filter Drawers */}
          <DeliveryQuickActionsDrawer
            opened={quickActionsDrawerOpened}
            selectedAction={selectedQuickAction}
            onClose={() => setQuickActionsDrawerOpened(false)}
            onActionSelect={handleQuickActionSelect}
          />

          <DeliveryStatusFilterDrawer
            opened={statusDrawerOpened}
            selectedStatuses={filters.statuses}
            onClose={() => setStatusDrawerOpened(false)}
            onStatusToggle={filterHandlers.toggleStatus}
            onApply={handleStatusApply}
            onClear={() => filterHandlers.setStatuses([])}
          />
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
        {canFilter ? (
          <DeliveryFilterBarDesktop
            searchQuery={filters.searchQuery}
            customerId={filters.customerId}
            assignedTo={canViewAll ? filters.assignedTo : currentEmployeeId}
            selectedStatuses={filters.statuses}
            scheduledDateStart={filters.scheduledDateRange.start}
            scheduledDateEnd={filters.scheduledDateRange.end}
            customers={customers}
            hasActiveFilters={hasActiveFilters}
            onSearchChange={filterHandlers.setSearchQuery}
            onCustomerChange={filterHandlers.setCustomerId}
            onAssignedToChange={() => {
              filterHandlers.setAssignedTo(canViewAll ? filters.assignedTo : currentEmployeeId);
            }}
            onStatusesChange={filterHandlers.setStatuses}
            onScheduledDateChange={filterHandlers.setScheduledDateRange}
            onClearFilters={filterHandlers.resetFilters}
          />
        ) : null}

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
