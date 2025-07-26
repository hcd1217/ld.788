import {Stack, Group, Text, Badge} from '@mantine/core';
import {EmployeeActions} from './EmployeeActions';
import {useTranslation} from '@/hooks/useTranslation';
import type {Employee} from '@/lib/api/schemas/hr.schemas';
import {SelectableCard} from '@/components/common';
import {renderFullName} from '@/utils/string';
import {useHrActions} from '@/stores/useHrStore';

type EmployeeGridCardProps = {
  readonly employee: Employee;
  readonly onDelete?: () => void;
};

export function EmployeeGridCard({employee, onDelete}: EmployeeGridCardProps) {
  const {t} = useTranslation();
  const {getDepartmentById} = useHrActions();

  return (
    <SelectableCard
      withBorder
      shadow="sm"
      padding="lg"
      radius="md"
      aria-label={t('employee.employeeCard', {
        name: `${employee.firstName} ${employee.lastName}`,
      })}
    >
      <Stack gap="sm">
        <Group justify="space-between" align="flex-start">
          <div>
            <Text fw={500} size="lg">
              {renderFullName(employee)}
            </Text>
            {employee.departmentId ? (
              <Text size="sm" c="dimmed">
                {t('employee.unit')}:{' '}
                {getDepartmentById(employee.departmentId)?.name ||
                  employee.departmentId}
              </Text>
            ) : null}
          </div>
          <Badge color={employee.isActive ? 'green' : 'gray'} variant="light">
            {employee.isActive ? t('employee.active') : t('employee.inactive')}
          </Badge>
        </Group>
        <Group justify="flex-end">
          <EmployeeActions employeeId={employee.id} onDelete={onDelete} />
        </Group>
      </Stack>
    </SelectableCard>
  );
}
