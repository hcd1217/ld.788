import {useState} from 'react';
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
import {useTranslation} from '@/hooks/useTranslation';
import {useClientSidePagination} from '@/hooks/useClientSidePagination';
import {useOnce} from '@/hooks/useOnce';
import type {Employee} from '@/services/hr/employee';
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
} from '@/components/app/employee';
import useIsDesktop from '@/hooks/useIsDesktop';
import {ROUTERS} from '@/config/routeConfig';
import {useMobileDrawer} from '@/hooks/useMobileDrawer';

interface EmployeeFilters {
  searchQuery: string;
  unitId: string | undefined;
  status: 'all' | 'active' | 'inactive';
}

export function EmployeeListPage() {
  const navigate = useNavigate();
  const isDesktop = useIsDesktop();
  const {t} = useTranslation();
  const employees = useEmployeeList();
  const units = useUnitList();
  const isLoading = useHrLoading();
  const error = useHrError();
  const {refreshEmployees, clearError, loadUnits} = useHrActions();
  const [filters, setFilters] = useState<EmployeeFilters>({
    searchQuery: '',
    unitId: undefined,
    status: 'all',
  });
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const {
    filterDrawerOpened,
    drawerExpanded,
    openFilterDrawer,
    setDrawerExpanded,
    handleDrawerClose,
  } = useMobileDrawer();

  // Use client-side pagination hook
  const [paginatedEmployees, paginationState, paginationHandlers] =
    useClientSidePagination({
      data: employees,
      filterFn: employeeFilterFn,
      filters,
      defaultPageSize: isDesktop ? undefined : 1000,
    });

  useOnce(() => {
    void refreshEmployees();
    void loadUnits();
  });

  // Prepare department options for select
  const unitOptions = units.map((unit) => ({
    value: unit.id,
    label: unit.name,
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
            {paginationState.totalPages}
            <SearchBar
              hidden={paginationState.totalPages < 2}
              placeholder={t('employee.searchPlaceholder')}
              searchQuery={filters.searchQuery}
              setSearchQuery={(query) => {
                setFilters({...filters, searchQuery: query});
              }}
            />
            <Select
              clearable
              searchable
              placeholder={t('employee.selectUnit')}
              data={[{value: '', label: t('employee.allUnit')}, ...unitOptions]}
              value={filters.unitId || ''}
              onChange={(value) => {
                setFilters({...filters, unitId: value || undefined});
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
              {t('common.applyFilter')}
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
          setSearchQuery={(query) => {
            setFilters({...filters, searchQuery: query});
          }}
        />
        <Select
          clearable
          searchable
          placeholder={t('employee.selectUnit')}
          data={[{value: '', label: t('employee.allUnit')}, ...unitOptions]}
          value={filters.unitId || ''}
          style={{flex: 1, maxWidth: 300}}
          onChange={(value) => {
            setFilters({...filters, unitId: value || undefined});
          }}
        />
        {/* Filter Controls */}
        <Group justify="space-between" align="center" gap="xl">
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
                  onClick: () => navigate(ROUTERS.EMPLOYEES_ADD),
                }
          }
        />

        {paginationState.totalItems === 0 && !isLoading ? null : (
          <>
            {/* Desktop View - Table or Grid based on selection */}
            {viewMode === 'table' ? (
              <EmployeeDataTable noAction employees={paginatedEmployees} />
            ) : (
              <SimpleGrid cols={{base: 1, md: 2, lg: 3}} spacing="lg">
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

// Employee filter function
function employeeFilterFn(employee: Employee, filters: EmployeeFilters) {
  const {searchQuery, unitId, status} = filters;

  // Status filter
  if (status !== 'all') {
    const isActive = status === 'active';
    if (employee.isActive !== isActive) {
      return false;
    }
  }

  // Department filter
  if (unitId && employee.unitId !== unitId) {
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
