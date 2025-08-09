import { Stack, Group, Text } from '@mantine/core';
import { useNavigate } from 'react-router';
import { useTranslation } from '@/hooks/useTranslation';
import type { Employee } from '@/services/hr/employee';
import { SelectableCard } from '@/components/common';
import { getEmployeeDetailRoute } from '@/config/routeConfig';
import { ActiveBadge } from '@/components/common/ui';
import { getEndDateHighlightStyles } from '@/utils/time';

type EmployeeGridCardProps = {
  readonly employee: Employee;
};

export function EmployeeGridCard({ employee }: EmployeeGridCardProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const highlightStyles = getEndDateHighlightStyles(employee.endDate, employee.isActive);

  return (
    <SelectableCard
      withBorder
      shadow="sm"
      padding="lg"
      radius="md"
      style={{
        cursor: 'pointer',
        ...highlightStyles,
      }}
      aria-label={t('employee.employeeCard', {
        name: `${employee.firstName} ${employee.lastName}`,
      })}
      onClick={() => navigate(getEmployeeDetailRoute(employee.id))}
    >
      <Stack
        gap="sm"
        style={{
          position: 'relative',
        }}
      >
        <Group justify="space-between" align="flex-start">
          <div>
            <Group gap="sm" justify="start">
              <Text fw={400}>{employee.fullName}</Text>
              {employee?.position ? (
                <Text c="dimmed" size="sm">
                  {' '}
                  ({employee?.position})
                </Text>
              ) : null}
            </Group>
            {employee.unitId ? (
              <Text size="sm" c="dimmed">
                {t('employee.unit')}: {employee.unit ?? '-'}
              </Text>
            ) : null}
            {employee.email ? (
              <Text size="sm" c="dimmed">
                {t('employee.email')}: {employee.email}
              </Text>
            ) : null}
            {employee.phone ? (
              <Text size="sm" c="dimmed">
                {t('employee.phone')}: {employee.phone}
              </Text>
            ) : null}
          </div>
          <div
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
            }}
          >
            <ActiveBadge isActive={employee.isActive} />
          </div>
        </Group>
      </Stack>
    </SelectableCard>
  );
}
