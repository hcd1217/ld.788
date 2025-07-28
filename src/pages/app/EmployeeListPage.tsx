import {useEffect, useState} from 'react';
import {useNavigate} from 'react-router';
import {Stack, Group, Box, SimpleGrid} from '@mantine/core';
import {IconUser} from '@tabler/icons-react';
import useTranslation from '@/hooks/useTranslation';
import {useClientSidePagination} from '@/hooks/useClientSidePagination';
import type {Employee} from '@/lib/api/schemas/hr.schemas';
import {
  useEmployeeList,
  useHrLoading,
  useHrError,
  useHrActions,
} from '@/stores/useHrStore';
import {
  Pagination,
  AppPageTitle,
  SearchBar,
  SwitchView,
  BlankState,
  AppMobileLayout,
  AppDesktopLayout,
} from '@/components/common';
import {
  EmployeeCard,
  EmployeeDataTable,
  EmployeeGridCard,
} from '@/components/app/employee';
import useIsDesktop from '@/hooks/useIsDesktop';

export function EmployeeListPage() {
  const navigate = useNavigate();
  const employees = useEmployeeList();
  const isLoading = useHrLoading();
  const error = useHrError();
  const {refreshEmployees, clearError} = useHrActions();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const isDesktop = useIsDesktop();
  const {t} = useTranslation();

  // Use client-side pagination hook
  const defaultPageSize = isDesktop ? undefined : 1000;
  const [paginatedEmployees, paginationState, paginationHandlers] =
    useClientSidePagination({
      data: employees,
      filterFn: employeeFilterFn,
      searchQuery,
      defaultPageSize,
    });

  useEffect(() => {
    console.log('refreshEmployees');
    void refreshEmployees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!isDesktop) {
    return (
      <AppMobileLayout
        withLogo
        isLoading={isLoading}
        error={error}
        clearError={clearError}
        header={<AppPageTitle title={t('employee.title')} />}
      >
        <Group justify="space-between">
          <SearchBar
            hidden={employees.length < 5}
            placeholder={t('employee.searchPlaceholder')}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        </Group>
        <BlankState
          hidden={paginationState.totalItems > 0 || isLoading}
          icon={<IconUser size={48} color="var(--mantine-color-gray-5)" />}
          title={
            searchQuery
              ? t('employee.noEmployeesFoundSearch')
              : t('employee.noEmployeesFound')
          }
          description={
            searchQuery
              ? t('employee.tryDifferentSearch')
              : t('employee.createFirstEmployeeDescription')
          }
        />
        <Box mt="md">
          <Stack gap="sm" px="sm">
            {paginatedEmployees.map((employee) => (
              <EmployeeCard key={employee.id} employee={employee} />
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
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
        <SwitchView viewMode={viewMode} setViewMode={setViewMode} />
      </Group>

      <div>
        <BlankState
          hidden={paginationState.totalItems > 0 || isLoading}
          icon={<IconUser size={48} color="var(--mantine-color-gray-5)" />}
          title={
            searchQuery
              ? t('employee.noEmployeesFoundSearch')
              : t('employee.noEmployeesFound')
          }
          description={
            searchQuery
              ? t('employee.tryDifferentSearch')
              : t('employee.createFirstEmployeeDescription')
          }
          button={
            searchQuery
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
              <EmployeeDataTable employees={paginatedEmployees} />
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
function employeeFilterFn(employee: Employee, query: string) {
  const lowerQuery = query.toLowerCase();
  const fullName = `${employee.firstName} ${employee.lastName}`.toLowerCase();
  return (
    employee.firstName.toLowerCase().includes(lowerQuery) ||
    employee.lastName.toLowerCase().includes(lowerQuery) ||
    fullName.includes(lowerQuery)
  );
}
