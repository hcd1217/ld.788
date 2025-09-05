import { Card, Group, Box, Text, type MantineStyleProp } from '@mantine/core';
import { useNavigate } from 'react-router';
import { EmployeeActions } from './EmployeeActions';
import { useTranslation } from '@/hooks/useTranslation';
import type { Employee } from '@/services/hr/employee';
import { ActiveBadge } from '@/components/common';
import { renderFullName } from '@/utils/string';
import { getEmployeeDetailRoute } from '@/config/routeConfig';
import { getEndDateHighlightStyles } from '@/utils/time';

type EmployeeCardProps = {
  readonly employee: Employee;
  readonly onDeactivate?: () => void;
  readonly onActivate?: () => void;
  /** Custom styles for the card container */
  readonly style?: MantineStyleProp;
  /** Custom className for the card container */
  readonly className?: string;
  /** Custom styles for the action icons group */
  readonly actionIconsStyle?: MantineStyleProp;
  /** Whether to hide the actions */
  readonly noActions?: boolean;
};

export function EmployeeCard({
  employee,
  onDeactivate,
  onActivate,
  style,
  className,
  actionIconsStyle,
  noActions,
}: EmployeeCardProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const defaultActionIconsStyle: MantineStyleProp = {
    position: 'absolute',
    top: 'var(--mantine-spacing-xs)',
    right: 'var(--mantine-spacing-xs)',
    ...actionIconsStyle,
  };

  const fullName = renderFullName(employee);
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
      aria-label={t('employee.employeeCard', {
        name: fullName,
      })}
      onClick={() => navigate(getEmployeeDetailRoute(employee.id))}
    >
      <Group justify="space-between" align="flex-start" style={{ position: 'relative' }}>
        <Box>
          <Text fw={500} size="sm">
            {fullName}
          </Text>
          {employee.unitId ? (
            <Text size="xs" c="dimmed">
              {t('employee.unit')}: {employee.unit ?? '-'}
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
        {noActions ? null : (
          <EmployeeActions
            style={defaultActionIconsStyle}
            employeeId={employee.id}
            isActive={employee.isActive}
            onDeactivate={onDeactivate}
            onActivate={onActivate}
          />
        )}
        <ActiveBadge isActive={employee.isActive} />
      </Group>
    </Card>
  );
}
