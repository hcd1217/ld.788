import {
  Card,
  Stack,
  Group,
  Box,
  Text,
  type MantineStyleProp,
} from '@mantine/core';
import {EmployeeActions} from './EmployeeActions';
import {useTranslation} from '@/hooks/useTranslation';
import type {Employee} from '@/lib/api/schemas/hr.schemas';
import {ActiveBadge} from '@/components/common';
import {useHrActions} from '@/stores/useHrStore';

type EmployeeCardProps = {
  readonly employee: Employee;
  readonly onDelete?: () => void;
  /** Custom styles for the card container */
  readonly style?: MantineStyleProp;
  /** Custom className for the card container */
  readonly className?: string;
  /** Custom styles for the action icons group */
  readonly actionIconsStyle?: MantineStyleProp;
};

export function EmployeeCard({
  employee,
  onDelete,
  style,
  className,
  actionIconsStyle,
}: EmployeeCardProps) {
  const {t} = useTranslation();
  const {getDepartmentById} = useHrActions();

  const defaultActionIconsStyle: MantineStyleProp = {
    position: 'absolute',
    top: 'var(--mantine-spacing-xs)',
    right: 'var(--mantine-spacing-xs)',
    ...actionIconsStyle,
  };

  return (
    <Card
      withBorder
      shadow="sm"
      padding="md"
      radius="md"
      style={style}
      className={className}
      aria-label={t('employee.employeeCard', {
        name: `${employee.firstName} ${employee.lastName}`,
      })}
    >
      <Stack gap="xs">
        <Group
          justify="space-between"
          align="flex-start"
          style={{position: 'relative'}}
        >
          <Box>
            <Text fw={500} size="sm">
              {employee.firstName} {employee.lastName}
            </Text>
            {employee.departmentId ? (
              <Text size="xs" c="dimmed">
                {t('employee.unit')}:{' '}
                {getDepartmentById(employee.departmentId)?.name ||
                  employee.departmentId}
              </Text>
            ) : null}
          </Box>
          <EmployeeActions
            style={defaultActionIconsStyle}
            employeeId={employee.id}
            onDelete={onDelete}
          />
        </Group>
        <ActiveBadge isActive={employee.isActive} />
      </Stack>
    </Card>
  );
}
