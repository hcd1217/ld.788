import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useNavigate } from 'react-router';

import {
  ActionIcon,
  Affix,
  Button,
  Center,
  Container,
  Flex,
  Group,
  Loader,
  SimpleGrid,
  Stack,
  Text,
} from '@mantine/core';
import { useDebouncedValue, useDisclosure } from '@mantine/hooks';
import { IconChevronLeft, IconChevronRight, IconPlus, IconTruck } from '@tabler/icons-react';

import { BulkDeliveryModal } from '@/components/app/delivery';
import {
  POAdvancedFiltersDrawer,
  POCard,
  PODataTable,
  POErrorBoundary,
  POFilterBarDesktop,
  POFilterBarMobile,
  POFilterPills,
  POGridCard,
  POListSkeleton,
  POStatusDrawer,
} from '@/components/app/po';
import {
  AppDesktopLayout,
  AppMobileLayout,
  AppPageTitle,
  BlankState,
  PermissionDeniedPage,
  SwitchView,
} from '@/components/common';
import { ROUTERS } from '@/config/routeConfig';
import { PO_STATUS } from '@/constants/purchaseOrder';
import { useDeviceType } from '@/hooks/useDeviceType';
import { usePOFilters } from '@/hooks/usePOFilters';
import { useSWRAction } from '@/hooks/useSWRAction';
import { useTranslation } from '@/hooks/useTranslation';
import { useViewMode } from '@/hooks/useViewMode';
import { useMe, usePermissions } from '@/stores/useAppStore';
import { useDeliveryRequestActions } from '@/stores/useDeliveryRequestStore';
import {
  usePOActions,
  usePOError,
  usePOLoading,
  usePOPaginationState,
  usePurchaseOrderList,
} from '@/stores/usePOStore';
import type { Timeout } from '@/types';
import { xOr } from '@/utils/boolean';
import {
  canCreatePurchaseOrder,
  canViewAllPurchaseOrder,
  canViewPurchaseOrder,
} from '@/utils/permission.utils';
import { STORAGE_KEYS } from '@/utils/storageKeys';

