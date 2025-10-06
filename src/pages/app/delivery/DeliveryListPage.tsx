import { useEffect, useMemo, useRef, useState } from 'react';

import { useNavigate } from 'react-router';

import {
  ActionIcon,
  Affix,
  Button,
  Center,
  Flex,
  Group,
  Loader,
  SimpleGrid,
  Stack,
  Text,
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import {
  IconChevronLeft,
  IconChevronRight,
  IconPackage,
  IconPlus,
  IconSortAscending,
} from '@tabler/icons-react';

import {
  DeliveryCard,
  DeliveryCreateModal,
  DeliveryDataTable,
  DeliveryEmployeeFilterDrawer,
  DeliveryErrorBoundary,
  DeliveryFilterBarDesktop,
  DeliveryFilterBarMobile,
  DeliveryGridCard,
  DeliveryListSkeleton,
  DeliveryQuickActionsDrawer,
  DeliveryStatusFilterDrawer,
} from '@/components/app/delivery';
import {
  AppDesktopLayout,
  AppMobileLayout,
  AppPageTitle,
  BlankState,
  PermissionDeniedPage,
  SwitchView,
} from '@/components/common';
import { ROUTERS } from '@/config/routeConfig';
import { DELIVERY_STATUS } from '@/constants/deliveryRequest';
import { useDeliveryRequestFilters } from '@/hooks/useDeliveryRequestFilters';
import { useDeviceType } from '@/hooks/useDeviceType';
import { useSWRAction } from '@/hooks/useSWRAction';
import { useTranslation } from '@/hooks/useTranslation';
import { useViewMode } from '@/hooks/useViewMode';
import { useMe, usePermissions } from '@/stores/useAppStore';
import {
  useDeliveryRequestActions,
  useDeliveryRequestError,
  useDeliveryRequestLoading,
  useDeliveryRequestPaginationState,
  useDeliveryRequests,
} from '@/stores/useDeliveryRequestStore';
import type { Timeout } from '@/types';
import { xOr } from '@/utils/boolean';
import {
  canCreateDeliveryRequest,
  canUpdateDeliveryOrderInDay,
  canViewAllDeliveryRequest,
  canViewDeliveryRequest,
} from '@/utils/permission.utils';
import { STORAGE_KEYS } from '@/utils/storageKeys';

export function DeliveryListPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isMobile, isDesktop } = useDeviceType();
  const currentUser = useMe();
  const permissions = usePermissions();
  const deliveryRequests = useDeliveryRequests();
  const isLoading = useDeliveryRequestLoading();
  const error = useDeliveryRequestError();

  const { currentEmployeeId, canCreate, canView, canViewAll, canUpdateOrderInDay } = useMemo(() => {
    const employeeId = currentUser?.employee?.id ?? '-';
    return {
      canCreate: canCreateDeliveryRequest(permissions),
      currentEmployeeId: employeeId,
      canView: canViewDeliveryRequest(permissions),
      canViewAll: canViewAllDeliveryRequest(permissions),
      canUpdateOrderInDay: canUpdateDeliveryOrderInDay(permissions),
    };
  }, [currentUser, permissions]);

  const {
    loadDeliveryRequestsWithFilter,
    loadMoreDeliveryRequests,
    loadNextPage,
    loadPreviousPage,
    clearError,
    createDeliveryRequest,
  } = useDeliveryRequestActions();
  const { hasMoreDeliveryRequests, hasPreviousPage, isLoadingMore, currentPage } =
    useDeliveryRequestPaginationState();

  // Use the delivery request filters hook for filter state management
  const { filters, filterHandlers, hasActiveFilters } = useDeliveryRequestFilters();

  // Mobile drawer states
  const [quickActionsDrawerOpened, setQuickActionsDrawerOpened] = useState(false);
  const [statusDrawerOpened, setStatusDrawerOpened] = useState(false);
  const [employeeDrawerOpened, setEmployeeDrawerOpened] = useState(false);
  const [selectedQuickAction, setSelectedQuickAction] = useState<string | undefined>();
  const [createModalOpened, setCreateModalOpened] = useState(false);

  // Debounce the search query for API calls (1 second delay)
  const [debouncedSearch] = useDebouncedValue(filters.searchQuery, 1000);

  // Filter loading state for UI lock
  const [isFilterLoading, setIsFilterLoading] = useState(false);
  const filterTimeoutRef = useRef<Timeout | undefined>(undefined);

  const { viewMode, isTableView, setViewMode } = useViewMode();

  // Scroll detection state
  const [isNearBottom, setIsNearBottom] = useState(false);
  const lastLoadTimeRef = useRef<number>(0);

  // Create stable filter params with useMemo to prevent unnecessary re-renders
  const filterParams = useMemo(() => {
    // Filter out 'ALL' status and convert to API format
    const validStatuses = filters.statuses.filter((s) => s !== DELIVERY_STATUS.ALL);

    return {
      customerId: filters.customerId,
      statuses: validStatuses.length > 1 ? validStatuses : undefined,
      status: validStatuses.length === 1 ? validStatuses[0] : undefined,
      assignedTo: canViewAll ? filters.assignedTo : currentEmployeeId,
      deliveryRequestNumber: debouncedSearch || undefined,
      scheduledDateFrom: filters.scheduledDateRange.start?.toISOString(),
      scheduledDateTo: filters.scheduledDateRange.end?.toISOString(),
      sortBy: 'scheduledDate' as const,
      sortOrder: 'asc' as const,
    };
  }, [canViewAll, filters, debouncedSearch, currentEmployeeId]);

  // Effect to load delivery requests when filter params change with forced delay for ALL filters
  useEffect(() => {
    // Skip API call if setting incomplete date range
    if (xOr(filterParams.scheduledDateFrom, filterParams.scheduledDateTo)) {
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
        ? t('common.tryDifferentSearch')
        : t('delivery.descriptions.createFirstDeliveryRequest'),
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

  // Create delivery request action
  const createReceiveRequestAction = useSWRAction(
    'create-receive-request',
    async (data: {
      type: 'RECEIVE' | 'DELIVERY';
      assignedTo: string;
      scheduledDate: string;
      notes?: string;
      isUrgentDelivery?: boolean;
      vendorName?: string;
      receiveAddress?: {
        oneLineAddress: string;
        googleMapsUrl?: string;
      };
      purchaseOrderId?: string;
    }) => {
      await createDeliveryRequest(data);
      setCreateModalOpened(false);
      await loadDeliveryRequestsWithFilter(filterParams, true);
    },
    {
      onSuccess: () => {
        // The action already handles closing the modal and refreshing
      },
      onError: (error: Error) => {
        console.error('Failed to create receive request:', error);
      },
    },
  );

  // Check view permission
  if (!canView) {
    return <PermissionDeniedPage />;
  }

  if (isMobile) {
    return (
      <AppMobileLayout
        showLogo
        isLoading={isLoading || isFilterLoading}
        error={error}
        clearError={clearError}
        header={<AppPageTitle title={t('delivery.title')} />}
      >
        <DeliveryErrorBoundary componentName="DeliveryListPage">
          {/* Mobile Filter Bar */}
          <DeliveryFilterBarMobile
            searchQuery={filters.searchQuery}
            selectedStatuses={filters.statuses}
            assignedTo={canViewAll ? filters.assignedTo : currentEmployeeId}
            hasDateFilter={!!filters.scheduledDateRange.start || !!filters.scheduledDateRange.end}
            quickAction={selectedQuickAction}
            hasActiveFilters={hasActiveFilters}
            onSearchChange={filterHandlers.setSearchQuery}
            onQuickActionsClick={() => setQuickActionsDrawerOpened(true)}
            onStatusClick={() => setStatusDrawerOpened(true)}
            onEmployeeClick={() => setEmployeeDrawerOpened(true)}
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

          {canViewAll && (
            <DeliveryEmployeeFilterDrawer
              opened={employeeDrawerOpened}
              selectedEmployeeId={canViewAll ? filters.assignedTo : currentEmployeeId}
              onClose={() => setEmployeeDrawerOpened(false)}
              onEmployeeChange={(employeeId) => {
                filterHandlers.setAssignedTo(canViewAll ? employeeId : currentEmployeeId);
              }}
            />
          )}

          {/* Create Receive Request Modal */}
          <DeliveryCreateModal
            opened={createModalOpened}
            onClose={() => setCreateModalOpened(false)}
            onConfirm={createReceiveRequestAction.trigger}
            isLoading={createReceiveRequestAction.isMutating}
          />
          {/* Floating Action Button for Add Request */}
          {!createModalOpened && !isLoading && canCreate && (
            <Affix position={{ bottom: 80, right: 10 }}>
              <ActionIcon
                size="xl"
                radius="xl"
                color="blue"
                onClick={() => setCreateModalOpened(true)}
              >
                <IconPlus size={24} />
              </ActionIcon>
            </Affix>
          )}
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
          <AppPageTitle title={t('delivery.title')} />
          <Group gap="sm">
            <Button
              leftSection={<IconSortAscending size={16} />}
              variant="light"
              onClick={() => navigate(ROUTERS.DELIVERY_UPDATE_ORDER)}
              disabled={!canUpdateOrderInDay}
            >
              {t('delivery.actions.arrangeDeliveryOrder')}
            </Button>
            <Button
              leftSection={<IconPackage size={16} />}
              onClick={() => setCreateModalOpened(true)}
              disabled={!canCreate}
            >
              {t('delivery.createReceiveRequest')}
            </Button>
            <SwitchView viewMode={viewMode} setViewMode={setViewMode} />
          </Group>
        </Group>

        {/* Desktop Filter Controls */}
        <DeliveryFilterBarDesktop
          searchQuery={filters.searchQuery}
          customerId={filters.customerId}
          assignedTo={canViewAll ? filters.assignedTo : currentEmployeeId}
          selectedStatuses={filters.statuses}
          scheduledDateStart={filters.scheduledDateRange.start}
          scheduledDateEnd={filters.scheduledDateRange.end}
          hasActiveFilters={hasActiveFilters}
          onSearchChange={filterHandlers.setSearchQuery}
          onCustomerChange={filterHandlers.setCustomerId}
          onAssignedToChange={(assignedTo) => {
            filterHandlers.setAssignedTo(canViewAll ? assignedTo : currentEmployeeId);
          }}
          onStatusesChange={filterHandlers.setStatuses}
          onScheduledDateChange={filterHandlers.setScheduledDateRange}
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

        {/* Create Receive Request Modal */}
        <DeliveryCreateModal
          opened={createModalOpened}
          onClose={() => setCreateModalOpened(false)}
          onConfirm={createReceiveRequestAction.trigger}
          isLoading={createReceiveRequestAction.isMutating}
        />
      </DeliveryErrorBoundary>
    </AppDesktopLayout>
  );
}
