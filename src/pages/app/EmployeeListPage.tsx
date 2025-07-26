import {useEffect, useState} from 'react';
import {useNavigate} from 'react-router';
import {
  Container,
  Stack,
  Group,
  LoadingOverlay,
  Box,
  SimpleGrid,
} from '@mantine/core';
import {IconUser} from '@tabler/icons-react';
import {useTranslation} from '@/hooks/useTranslation';
import {useClientSidePagination} from '@/hooks/useClientSidePagination';
import type {Employee} from '@/lib/api/schemas/hr.schemas';
import {
  useEmployeeList,
  useHrLoading,
  useHrError,
  useHrActions,
} from '@/stores/useHrStore';
import {
  ErrorAlert,
  Pagination,
  AppPageTitle,
  SearchBar,
  SwitchView,
  BlankState,
} from '@/components/common';
import {
  EmployeeCard,
  EmployeeDataTable,
  EmployeeGridCard,
} from '@/components/app/employee';
import {useIsDesktop} from '@/hooks/useIsDesktop';

export function EmployeeListPage() {
  const navigate = useNavigate();
  const employees = useEmployeeList();
  const isLoading = useHrLoading();
  const error = useHrError();
  const {loadEmployees, clearError} = useHrActions();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const isDesktop = useIsDesktop();
  const {t} = useTranslation();

  // Use client-side pagination hook
  const [paginatedEmployees, paginationState, paginationHandlers] =
    useClientSidePagination({
      data: employees,
      filterFn: employeeFilterFn,
      searchQuery,
    });

  useEffect(() => {
    void loadEmployees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Container fluid px={isDesktop ? 'sm' : 0} mt={isDesktop ? 'sm' : 0}>
      <Stack gap="xl">
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

        <ErrorAlert error={error} clearError={clearError} />

        <div>
          <LoadingOverlay
            visible={isLoading}
            overlayProps={{blur: 2}}
            transitionProps={{duration: 300}}
          />
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
              {/* Mobile Card View */}
              <Box hiddenFrom="md">
                <Stack gap="sm">
                  {paginatedEmployees.map((employee) => (
                    <EmployeeCard key={employee.id} employee={employee} />
                  ))}
                </Stack>
              </Box>

              {/* Desktop View - Table or Grid based on selection */}
              <Box visibleFrom="md">
                {viewMode === 'table' ? (
                  <EmployeeDataTable employees={paginatedEmployees} />
                ) : (
                  <SimpleGrid cols={{base: 1, md: 2, lg: 3}} spacing="lg">
                    {paginatedEmployees.map((employee) => (
                      <EmployeeGridCard key={employee.id} employee={employee} />
                    ))}
                  </SimpleGrid>
                )}
              </Box>
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
      </Stack>
    </Container>
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
