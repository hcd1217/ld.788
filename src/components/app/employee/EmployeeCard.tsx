import {Card, Group, Box, Text, type MantineStyleProp} from '@mantine/core';
import {useNavigate} from 'react-router';
import useTranslation from '@/hooks/useTranslation';
import type {Employee} from '@/lib/api/schemas/hr.schemas';
import {ActiveBadge} from '@/components/common';
import {useHrActions} from '@/stores/useHrStore';
import {renderFullName} from '@/utils/string';

type EmployeeCardProps = {
  readonly employee: Employee;
  /** Custom styles for the card container */
  readonly style?: MantineStyleProp;
  /** Custom className for the card container */
  readonly className?: string;
};

export function EmployeeCard({employee, style, className}: EmployeeCardProps) {
  const {t} = useTranslation();
  const {getDepartmentById} = useHrActions();
  const navigate = useNavigate();

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
      onClick={() => navigate(`/employees/${employee.id}`)}
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
        <ActiveBadge isActive={employee.isActive} />
      </Group>
    </Card>
  );
}
