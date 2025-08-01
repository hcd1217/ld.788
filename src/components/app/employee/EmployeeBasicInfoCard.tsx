import {
  Card,
  Stack,
  Group,
  Title,
  Button,
  Divider,
  Grid,
  Text,
  Badge,
} from '@mantine/core';
import {IconEdit} from '@tabler/icons-react';
import {useTranslation} from '@/hooks/useTranslation';
import type {Employee} from '@/services/hr/employee';
import {renderFullName, formatDate} from '@/utils/string';

type EmployeeBasicInfoCardProps = {
  readonly employee: Employee;
  readonly onEdit?: () => void;
};

export function EmployeeBasicInfoCard({
  employee,
  onEdit,
}: EmployeeBasicInfoCardProps) {
  const {t} = useTranslation();

  return (
    <Card shadow="sm" padding="xl" radius="md">
      <Stack gap="lg">
        <Group justify="space-between" align="flex-start">
          <Title order={3}>{t('employee.basicInformation')}</Title>
          <Button
            leftSection={<IconEdit size={16} />}
            variant="subtle"
            onClick={onEdit}
          >
            {t('common.edit')}
          </Button>
        </Group>

        <Divider />

        <Grid>
          <Grid.Col span={{base: 6}}>
            <Stack gap="xs">
              <Text c="dimmed" size="sm">
                {t('employee.name')}
              </Text>
              <Text fw={500}>{renderFullName(employee)}</Text>
            </Stack>
          </Grid.Col>

          <Grid.Col span={{base: 6}}>
            <Stack gap="xs">
              <Text c="dimmed" size="sm">
                {t('employee.employeeCode')}
              </Text>
              <Text fw={500}>{employee.employeeCode.toLocaleUpperCase()}</Text>
            </Stack>
          </Grid.Col>

          <Grid.Col span={{base: 6}}>
            <Stack gap="xs">
              <Text c="dimmed" size="sm">
                {t('employee.unit')}
              </Text>
              <Text fw={500}>{employee.unit ?? '-'}</Text>
            </Stack>
          </Grid.Col>

          <Grid.Col span={{base: 6}}>
            <Stack gap="xs">
              <Text c="dimmed" size="sm">
                {t('employee.status')}
              </Text>
              <Badge
                color={employee.isActive ? 'green' : 'gray'}
                variant="light"
                size="lg"
              >
                {employee.isActive
                  ? t('employee.active')
                  : t('employee.inactive')}
              </Badge>
            </Stack>
          </Grid.Col>

          <Grid.Col span={{base: 6}} visibleFrom="sm">
            <Stack gap="xs">
              <Text c="dimmed" size="sm">
                {t('common.createdAt')}
              </Text>
              <Text fw={500}>{formatDate(employee.createdAt.toString())}</Text>
            </Stack>
          </Grid.Col>

          <Grid.Col span={{base: 6}} visibleFrom="sm">
            <Stack gap="xs">
              <Text c="dimmed" size="sm">
                {t('common.updatedAt')}
              </Text>
              <Text fw={500}>{formatDate(employee.updatedAt.toString())}</Text>
            </Stack>
          </Grid.Col>
        </Grid>
      </Stack>
    </Card>
  );
}
