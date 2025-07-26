import {Table, ScrollArea, Badge} from '@mantine/core';
import {EmployeeActions} from './EmployeeActions';
import {useTranslation} from '@/hooks/useTranslation';
import type {Employee} from '@/lib/api/schemas/hr.schemas';
import {renderFullName} from '@/utils/string';
import {useHrActions} from '@/stores/useHrStore';

type EmployeeDataTableProps = {
  readonly employees: readonly Employee[];
  readonly onDeleteEmployee?: (id: string) => void;
};

export function EmployeeDataTable({
  employees,
  onDeleteEmployee,
}: EmployeeDataTableProps) {
  const {t} = useTranslation();
  const {getDepartmentById} = useHrActions();

  return (
    <ScrollArea>
      <Table striped highlightOnHover aria-label={t('employee.tableAriaLabel')}>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>{t('employee.name')}</Table.Th>
            <Table.Th>{t('employee.unit')}</Table.Th>
            <Table.Th>{t('employee.status')}</Table.Th>
            <Table.Th style={{width: 100}}>{t('common.actions')}</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {employees.map((employee) => (
            <Table.Tr key={employee.id}>
              <Table.Td>{renderFullName(employee)}</Table.Td>
              <Table.Td>
                {employee.departmentId
                  ? getDepartmentById(employee.departmentId)?.name ||
                    employee.departmentId
                  : '-'}
              </Table.Td>
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
              <Table.Td>
                <EmployeeActions
                  employeeId={employee.id}
                  onDelete={
                    onDeleteEmployee
                      ? () => {
                          onDeleteEmployee(employee.id);
                        }
                      : undefined
                  }
                />
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </ScrollArea>
  );
}
