import {Card, Group, Box, Text, type MantineStyleProp} from '@mantine/core';
import {useNavigate} from 'react-router';
import {EmployeeActions} from './EmployeeActions';
import useTranslation from '@/hooks/useTranslation';
import type {Employee} from '@/lib/api/schemas/hr.schemas';
import {ActiveBadge} from '@/components/common';
import {useHrActions} from '@/stores/useHrStore';
import {renderFullName} from '@/utils/string';
import {getEmployeeDetailRoute} from '@/config/routeConfig';

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
  const {t} = useTranslation();
  const {getDepartmentById} = useHrActions();
  const navigate = useNavigate();

  const defaultActionIconsStyle: MantineStyleProp = {
    position: 'absolute',
    top: 'var(--mantine-spacing-xs)',
    right: 'var(--mantine-spacing-xs)',
    ...actionIconsStyle,
  };

  const fullName = renderFullName(employee);

  return (
    <Card
      withBorder
      shadow="sm"
      padding="md"
      radius="md"
      style={{cursor: 'pointer', ...style}}
      className={className}
      aria-label={t('employee.employeeCard', {
        name: fullName,
      })}
      onClick={() => navigate(getEmployeeDetailRoute(employee.id))}
    >
      <Group
        justify="space-between"
        align="flex-start"
        style={{position: 'relative'}}
      >
        <Box>
          <Text fw={500} size="sm">
            {fullName}
          </Text>
          {employee.departmentId ? (
            <Text size="xs" c="dimmed">
              {t('employee.unit')}:{' '}
              {getDepartmentById(employee.departmentId)?.name ||
                employee.departmentId}
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