export function POListPage() {
  const navigate = useNavigate();
  const { isMobile, isDesktop } = useDeviceType();
  const { t } = useTranslation();
  const currentUser = useMe();
  const permissions = usePermissions();
  const { canView, canViewAll, canCreate } = useMemo(
    () => ({
      canView: canViewPurchaseOrder(permissions),
      canViewAll: canViewAllPurchaseOrder(permissions),
      canCreate: canCreatePurchaseOrder(permissions),
    }),
    [permissions],
  );
  const purchaseOrders = usePurchaseOrderList();
  const isLoading = usePOLoading();
  const error = usePOError();
  const { loadPOsWithFilter, loadMorePOs, loadNextPage, loadPreviousPage, clearError } =
    usePOActions();
  const { hasMorePOs, hasPreviousPage, isLoadingMore, currentPage } = usePOPaginationState();
  // Use the PO filters hook for filter state management
  const { filters, filterHandlers, hasActiveFilters } = usePOFilters();

  // Debounce the search query for API calls (1 second delay)
  const [debouncedSearch] = useDebouncedValue(filters.searchQuery, 1000);

  // Filter loading state for UI lock
  const [isFilterLoading, setIsFilterLoading] = useState(false);
  const filterTimeoutRef = useRef<Timeout | undefined>(undefined);

  const { viewMode, isTableView, setViewMode } = useViewMode();

  // Drawer states using Mantine's useDisclosure directly
  const [statusDrawerOpened, { open: openStatusDrawer, close: closeStatusDrawer }] =
    useDisclosure(false);
  const [
    advancedFiltersDrawerOpened,
    { open: openAdvancedFiltersDrawer, close: closeAdvancedFiltersDrawer },
  ] = useDisclosure(false);

  // Scroll detection state
  const [isNearBottom, setIsNearBottom] = useState(false);
  const lastLoadTimeRef = useRef<number>(0);

  // Selection mode for bulk delivery creation (desktop table view only)
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedPOIds, setSelectedPOIds] = useState<string[]>([]);
  const [deliveryModalOpened, { open: openDeliveryModal, close: closeDeliveryModal }] =
    useDisclosure(false);

  // Delivery request actions
  const { createDeliveryRequest } = useDeliveryRequestActions();

  // Create bulk delivery requests action
  const createBulkDeliveryAction = useSWRAction(
    'create-bulk-delivery-from-po-list',
    async (data: {
      assignedTo: string;
      scheduledDate: string;
      notes: string;
      isUrgentDelivery: boolean;
    }) => {
      // Create delivery request for each selected PO
      for (const poId of selectedPOIds) {
        await createDeliveryRequest({
          type: 'DELIVERY',
          assignedTo: data.assignedTo,
          scheduledDate: data.scheduledDate,
          notes: data.notes,
          isUrgentDelivery: data.isUrgentDelivery,
          purchaseOrderId: poId,
        });
      }
      closeDeliveryModal();
      await loadPOsWithFilter(filterParams, true);
    },
    {
      onSuccess: () => {
        setSelectedPOIds([]);
        setSelectionMode(false);
      },
      onError: (error: Error) => {
        console.error('Failed to create delivery requests:', error);
      },
    },
  );

  // Create stable filter params with useMemo to prevent unnecessary re-renders
  const filterParams = useMemo(
    () => ({
      salesId: filters.salesId || (canViewAll ? undefined : currentUser?.employee?.id),
      customerId: filters.customerId,
      // Filter out 'all' status before passing to API
      statuses:
        filters.statuses.length > 0
          ? filters.statuses.filter((s) => s !== PO_STATUS.ALL)
          : undefined,
      poNumber: debouncedSearch || undefined,
      orderDateFrom: filters.orderDateRange.start?.toISOString(),
      orderDateTo: filters.orderDateRange.end?.toISOString(),
      deliveryDateFrom: filters.deliveryDateRange.start?.toISOString(),
      deliveryDateTo: filters.deliveryDateRange.end?.toISOString(),
      sortBy: 'orderDate' as const, // Sort by order date (deliveryDate not available in sortBy)
      sortOrder: 'asc' as const, // Ascending order
    }),
    [
      filters.salesId,
      filters.customerId,
      filters.statuses,
      debouncedSearch,
      filters.orderDateRange.start,
      filters.orderDateRange.end,
      filters.deliveryDateRange.start,
      filters.deliveryDateRange.end,
      canViewAll,
      currentUser,
    ],
  );

  // Effect to load POs when filter params change with forced delay for ALL filters
  useEffect(() => {
    // Skip API call if setting incomplete date range
    if (xOr(filterParams.deliveryDateFrom, filterParams.deliveryDateTo)) {
      setIsFilterLoading(false);
      return;
    }
    if (xOr(filterParams.orderDateFrom, filterParams.orderDateTo)) {
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
      void loadPOsWithFilter(filterParams, true);
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
    if (isNearBottom && hasMorePOs && !isLoadingMore && !isLoading) {
      // Prevent rapid successive loads (minimum 500ms between loads)
      const now = Date.now();
      const timeSinceLastLoad = now - lastLoadTimeRef.current;

      if (timeSinceLastLoad >= 500) {
        lastLoadTimeRef.current = now;
        void loadMorePOs();
      }
    }
  }, [isNearBottom, hasMorePOs, isLoadingMore, isLoading, loadMorePOs]);

  // Memoized navigation handlers
  const handleNavigateToAdd = useCallback(() => {
    if (!canCreate) {
      return;
    }
    navigate(ROUTERS.PO_ADD);
  }, [navigate, canCreate]);

  // Common BlankState configuration to reduce duplication
  const blankStateProps = useMemo(
    () => ({
      hidden: purchaseOrders.length > 0 || isLoading,
      title: hasActiveFilters ? t('po.noPOsFoundSearch') : t('po.noPOsFound'),
      description: hasActiveFilters
        ? t('common.tryDifferentSearch')
        : t('po.createFirstPODescription'),
    }),
    [purchaseOrders.length, isLoading, hasActiveFilters, t],
  );

  if (!canView) {
    return <PermissionDeniedPage />;
  }

  // Initial load is handled by filter effect

  if (isMobile) {
    // Date filter indicators for mobile view
    const hasOrderDateFilter = !!(filters.orderDateRange.start || filters.orderDateRange.end);
    const hasDeliveryDateFilter = !!(
      filters.deliveryDateRange.start || filters.deliveryDateRange.end
    );

    return (
      <AppMobileLayout
        showLogo
        isLoading={isLoading || isFilterLoading}
        error={error}
        clearError={clearError}
        header={<AppPageTitle title={t('po.title')} />}
      >
        <POErrorBoundary componentName="POListPage">
          {/* Mobile Filter Bar */}
          <POFilterBarMobile
            searchQuery={filters.searchQuery}
            customerId={filters.customerId}
            salesId={filters.salesId}
            selectedStatuses={filters.statuses}
            hasOrderDateFilter={hasOrderDateFilter}
            hasDeliveryDateFilter={hasDeliveryDateFilter}
            hasActiveFilters={hasActiveFilters}
            onSearchChange={filterHandlers.setSearchQuery}
            onStatusClick={openStatusDrawer}
            onAdvancedFiltersClick={openAdvancedFiltersDrawer}
            onClearFilters={filterHandlers.resetFilters}
          />

          {/* Status Selection Drawer */}
          <POStatusDrawer
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

          {/* Advanced Filters Drawer */}
          <POAdvancedFiltersDrawer
            opened={advancedFiltersDrawerOpened}
            customerId={filters.customerId}
            salesId={filters.salesId}
            orderDateStart={filters.orderDateRange.start}
            orderDateEnd={filters.orderDateRange.end}
            deliveryDateStart={filters.deliveryDateRange.start}
            deliveryDateEnd={filters.deliveryDateRange.end}
            onClose={closeAdvancedFiltersDrawer}
            onCustomerChange={filterHandlers.setCustomerId}
            onSalesIdChange={filterHandlers.setSalesId}
            onOrderDateRangeSelect={filterHandlers.setOrderDateRange}
            onDeliveryDateRangeSelect={filterHandlers.setDeliveryDateRange}
          />

          <BlankState {...blankStateProps} />
          <Stack mt="md" gap={0}>
            {isLoading && purchaseOrders.length === 0 ? (
              <POListSkeleton count={5} />
            ) : (
              <Stack gap="sm" px="sm">
                {purchaseOrders.map((po) => (
                  <POCard key={po.id} isLoading={isLoading} purchaseOrder={po} />
                ))}
              </Stack>
            )}
          </Stack>

          {/* Mobile Pagination Controls */}
          {purchaseOrders.length > 0 && !isLoading && (
            <Flex justify="space-between" align="center" px="md" py="sm" mt="md">
              <Button
                variant="light"
                leftSection={<IconChevronLeft size={16} />}
                onClick={() => void loadPreviousPage()}
                disabled={!hasPreviousPage || isLoading || !canView}
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
                disabled={!hasMorePOs || isLoading}
                size="sm"
              >
                {t('common.next')}
              </Button>
            </Flex>
          )}

          {/* Floating Action Button for Add PO */}
          {!isLoading && canCreate && (
            <Affix position={{ bottom: 80, right: 10 }}>
              <ActionIcon size="xl" radius="xl" color="blue" onClick={handleNavigateToAdd}>
                <IconPlus size={24} />
              </ActionIcon>
            </Affix>
          )}
        </POErrorBoundary>
      </AppMobileLayout>
    );
  }

  return (
    <AppDesktopLayout
      isLoading={isLoading || isFilterLoading}
      error={error}
      clearError={clearError}
    >
      <POErrorBoundary componentName="POListPage">
        <Container fluid px="xl">
          <Group justify="space-between" mb="lg">
          <AppPageTitle title={t('po.title')} />
          <Group gap="sm">
            <SwitchView viewMode={viewMode} setViewMode={setViewMode} />
            {isTableView && !selectionMode && (
              <Button
                variant="light"
                leftSection={<IconTruck size={16} />}
                onClick={() => setSelectionMode(true)}
                disabled={!canCreate}
              >
                {t('po.createBulkDelivery')}
              </Button>
            )}
            {isTableView && selectionMode && (
              <Button
                leftSection={<IconTruck size={16} />}
                onClick={openDeliveryModal}
                disabled={selectedPOIds.length === 0}
              >
                {t('po.createDeliveryRequests', { count: selectedPOIds.length })}
              </Button>
            )}
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={handleNavigateToAdd}
              disabled={!canCreate}
            >
              {t('po.addPO')}
            </Button>
          </Group>
        </Group>

        {/* Desktop Filter Controls */}
        <POFilterBarDesktop
          searchQuery={filters.searchQuery}
          customerId={filters.customerId}
          salesId={filters.salesId}
          selectedStatuses={filters.statuses}
          orderDateStart={filters.orderDateRange.start}
          orderDateEnd={filters.orderDateRange.end}
          deliveryDateStart={filters.deliveryDateRange.start}
          deliveryDateEnd={filters.deliveryDateRange.end}
          hasActiveFilters={hasActiveFilters}
          onSearchChange={filterHandlers.setSearchQuery}
          onCustomerChange={filterHandlers.setCustomerId}
          onSalesIdChange={filterHandlers.setSalesId}
          onStatusesChange={filterHandlers.setStatuses}
          onOrderDateChange={filterHandlers.setOrderDateRange}
          onDeliveryDateChange={filterHandlers.setDeliveryDateRange}
          onClearFilters={filterHandlers.resetFilters}
        />

        {/* Active Filter Pills */}
        <POFilterPills
          customerId={filters.customerId}
          salesId={filters.salesId}
          selectedStatuses={filters.statuses}
          orderDateStart={filters.orderDateRange.start}
          orderDateEnd={filters.orderDateRange.end}
          deliveryDateStart={filters.deliveryDateRange.start}
          deliveryDateEnd={filters.deliveryDateRange.end}
          onRemoveCustomer={() => filterHandlers.setCustomerId(undefined)}
          onRemoveSalesId={() => filterHandlers.setSalesId(undefined)}
          onRemoveStatus={filterHandlers.toggleStatus}
          onRemoveOrderDate={() => filterHandlers.setOrderDateRange(undefined, undefined)}
          onRemoveDeliveryDate={() => filterHandlers.setDeliveryDateRange(undefined, undefined)}
        />

        {/* Content Area */}
        <BlankState
          {...blankStateProps}
          button={
            hasActiveFilters
              ? undefined
              : {
                  label: t('po.createFirstPO'),
                  onClick: handleNavigateToAdd,
                  disabled: !canCreate,
                }
          }
        />

        {/* Data Display */}
        {(purchaseOrders.length > 0 || isLoading || isFilterLoading) && (
          <>
            {(isLoading || isFilterLoading) && purchaseOrders.length === 0 ? (
              <POListSkeleton viewMode={viewMode} count={10} />
            ) : isTableView ? (
              <PODataTable
                noAction={isLoading || isFilterLoading}
                isLoading={isLoading || isFilterLoading}
                purchaseOrders={purchaseOrders}
                selectionMode={selectionMode}
                selectedPOIds={selectedPOIds}
                onSelectionChange={setSelectedPOIds}
              />
            ) : (
              <SimpleGrid
                cols={{ base: 1, md: 2, lg: 3 }}
                spacing="lg"
                style={{ opacity: isFilterLoading ? 0.5 : 1 }}
              >
                {purchaseOrders.map((po) => (
                  <POGridCard key={po.id} purchaseOrder={po} />
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
            {!hasMorePOs && purchaseOrders.length > 0 && (
              <Center py="md">
                <Text size="sm" c="dimmed">
                  {t('po.noMorePOs')}
                </Text>
              </Center>
            )}
          </>
        )}

        {/* Bulk Delivery Creation Modal */}
        <BulkDeliveryModal
          opened={deliveryModalOpened}
          onClose={() => {
            closeDeliveryModal();
            setSelectionMode(false);
            setSelectedPOIds([]);
          }}
          selectedCount={selectedPOIds.length}
          onSubmit={createBulkDeliveryAction.trigger}
          isLoading={createBulkDeliveryAction.isMutating}
        />
        </Container>
      </POErrorBoundary>
    </AppDesktopLayout>
  );
}
