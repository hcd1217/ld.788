import {useEffect, useState} from 'react';
import {useNavigate} from 'react-router';
import {Stack, Group, Box, SimpleGrid} from '@mantine/core';
import {IconUser} from '@tabler/icons-react';
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
  EmployeeDeactivateModal,
  EmployeeActivateModal,
} from '@/components/app/employee';
import useIsDesktop from '@/hooks/useIsDesktop';

export function EmployeeListPage() {
  const navigate = useNavigate();
  const employees = useEmployeeList();
  const isLoading = useHrLoading();
  const error = useHrError();
  const {refreshEmployees, deactivateEmployee, activateEmployee, clearError} =
    useHrActions();
  const [searchQuery, setSearchQuery] = useState('');
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
              <EmployeeDataTable
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
function employeeFilterFn(employee: Employee, query: string) {
  const lowerQuery = query.toLowerCase();
  const fullName = `${employee.firstName} ${employee.lastName}`.toLowerCase();
  return (
    employee.firstName.toLowerCase().includes(lowerQuery) ||
    employee.lastName.toLowerCase().includes(lowerQuery) ||
    fullName.includes(lowerQuery)
  );
}
