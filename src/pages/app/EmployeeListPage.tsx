import {useEffect, useState, useCallback} from 'react';
import {useNavigate} from 'react-router';
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
import {IconUser, IconFilter} from '@tabler/icons-react';
import {useDisclosure} from '@mantine/hooks';
import {notifications} from '@mantine/notifications';
import useTranslation from '@/hooks/useTranslation';
import {useClientSidePagination} from '@/hooks/useClientSidePagination';
import type {Employee} from '@/lib/api/schemas/hr.schemas';
import {
  useEmployeeList,
  useHrLoading,
  useHrError,
  useHrActions,
  useDepartmentList,
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
  EmployeeDeactivateModal,
  EmployeeActivateModal,
} from '@/components/app/employee';
import useIsDesktop from '@/hooks/useIsDesktop';

interface EmployeeFilters {
  searchQuery: string;
  departmentId: string | undefined;
  status: 'all' | 'active' | 'inactive';
}

export function EmployeeListPage() {
  const navigate = useNavigate();
  const employees = useEmployeeList();
  const departments = useDepartmentList();
  const isLoading = useHrLoading();
  const error = useHrError();
  const {
    refreshEmployees,
    deactivateEmployee,
    activateEmployee,
    clearError,
    loadDepartments,
  } = useHrActions();
  const [filters, setFilters] = useState<EmployeeFilters>({
    searchQuery: '',
    departmentId: undefined,
    status: 'all',
  });
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [employeeToDeactivate, setEmployeeToDeactivate] = useState<
    Employee | undefined
  >(undefined);
  const [employeeToActivate, setEmployeeToActivate] = useState<
    Employee | undefined
  >(undefined);
  const [
    deactivateModalOpened,
    {open: openDeactivateModal, close: closeDeactivateModal},
  ] = useDisclosure(false);
  const [
    activateModalOpened,
    {open: openActivateModal, close: closeActivateModal},
  ] = useDisclosure(false);
  const [
    filterDrawerOpened,
    {open: openFilterDrawer, close: closeFilterDrawer},
  ] = useDisclosure(false);
  const [drawerExpanded, setDrawerExpanded] = useState(false);
  const isDesktop = useIsDesktop();
  const {t} = useTranslation();

  // Use client-side pagination hook
  const defaultPageSize = isDesktop ? undefined : 1000;
  const [paginatedEmployees, paginationState, paginationHandlers] =
    useClientSidePagination({
      data: employees,
      filterFn: employeeFilterFn,
      filters,
      defaultPageSize,
    });

  useEffect(() => {
    void refreshEmployees();
    void loadDepartments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reset drawer state when closed
  const handleDrawerClose = useCallback(() => {
    closeFilterDrawer();
    setDrawerExpanded(false);
  }, [closeFilterDrawer]);

  const handleDeactivateEmployee = (employee: Employee) => {
    setEmployeeToDeactivate(employee);
    openDeactivateModal();
  };

  const handleActivateEmployee = (employee: Employee) => {
    setEmployeeToActivate(employee);
    openActivateModal();
  };

  const confirmDeactivateEmployee = async () => {
    if (!employeeToDeactivate) return;
    try {
      await deactivateEmployee(employeeToDeactivate.id);
      notifications.show({
        title: t('common.success'),
        message: t('employee.employeeDeactivated'),
        color: 'green',
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : t('employee.deactivateEmployeeFailed');
      notifications.show({
        title: t('common.error'),
        message: errorMessage,
        color: 'red',
      });
    }

    closeDeactivateModal();
  };

  const confirmActivateEmployee = async () => {
    if (!employeeToActivate) return;

    try {
      await activateEmployee(employeeToActivate.id);
      notifications.show({
        title: t('common.success'),
        message: t('employee.employeeActivated'),
        color: 'green',
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : t('employee.activateEmployeeFailed');
      notifications.show({
        title: t('common.error'),
        message: errorMessage,
        color: 'red',
      });
    }

    closeActivateModal();
  };

  // Prepare department options for select
  const departmentOptions = departments.map((dept) => ({
    value: dept.id,
    label: dept.name,
  }));

  if (!isDesktop) {
    return (
      <AppMobileLayout
        withLogo
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
              Filter
            </Button>
            <Group gap="xs">
              {/* Show active filter indicators */}
              {filters.searchQuery ? (
                <Badge size="sm" variant="light" color="gray">
                  {t('common.search')}: {filters.searchQuery}
                </Badge>
              ) : null}
              {filters.departmentId ? (
                <Badge size="sm" variant="light" color="gray">
                  {departments.find((d) => d.id === filters.departmentId)?.name}
                </Badge>
              ) : null}
              {filters.status !== 'all' && (
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
              placeholder={t('employee.searchPlaceholder')}
              searchQuery={filters.searchQuery}
              setSearchQuery={(query) => {
                setFilters({...filters, searchQuery: query});
              }}
            />
            <Select
              clearable
              searchable
              placeholder={t('employee.selectDepartment')}
              data={[
                {value: '', label: t('employee.allUnit')},
                ...departmentOptions,
              ]}
              value={filters.departmentId || ''}
              onChange={(value) => {
                setFilters({...filters, departmentId: value || undefined});
              }}
            />
            <SegmentedControl
              value={filters.status}
              data={[
                {label: t('employee.all'), value: 'all'},
                {label: t('employee.active'), value: 'active'},
                {label: t('employee.inactive'), value: 'inactive'},
              ]}
              onChange={(value) => {
                setFilters({
                  ...filters,
                  status: value as 'all' | 'active' | 'inactive',
                });
              }}
            />
            <Button fullWidth onClick={handleDrawerClose}>
              Apply Filters
            </Button>
          </Stack>
        </Drawer>

        <BlankState
          hidden={paginationState.totalItems > 0 || isLoading}
          icon={<IconUser size={48} color="var(--mantine-color-gray-5)" />}
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
          <Stack gap="sm" px="sm">
            {paginatedEmployees.map((employee) => (
              <EmployeeCard key={employee.id} noActions employee={employee} />
            ))}
          </Stack>
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
            navigate('/employees/add');
          },
        }}
      />

      {/* Search Bar and View Mode Selector */}
      <Group justify="space-between" align="flex-end">
        <SearchBar
          hidden={employees.length < 11}
          placeholder={t('employee.searchPlaceholder')}
          searchQuery={filters.searchQuery}
          setSearchQuery={(query) => {
            setFilters({...filters, searchQuery: query});
          }}
        />
        {/* Filter Controls */}
        <Select
          clearable
          searchable
          placeholder={t('employee.selectDepartment')}
          data={[
            {value: '', label: t('employee.allUnit')},
            ...departmentOptions,
          ]}
          value={filters.departmentId || ''}
          style={{flex: 1, maxWidth: 300}}
          onChange={(value) => {
            setFilters({...filters, departmentId: value || undefined});
          }}
        />
        <SegmentedControl
          value={filters.status}
          data={[
            {label: t('employee.all'), value: 'all'},
            {label: t('employee.active'), value: 'active'},
            {label: t('employee.inactive'), value: 'inactive'},
          ]}
          onChange={(value) => {
            setFilters({
              ...filters,
              status: value as 'all' | 'active' | 'inactive',
            });
          }}
        />
        <SwitchView viewMode={viewMode} setViewMode={setViewMode} />
      </Group>

      <div>
        <BlankState
          hidden={paginationState.totalItems > 0 || isLoading}
          icon={<IconUser size={48} color="var(--mantine-color-gray-5)" />}
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
                  onClick: () => navigate('/employees/add'),
                }
          }
        />

        {paginationState.totalItems === 0 && !isLoading ? null : (
          <>
            {/* Desktop View - Table or Grid based on selection */}
            {viewMode === 'table' ? (
              <EmployeeDataTable
                noAction
                employees={paginatedEmployees}
                onDeactivateEmployee={(employee) => {
                  handleDeactivateEmployee(employee);
                }}
                onActivateEmployee={(employee) => {
                  handleActivateEmployee(employee);
                }}
              />
            ) : (
              <SimpleGrid cols={{base: 1, md: 2, lg: 3}} spacing="lg">
                {paginatedEmployees.map((employee) => (
                  <EmployeeGridCard
                    key={employee.id}
                    employee={employee}
                    onDeactivate={() => {
                      handleDeactivateEmployee(employee);
                    }}
                    onActivate={() => {
                      handleActivateEmployee(employee);
                    }}
                  />
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

      {/* Deactivate Confirmation Modal */}
      <EmployeeDeactivateModal
        opened={deactivateModalOpened}
        employee={employeeToDeactivate}
        onClose={closeDeactivateModal}
        onConfirm={confirmDeactivateEmployee}
      />

      {/* Activate Confirmation Modal */}
      <EmployeeActivateModal
        opened={activateModalOpened}
        employee={employeeToActivate}
        onClose={closeActivateModal}
        onConfirm={confirmActivateEmployee}
      />
    </AppDesktopLayout>
  );
}

// Employee filter function
function employeeFilterFn(employee: Employee, filters: EmployeeFilters) {
  const {searchQuery, departmentId, status} = filters;

  // Status filter
  if (status !== 'all') {
    const isActive = status === 'active';
    if (employee.isActive !== isActive) {
      return false;
    }
  }

  // Department filter
  if (departmentId && employee.departmentId !== departmentId) {
    return false;
  }

  // Search query filter
  if (searchQuery.trim()) {
    const lowerQuery = searchQuery.toLowerCase();
    const fullName = `${employee.firstName} ${employee.lastName}`.toLowerCase();
    const matchesSearch =
      employee.firstName.toLowerCase().includes(lowerQuery) ||
      employee.lastName.toLowerCase().includes(lowerQuery) ||
      fullName.includes(lowerQuery);
    if (!matchesSearch) {
      return false;
    }
  }

  return true;
}
