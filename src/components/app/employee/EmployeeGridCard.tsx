import {Stack, Group, Text, Badge} from '@mantine/core';
import {useNavigate} from 'react-router';
import {useTranslation} from 'react-i18next';
import type {Employee} from '@/services/hr/employee';
import {SelectableCard} from '@/components/common';
import {getEmployeeDetailRoute} from '@/config/routeConfig';

type EmployeeGridCardProps = {
  readonly employee: Employee;
};

export function EmployeeGridCard({employee}: EmployeeGridCardProps) {
  const {t} = useTranslation();
  const navigate = useNavigate();

  return (
    <SelectableCard
      withBorder
      shadow="sm"
      padding="lg"
      radius="md"
      style={{cursor: 'pointer'}}
      aria-label={t('employee.employeeCard', {
        name: `${employee.firstName} ${employee.lastName}`,
      })}
      onClick={() => navigate(getEmployeeDetailRoute(employee.id))}
    >
      <Stack gap="sm">
        <Group justify="space-between" align="flex-start">
          <div>
            <Group gap="sm" justify="start">
              {/* @todo: custom this */}
              <Text fw={400}>{employee.fullName}</Text>
              {employee?.position ? (
                <Text c="dimmed"> ({employee?.position})</Text>
              ) : null}
            </Group>
            {employee.unitId ? (
              <Text size="sm" c="dimmed">
                {t('employee.unit')}: {employee.unit ?? '-'}
              </Text>
            ) : null}
          </div>
          <Badge color={employee.isActive ? 'green' : 'gray'} variant="light">
            {employee.isActive ? t('employee.active') : t('employee.inactive')}
          </Badge>
        </Group>
      </Stack>
    </SelectableCard>
  );
}
