import { useNavigate } from 'react-router';

import { Box, Card, Group, type MantineStyleProp, Text } from '@mantine/core';

import { ActiveBadge } from '@/components/common';
import { getEmployeeDetailRoute } from '@/config/routeConfig';
import { useTranslation } from '@/hooks/useTranslation';
import type { Employee } from '@/services/hr/employee';
import { getEndDateHighlightStyles } from '@/utils/time';

type EmployeeCardProps = {
  readonly employee: Employee;
  /** Custom styles for the card container */
  readonly style?: MantineStyleProp;
  /** Custom className for the card container */
  readonly className?: string;
};

export function EmployeeCard({ employee, style, className }: EmployeeCardProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const highlightStyles = getEndDateHighlightStyles(employee.endDate, employee.isActive);

  return (
    <Card
      withBorder
      shadow="sm"
      padding="md"
      radius="md"
      style={{
        cursor: 'pointer',
        ...highlightStyles,
        ...style,
      }}
      className={className}
      onClick={() => navigate(getEmployeeDetailRoute(employee.id))}
    >
      <Group justify="space-between" align="flex-start" style={{ position: 'relative' }}>
        <Box>
          <Group gap="xs" wrap="nowrap">
            <Text fw={500} size="sm">
              {employee.fullName}
            </Text>
            {employee?.position ? (
              <Text c="dimmed" size="sm">
                ({employee?.position})
              </Text>
            ) : null}
          </Group>
          {employee.departmentId ? (
            <Text size="xs" c="dimmed">
              {t('employee.department')}: {employee.department ?? '-'}
            </Text>
          ) : null}
          {employee.email ? (
            <Text size="xs" c="dimmed">
              {t('common.form.email')}: {employee.email}
            </Text>
          ) : null}
          {employee.phone ? (
            <Text size="xs" c="dimmed">
              {t('employee.phone')}: {employee.phone}
            </Text>
          ) : null}
        </Box>
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
    </Card>
  );
}
