import { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import {
  Stack,
  Group,
  Box,
  SimpleGrid,
  Button,
  Affix,
  ActionIcon,
  Loader,
  Text,
  Center,
  Flex,
} from '@mantine/core';
import { IconFileInvoice, IconPlus, IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { useTranslation } from '@/hooks/useTranslation';
import { usePOFilters } from '@/hooks/usePOFilters';
import {
  usePurchaseOrderList,
  usePOLoading,
  usePOError,
  usePOActions,
  usePOPaginationState,
} from '@/stores/usePOStore';
import { useCustomers } from '@/stores/useAppStore';
import {
  AppPageTitle,
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
  POFilterBarDesktop,
  POFilterBarMobile,
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
  const customers = useCustomers();
  const isLoading = usePOLoading();
  const error = usePOError();
  const { loadPOsWithFilter, loadMorePOs, loadNextPage, loadPreviousPage, clearError } =
    usePOActions();
  const { hasMorePOs, hasPreviousPage, isLoadingMore, currentPage } = usePOPaginationState();

  // Search input state with debounce
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch] = useDebouncedValue(searchInput, 300);

  // Use the PO filters hook for filter state management only
  // Note: We don't use filteredPOs anymore since filtering happens server-side
  const { filters, filterHandlers, hasActiveFilters, clearAllFilters } = usePOFilters(
    [], // Empty array since we don't need client-side filtering
    debouncedSearch,
  );

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

  const hasOrderDateFilter = !!(filters.orderDateRange.start || filters.orderDateRange.end);
  const hasDeliveryDateFilter = !!(
    filters.deliveryDateRange.start || filters.deliveryDateRange.end
  );

  // Create stable filter params with useMemo to prevent unnecessary re-renders
  const filterParams = useMemo(
    () => ({
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
    }),
    [
      filters.customerId,
      filters.statuses,
      debouncedSearch,
      filters.orderDateRange.start,
      filters.orderDateRange.end,
      filters.deliveryDateRange.start,
      filters.deliveryDateRange.end,
    ],
  );

  // Effect to load POs when filter params change
  useEffect(() => {
    void loadPOsWithFilter(filterParams, true);
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
    navigate(ROUTERS.PO_ADD);
  }, [navigate]);

  // Initial load is handled by filter effect

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
          {/* Mobile Filter Bar */}
          <POFilterBarMobile
            searchQuery={searchInput}
            customerId={filters.customerId}
            selectedStatuses={filters.statuses}
            hasOrderDateFilter={hasOrderDateFilter}
            hasDeliveryDateFilter={hasDeliveryDateFilter}
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
          <PODateDrawer
            opened={dateDrawerOpened}
            orderDateStart={filters.orderDateRange.start}
            orderDateEnd={filters.orderDateRange.end}
            deliveryDateStart={filters.deliveryDateRange.start}
            deliveryDateEnd={filters.deliveryDateRange.end}
            onClose={closeDateDrawer}
            onOrderDateRangeSelect={filterHandlers.setOrderDateRange}
            onDeliveryDateRangeSelect={filterHandlers.setDeliveryDateRange}
          />

          <BlankState
            hidden={purchaseOrders.length > 0 || isLoading}
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
                {purchaseOrders.map((po) => (
                  <POCard key={po.id} noActions isLoading={isLoading} purchaseOrder={po} />
                ))}
              </Stack>
            )}
          </Box>

          {/* Mobile Pagination Controls */}
          {purchaseOrders.length > 0 && !isLoading && (
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
                disabled={!hasMorePOs || isLoading}
                size="sm"
              >
                {t('common.next')}
              </Button>
            </Flex>
          )}

          {/* Floating Action Button for Add PO */}
          {!isLoading && (
            <Affix position={{ bottom: 120, right: 20 }}>
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

        {/* Desktop Filter Controls */}
        <POFilterBarDesktop
          searchQuery={searchInput}
          customerId={filters.customerId}
          selectedStatuses={filters.statuses}
          orderDateStart={filters.orderDateRange.start}
          orderDateEnd={filters.orderDateRange.end}
          deliveryDateStart={filters.deliveryDateRange.start}
          deliveryDateEnd={filters.deliveryDateRange.end}
          customers={customers}
          hasActiveFilters={hasActiveFilters}
          onSearchChange={setSearchInput}
          onCustomerChange={filterHandlers.setCustomerId}
          onStatusesChange={filterHandlers.setStatuses}
          onOrderDateChange={filterHandlers.setOrderDateRange}
          onDeliveryDateChange={filterHandlers.setDeliveryDateRange}
          onClearFilters={clearAllFilters}
        />

        {/* View Mode Switch */}
        <Group justify="end" mb="md">
          <SwitchView viewMode={viewMode} setViewMode={setViewMode} />
        </Group>

        {/* Content Area */}
        <BlankState
          hidden={purchaseOrders.length > 0 || isLoading}
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

        {/* Data Display */}
        {(purchaseOrders.length > 0 || isLoading) && (
          <>
            {isLoading && purchaseOrders.length === 0 ? (
              <POListSkeleton viewMode={viewMode} count={10} />
            ) : isTableView ? (
              <PODataTable noAction isLoading={isLoading} purchaseOrders={purchaseOrders} />
            ) : (
              <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing="lg">
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

        {/* Note: Desktop now uses inline controls in POFilterBarDesktop, no drawers needed */}
      </POErrorBoundary>
    </AppDesktopLayout>
  );
}
