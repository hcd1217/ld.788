import {Table, ScrollArea, Badge} from '@mantine/core';
import {useNavigate} from 'react-router';
import useTranslation from '@/hooks/useTranslation';
import type {Employee} from '@/lib/api/schemas/hr.schemas';
import {renderFullName} from '@/utils/string';
import {useHrActions} from '@/stores/useHrStore';

type EmployeeDataTableProps = {
  readonly employees: readonly Employee[];
};

export function EmployeeDataTable({employees}: EmployeeDataTableProps) {
  const {t} = useTranslation();
  const {getDepartmentById} = useHrActions();
  const navigate = useNavigate();

  return (
    <ScrollArea>
      <Table striped highlightOnHover aria-label={t('employee.tableAriaLabel')}>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>{t('employee.name')}</Table.Th>
            <Table.Th>{t('employee.unit')}</Table.Th>
            <Table.Th>{t('employee.status')}</Table.Th>
            {/* <Table.Th style={{width: 100}}>{t('common.actions')}</Table.Th> */}
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {employees.map((employee) => (
            <Table.Tr
              key={employee.id}
              style={{cursor: 'pointer'}}
              onClick={() => navigate(`/employees/${employee.id}`)}
            >
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
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </ScrollArea>
  );
}
