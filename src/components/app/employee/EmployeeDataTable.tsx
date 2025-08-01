import {Table, Text, ScrollArea, Badge, Group} from '@mantine/core';
import {useNavigate} from 'react-router';
import {EmployeeActions} from './EmployeeActions';
import {useTranslation} from '@/hooks/useTranslation';
import type {Employee} from '@/services/hr/employee';
import {getEmployeeDetailRoute} from '@/config/routeConfig';

type EmployeeDataTableProps = {
  readonly employees: readonly Employee[];
  readonly noAction?: boolean;
  readonly onDeactivateEmployee?: (employee: Employee) => void;
  readonly onActivateEmployee?: (employee: Employee) => void;
};

export function EmployeeDataTable({
  employees,
  noAction = false,
  onDeactivateEmployee,
  onActivateEmployee,
}: EmployeeDataTableProps) {
  const {t} = useTranslation();
  const navigate = useNavigate();

  return (
    <ScrollArea>
      <Table striped highlightOnHover aria-label={t('employee.tableAriaLabel')}>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>{t('employee.name')}</Table.Th>
            <Table.Th>{t('employee.unit')}</Table.Th>
            <Table.Th>{t('employee.status')}</Table.Th>
            {noAction ? null : (
              <Table.Th style={{width: 100}}>{t('common.actions')}</Table.Th>
            )}
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {employees.map((employee) => (
            <Table.Tr
              key={employee.id}
              style={{cursor: 'pointer'}}
              onClick={() => navigate(getEmployeeDetailRoute(employee.id))}
            >
              <Table.Td>
                <Group gap="sm" justify="start">
                  {/* @todo: custom this */}
                  <Text fw={400}>{employee.fullName}</Text>
                  {employee?.position ? (
                    <Text c="dimmed"> ({employee?.position})</Text>
                  ) : null}
                </Group>
              </Table.Td>
              <Table.Td>{employee.unit ?? '-'}</Table.Td>
              <Table.Td>
                <Badge
                  color={employee.isActive ? 'green' : 'gray'}
                  variant="light"
                >
                  {employee.isActive
                    ? t('employee.active')
                    : t('employee.inactive')}
                </Badge>
              </Table.Td>
              {noAction ? null : (
                <Table.Td onClick={(e) => e.stopPropagation()}>
                  <EmployeeActions
                    employeeId={employee.id}
                    isActive={employee.isActive}
                    onDeactivate={
                      onDeactivateEmployee
                        ? () => {
                            onDeactivateEmployee(employee);
                          }
                        : undefined
                    }
                    onActivate={
                      onActivateEmployee
                        ? () => {
                            onActivateEmployee(employee);
                          }
                        : undefined
                    }
                  />
                </Table.Td>
              )}
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </ScrollArea>
  );
}
