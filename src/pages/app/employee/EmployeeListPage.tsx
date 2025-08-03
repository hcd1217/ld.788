import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import {
  Stack,
  Group,
  Box,
  SimpleGrid,
  Select,
  SegmentedControl,
  Badge,
  Button,
} from '@mantine/core';
import { IconUser, IconFilter } from '@tabler/icons-react';
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
  Drawer,
} from '@/components/common';
import {
  EmployeeCard,
  EmployeeDataTable,
  EmployeeGridCard,
  EmployeeListSkeleton,
} from '@/components/app/employee';
import useIsDesktop from '@/hooks/useIsDesktop';
import { ROUTERS } from '@/config/routeConfig';
import { useMobileDrawer } from '@/hooks/useMobileDrawer';
import { EMPLOYEE_STATUS, VIEW_MODE, type ViewModeType } from '@/constants/employee';

export function EmployeeListPage() {
  const navigate = useNavigate();
  const isDesktop = useIsDesktop();
  const { t } = useTranslation();
  const employees = useEmployeeList();
  const units = useUnitList();
  const isLoading = useHrLoading();
  const error = useHrError();
  const { refreshEmployees, clearError, loadUnits } = useHrActions();
  
  // Use the new employee filters hook
  const [filteredEmployees, filters, filterHandlers] = useEmployeeFilters(employees);
  
  const [viewMode, setViewMode] = useState<ViewModeType>(VIEW_MODE.TABLE);
  const {
    filterDrawerOpened,
    drawerExpanded,
    openFilterDrawer,
    setDrawerExpanded,
    handleDrawerClose,
  } = useMobileDrawer();

  // Use client-side pagination hook with filtered employees
  const [paginatedEmployees, paginationState, paginationHandlers] =
    useClientSidePagination({
      data: filteredEmployees,
      defaultPageSize: isDesktop ? undefined : 1000,
    });

  useOnce(() => {
    void refreshEmployees();
    void loadUnits();
  });

  // Prepare department options for select
  const unitOptions = useMemo(() => 
    units.map((unit) => ({
      value: unit.id,
      label: unit.name,
    })),
    [units]
  );

  if (!isDesktop) {
    return (
      <AppMobileLayout
        showLogo
        isLoading={isLoading}
        error={error}
        clearError={clearError}
        header={<AppPageTitle title={t('employee.title')} />}
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
              {filters.unitId ? (
                <Badge size="sm" variant="light" color="gray">
                  {units.find((unit) => unit.id === filters.unitId)?.name}
                </Badge>
              ) : null}
              {filters.status !== EMPLOYEE_STATUS.ALL && (
                <Badge size="sm" variant="light" color="gray">
                  {t(`employee.${filters.status}`)}
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
          title={t('employee.filterTitle')}
          expanded={drawerExpanded}
          onClose={handleDrawerClose}
          onExpandedChange={setDrawerExpanded}
        >
          <Stack gap="md">
            <SearchBar
              hidden={paginationState.totalPages < 2}
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
              onChange={(value) => filterHandlers.setUnitId(value || undefined)}
            />
            <SegmentedControl
              value={filters.status}
              data={[
                { label: t('employee.all'), value: EMPLOYEE_STATUS.ALL },
                { label: t('employee.active'), value: EMPLOYEE_STATUS.ACTIVE },
                { label: t('employee.inactive'), value: EMPLOYEE_STATUS.INACTIVE },
              ]}
              onChange={(value) => filterHandlers.setStatus(value as typeof EMPLOYEE_STATUS[keyof typeof EMPLOYEE_STATUS])}
            />
            <Button fullWidth onClick={handleDrawerClose}>
              {t('common.applyFilter')}
            </Button>
          </Stack>
        </Drawer>

        <BlankState
          hidden={paginationState.totalItems > 0 || isLoading}
          icon={<IconUser size={48} color="var(--mantine-color-gray-5)" aria-hidden="true" />}
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
    <AppDesktopLayout
      isLoading={isLoading}
      error={error}
      clearError={clearError}
    >
      <AppPageTitle
        title={t('employee.title')}
        button={{
          label: t('employee.addEmployee'),
          onClick() {
            navigate(ROUTERS.EMPLOYEES_ADD);
          },
        }}
      />

      {/* Search Bar and View Mode Selector */}
      <Group justify="space-between" align="flex-end">
        <SearchBar
          hidden={paginationState.totalPages < 2}
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
            onChange={(value) => filterHandlers.setStatus(value as typeof EMPLOYEE_STATUS[keyof typeof EMPLOYEE_STATUS])}
          />
          <SwitchView viewMode={viewMode} setViewMode={setViewMode} />
        </Group>
      </Group>

      <div>
        <BlankState
          hidden={paginationState.totalItems > 0 || isLoading}
          icon={<IconUser size={48} color="var(--mantine-color-gray-5)" aria-hidden="true" />}
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
          button={
            filters.searchQuery
              ? undefined
              : {
                label: t('employee.createFirstEmployee'),
                onClick: () => navigate(ROUTERS.EMPLOYEES_ADD),
              }
          }
        />

        {paginationState.totalItems === 0 && !isLoading ? null : (
          <>
            {/* Desktop View - Table or Grid based on selection */}
            {isLoading && employees.length === 0 ? (
              <EmployeeListSkeleton viewMode={viewMode} count={10} />
            ) : viewMode === VIEW_MODE.TABLE ? (
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
