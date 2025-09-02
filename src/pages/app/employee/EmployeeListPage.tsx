import { useMemo } from 'react';
import { useNavigate } from 'react-router';
import { Stack, Group, Box, SimpleGrid, Select, SegmentedControl, Button } from '@mantine/core';
import { IconClearAll } from '@tabler/icons-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useClientSidePagination } from '@/hooks/useClientSidePagination';
import { useOnce } from '@/hooks/useOnce';
import { useEmployeeFilters } from '@/hooks/useEmployeeFilters';
import {
  useEmployeeList,
  useHrLoading,
  useHrError,
  useHrActions,
  useUnitList,
} from '@/stores/useHrStore';
import {
  Pagination,
  AppPageTitle,
  SearchBar,
  SwitchView,
  BlankState,
  AppMobileLayout,
  AppDesktopLayout,
  PermissionDeniedPage,
} from '@/components/common';
import {
  EmployeeCard,
  EmployeeDataTable,
  EmployeeGridCard,
  EmployeeListSkeleton,
  EmployeeFilterBar,
  EmployeeUnitDrawer,
  EmployeeStatusDrawer,
} from '@/components/app/employee';
import { useDeviceType } from '@/hooks/useDeviceType';
import { ROUTERS } from '@/config/routeConfig';
import { EMPLOYEE_STATUS } from '@/constants/employee';
import { useDisclosure } from '@mantine/hooks';
import { useViewMode } from '@/hooks/useViewMode';
import { usePermissions } from '@/stores/useAppStore';

export function EmployeeListPage() {
  const navigate = useNavigate();
  const { isMobile } = useDeviceType();
  const { t } = useTranslation();
  const permissions = usePermissions();
  const employees = useEmployeeList();
  const units = useUnitList();
  const isLoading = useHrLoading();
  const error = useHrError();
  const { refreshEmployees, clearError, loadUnits } = useHrActions();

  // Use the new employee filters hook
  const { filteredEmployees, filters, filterHandlers, hasActiveFilters, clearAllFilters } =
    useEmployeeFilters(employees);

  const { viewMode, isTableView, setViewMode } = useViewMode();

  // Drawer states using Mantine's useDisclosure directly
  const [unitDrawerOpened, { open: openUnitDrawer, close: closeUnitDrawer }] = useDisclosure(false);
  const [statusDrawerOpened, { open: openStatusDrawer, close: closeStatusDrawer }] =
    useDisclosure(false);

  // Use client-side pagination hook with filtered employees
  const [paginatedEmployees, paginationState, paginationHandlers] = useClientSidePagination({
    data: filteredEmployees,
    defaultPageSize: isMobile ? 1000 : undefined,
  });

  // Prepare department options for select
  const unitOptions = useMemo(
    () =>
      units.map((unit) => ({
        value: unit.id,
        label: unit.name,
      })),
    [units],
  );

  useOnce(() => {
    void refreshEmployees();
    void loadUnits();
  });

  if (!permissions.employee.canView) {
    return <PermissionDeniedPage />;
  }

  if (isMobile) {
    return (
      <AppMobileLayout
        showLogo
        isLoading={isLoading}
        error={error}
        clearError={clearError}
        header={<AppPageTitle title={t('employee.title')} />}
      >
        {/* Filter Bar */}
        <EmployeeFilterBar
          searchQuery={filters.searchQuery}
          unitId={filters.unitId}
          status={filters.status}
          units={units}
          hasActiveFilters={hasActiveFilters}
          onSearchChange={filterHandlers.setSearchQuery}
          onUnitClick={openUnitDrawer}
          onStatusClick={openStatusDrawer}
          onClearFilters={clearAllFilters}
        />

        {/* Unit Selection Drawer */}
        <EmployeeUnitDrawer
          opened={unitDrawerOpened}
          units={units}
          selectedUnitId={filters.unitId}
          onClose={closeUnitDrawer}
          onUnitSelect={filterHandlers.setUnitId}
        />

        {/* Status Selection Drawer */}
        <EmployeeStatusDrawer
          opened={statusDrawerOpened}
          selectedStatus={filters.status}
          onClose={closeStatusDrawer}
          onStatusSelect={filterHandlers.setStatus}
        />

        <BlankState
          hidden={paginationState.totalItems > 0 || isLoading}
          title={
            filters.searchQuery
              ? t('employee.noEmployeesFoundSearch')
              : t('employee.noEmployeesFound')
          }
          description={
            filters.searchQuery
              ? t('employee.tryDifferentSearch')
              : t('employee.createFirstEmployeeDescription')
          }
        />
        <Box mt="md">
          {isLoading && employees.length === 0 ? (
            <EmployeeListSkeleton count={5} />
          ) : (
            <Stack gap="sm" px="sm">
              {paginatedEmployees.map((employee) => (
                <EmployeeCard key={employee.id} noActions employee={employee} />
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
        title={t('employee.title')}
        button={{
          label: t('employee.addEmployee'),
          disabled: !permissions.employee.canCreate,
          onClick() {
            navigate(ROUTERS.EMPLOYEES_ADD);
          },
        }}
      />

      {/* Search Bar and View Mode Selector */}
      <Group justify="space-between" align="flex-end" my="xl">
        <SearchBar
          // hidden={paginationState.totalPages < 2}
          placeholder={t('employee.searchPlaceholder')}
          searchQuery={filters.searchQuery}
          setSearchQuery={filterHandlers.setSearchQuery}
        />
        <Select
          clearable
          searchable
          placeholder={t('employee.selectUnit')}
          data={[{ value: '', label: t('employee.allUnit') }, ...unitOptions]}
          value={filters.unitId || ''}
          style={{ flex: 1, maxWidth: 300 }}
          onChange={(value) => filterHandlers.setUnitId(value || undefined)}
        />
        {/* Filter Controls */}
        <Group justify="space-between" align="center" gap="xl">
          <SegmentedControl
            value={filters.status}
            data={[
              { label: t('employee.all'), value: EMPLOYEE_STATUS.ALL },
              { label: t('employee.active'), value: EMPLOYEE_STATUS.ACTIVE },
              { label: t('employee.inactive'), value: EMPLOYEE_STATUS.INACTIVE },
            ]}
            onChange={(value) =>
              filterHandlers.setStatus(
                value as (typeof EMPLOYEE_STATUS)[keyof typeof EMPLOYEE_STATUS],
              )
            }
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
          title={
            hasActiveFilters ? t('employee.noEmployeesFoundSearch') : t('employee.noEmployeesFound')
          }
          description={
            hasActiveFilters
              ? t('employee.tryDifferentSearch')
              : t('employee.createFirstEmployeeDescription')
          }
          button={
            hasActiveFilters
              ? undefined
              : {
                  label: t('employee.createFirstEmployee'),
                  disabled: !permissions.employee.canCreate,
                  onClick: () => navigate(ROUTERS.EMPLOYEES_ADD),
                }
          }
        />

        {paginationState.totalItems === 0 && !isLoading ? null : (
          <>
            {/* Desktop View - Table or Grid based on selection */}
            {isLoading && employees.length === 0 ? (
              <EmployeeListSkeleton viewMode={viewMode} count={10} />
            ) : isTableView ? (
              <EmployeeDataTable noAction employees={paginatedEmployees} />
            ) : (
              <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing="lg">
                {paginatedEmployees.map((employee) => (
                  <EmployeeGridCard key={employee.id} employee={employee} />
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
