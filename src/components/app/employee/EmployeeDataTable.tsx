import React from 'react';
import { Text, Group } from '@mantine/core';
import { useNavigate } from 'react-router';
import { useTranslation } from '@/hooks/useTranslation';
import type { Employee } from '@/services/hr/employee';
import { getEmployeeDetailRoute } from '@/config/routeConfig';
import { formatDate } from '@/utils/string';
import { ActiveBadge, ContactInfo, DataTable } from '@/components/common/ui';
import { WorkTypeBadge } from './WorkTypeBadge';
import { getEndDateHighlightStyles } from '@/utils/time';
import { useMemo } from 'react';
import { useClientConfig } from '@/stores/useAppStore';

// Event handler to prevent propagation on action cells
const handleActionCellClick = (e: React.MouseEvent) => {
  e.stopPropagation();
};

type EmployeeDataTableProps = {
  readonly employees: readonly Employee[];
  readonly onDeactivateEmployee?: (employee: Employee) => void;
  readonly onActivateEmployee?: (employee: Employee) => void;
};

export function EmployeeDataTable({ employees }: EmployeeDataTableProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const clientConfig = useClientConfig();
  const columns = useMemo(
    () =>
      [
        {
          key: 'name',
          header: t('employee.name'),
          render: (employee: Employee) => (
            <Group gap="sm" justify="start">
              {/* @todo: custom this */}
              <Text fw={400}>{employee.fullName}</Text>
              {employee?.position ? <Text c="dimmed"> ({employee?.position})</Text> : null}
            </Group>
          ),
        },
        {
          key: 'unit',
          header: t('employee.unit'),
          accessor: 'unit' as keyof Employee,
        },
        {
          key: 'contact',
          header: t('common.contact'),
          render: (employee: Employee) => <ContactInfo {...employee} />,
        },
        {
          key: 'workType',
          header: t('employee.workType'),
          hidden: !clientConfig.features.employee.workType,
          render: (employee: Employee) => <WorkTypeBadge workType={employee.workType} />,
        },
        {
          key: 'startDate',
          header: t('employee.startDate'),
          hidden: !clientConfig.features.employee.workType,
          render: (employee: Employee) => (
            <>
              {employee.startDate ? formatDate(employee.startDate) : '-'}
              {employee.endDate ? formatDate(employee.endDate) : '-'}
            </>
          ),
        },
        {
          key: 'status',
          header: t('employee.status'),
          render: (employee: Employee) => <ActiveBadge isActive={employee.isActive} />,
        },
      ].filter((el) => !el.hidden),
    [t, clientConfig],
  );

  const handleRowClick = (employee: Employee) => {
    navigate(getEmployeeDetailRoute(employee.id));
  };

  const getRowStyles = (employee: Employee) => {
    return getEndDateHighlightStyles(employee.endDate, employee.isActive);
  };

  return (
    <DataTable
      data={employees as Employee[]}
      columns={columns}
      onRowClick={handleRowClick}
      getRowStyles={getRowStyles}
      onActionCellClick={handleActionCellClick}
      ariaLabel={t('employee.tableAriaLabel')}
    />
  );
}
