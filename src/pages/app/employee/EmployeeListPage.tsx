import { useMemo } from 'react';

import { useNavigate } from 'react-router';

import { Box, Button, Group, SegmentedControl, Select, SimpleGrid, Stack } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconClearAll } from '@tabler/icons-react';

import {
  EmployeeCard,
  EmployeeDataTable,
  EmployeeDepartmentDrawer,
  EmployeeFilterBar,
  EmployeeGridCard,
  EmployeeListSkeleton,
  EmployeeStatusDrawer,
} from '@/components/app/employee';
import {
  AppDesktopLayout,
  AppMobileLayout,
  AppPageTitle,
  BlankState,
  Pagination,
  PermissionDeniedPage,
  SearchBar,
  SwitchView,
} from '@/components/common';
import { ROUTERS } from '@/config/routeConfig';
import { EMPLOYEE_STATUS } from '@/constants/employee';
import { useClientSidePagination } from '@/hooks/useClientSidePagination';
import { useDeviceType } from '@/hooks/useDeviceType';
import { useEmployeeFilters } from '@/hooks/useEmployeeFilters';
import { useOnce } from '@/hooks/useOnce';
import { useTranslation } from '@/hooks/useTranslation';
import { useViewMode } from '@/hooks/useViewMode';
import { useDepartmentOptions, usePermissions } from '@/stores/useAppStore';
import { useEmployeeList, useHrActions, useHrError, useHrLoading } from '@/stores/useHrStore';
import { canCreateEmployee, canViewEmployee } from '@/utils/permission.utils';

export function EmployeeListPage() {
  const navigate = useNavigate();
  const { isMobile } = useDeviceType();
  const { viewMode, isTableView, setViewMode } = useViewMode();
  const { t } = useTranslation();
  const permissions = usePermissions();
  const employees = useEmployeeList();
  const departmentOptions = useDepartmentOptions();
  const isLoading = useHrLoading();
  const error = useHrError();
  const { refreshEmployees, clearError } = useHrActions();
  const { canView, canCreate } = useMemo(() => {
    return {
      canView: canViewEmployee(permissions),
      canCreate: canCreateEmployee(permissions),
    };
  }, [permissions]);

  // Memoize the combined department options to prevent re-renders
  const departmentSelectData = useMemo(() => {
    return [{ value: '', label: t('employee.allDepartment') }, ...departmentOptions];
  }, [departmentOptions, t]);

  // Use the new employee filters hook
  const { filteredEmployees, filters, filterHandlers, hasActiveFilters, clearAllFilters } =
    useEmployeeFilters(employees);

  // Drawer states using Mantine's useDisclosure directly
  const [departmentDrawerOpened, { open: openDepartmentDrawer, close: closeDepartmentDrawer }] =
    useDisclosure(false);
  const [statusDrawerOpened, { open: openStatusDrawer, close: closeStatusDrawer }] =
    useDisclosure(false);

  // Use client-side pagination hook with filtered employees
  const [paginatedEmployees, paginationState, paginationHandlers] = useClientSidePagination({
    data: filteredEmployees,
    defaultPageSize: isMobile ? 1000 : undefined,
  });

  useOnce(() => {
    if (canView) {
      void refreshEmployees();
    }
  });

  if (!canView) {
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
          departmentId={filters.departmentId}
          status={filters.status}
          hasActiveFilters={hasActiveFilters}
          onSearchChange={filterHandlers.setSearchQuery}
          onDepartmentClick={openDepartmentDrawer}
          onStatusClick={openStatusDrawer}
          onClearFilters={clearAllFilters}
        />

        {/* Department Selection Drawer */}
        <EmployeeDepartmentDrawer
          opened={departmentDrawerOpened}
          selectedDepartmentId={filters.departmentId}
          onClose={closeDepartmentDrawer}
          onDepartmentSelect={filterHandlers.setDepartmentId}
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
              ? t('common.tryDifferentSearch')
              : t('employee.createFirstEmployeeDescription')
          }
        />
        <Box mt="md">
          {isLoading && employees.length === 0 ? (
            <EmployeeListSkeleton count={5} />
          ) : (
            <Stack gap="sm" px="sm">
              {paginatedEmployees.map((employee) => (
                <EmployeeCard key={employee.id} employee={employee} />
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
          disabled: !canCreate,
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
          placeholder={t('employee.selectDepartment')}
          data={departmentSelectData}
          value={filters.departmentId || ''}
          style={{ flex: 1, maxWidth: 300 }}
          onChange={(value) => filterHandlers.setDepartmentId(value || undefined)}
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
              ? t('common.tryDifferentSearch')
              : t('employee.createFirstEmployeeDescription')
          }
          button={
            hasActiveFilters
              ? undefined
              : {
                  label: t('employee.createFirstEmployee'),
                  disabled: !canCreate,
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
              <EmployeeDataTable employees={paginatedEmployees} />
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
        hidden={employees.length < 20}
        totalPages={paginationState.totalPages}
        pageSize={paginationState.pageSize}
        currentPage={paginationState.currentPage}
        onPageSizeChange={paginationHandlers.setPageSize}
        onPageChange={paginationHandlers.setCurrentPage}
      />
    </AppDesktopLayout>
  );
}
