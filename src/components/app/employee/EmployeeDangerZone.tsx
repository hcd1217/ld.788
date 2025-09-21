import { useMemo } from 'react';

import { Box, Button, Card, Divider, Group, Paper, Stack, Text, Title } from '@mantine/core';
import {
  IconAlertTriangle,
  IconLock,
  IconTrash,
  IconUserCheck,
  IconUserOff,
} from '@tabler/icons-react';

import { useDeviceType } from '@/hooks/useDeviceType';
import { useTranslation } from '@/hooks/useTranslation';
import type { Employee } from '@/services/hr/employee';
import { usePermissions } from '@/stores/useAppStore';
import { canEditEmployee, canSetPasswordForEmployee } from '@/utils/permission.utils';

type EmployeeDangerZoneProps = {
  readonly employee: Employee;
  readonly onActivate: () => void;
  readonly onDeactivate: () => void;
  readonly onSetPassword: () => void;
};

export function EmployeeDangerZone({
  employee,
  onActivate,
  onDeactivate,
  onSetPassword,
}: EmployeeDangerZoneProps) {
  const { t } = useTranslation();
  const { isDesktop } = useDeviceType();
  const permissions = usePermissions();
  const { canEdit, canSetPassword } = useMemo(() => {
    return {
      canEdit: canEditEmployee(permissions),
      canSetPassword: canSetPasswordForEmployee(permissions),
    };
  }, [permissions]);

  return (
    <Card
      withBorder
      shadow="sm"
      padding="xl"
      radius="md"
      style={{ borderColor: 'var(--mantine-color-red-6)' }}
    >
      <Stack gap="lg">
        <Group>
          <IconAlertTriangle size={24} color="var(--mantine-color-red-6)" />
          <Title order={3} c="red.6">
            {t('common.dangerZone')}
          </Title>
        </Group>

        <Divider color="red.6" />

        <Stack gap="md">
          {employee.loginIdentifier ? (
            <Paper withBorder p="md">
              {isDesktop ? (
                <Group justify="space-between" wrap="nowrap">
                  <Box>
                    <Text fw={500}>{t('employee.setPasswordTitle')}</Text>
                    <Text size="sm" c="dimmed">
                      {t('employee.setPasswordDescription')}
                    </Text>
                  </Box>
                  <Button
                    color="blue"
                    leftSection={<IconLock size={16} />}
                    disabled={!canSetPassword}
                    onClick={onSetPassword}
                  >
                    {t('employee.setPassword')}
                  </Button>
                </Group>
              ) : (
                <Stack gap="sm">
                  <Box>
                    <Text fw={500}>{t('employee.setPasswordTitle')}</Text>
                    <Text size="sm" c="dimmed">
                      {t('employee.setPasswordDescription')}
                    </Text>
                  </Box>
                  <Button
                    fullWidth
                    color="blue"
                    leftSection={<IconLock size={16} />}
                    disabled={!canSetPassword}
                    onClick={onSetPassword}
                  >
                    {t('employee.setPassword')}
                  </Button>
                </Stack>
              )}
            </Paper>
          ) : null}

          {employee.isActive ? (
            <Paper withBorder p="md">
              {isDesktop ? (
                <Group justify="space-between" wrap="nowrap">
                  <Box>
                    <Text fw={500}>{t('employee.deactivateEmployee')}</Text>
                    <Text size="sm" c="dimmed">
                      {t('employee.deactivateEmployeeDescription')}
                    </Text>
                  </Box>
                  <Button
                    color="red"
                    disabled={!canEdit}
                    leftSection={<IconUserOff size={16} />}
                    onClick={onDeactivate}
                  >
                    {t('common.deactivate')}
                  </Button>
                </Group>
              ) : (
                <Stack gap="sm">
                  <Box>
                    <Text fw={500}>{t('employee.deactivateEmployee')}</Text>
                    <Text size="sm" c="dimmed">
                      {t('employee.deactivateEmployeeDescription')}
                    </Text>
                  </Box>
                  <Button
                    fullWidth
                    color="red"
                    disabled={!canEdit}
                    leftSection={<IconUserOff size={16} />}
                    onClick={onDeactivate}
                  >
                    {t('common.deactivate')}
                  </Button>
                </Stack>
              )}
            </Paper>
          ) : (
            <Paper withBorder p="md">
              {isDesktop ? (
                <Group justify="space-between" wrap="nowrap">
                  <Box>
                    <Text fw={500}>{t('employee.activateEmployee')}</Text>
                    <Text size="sm" c="dimmed">
                      {t('employee.activateEmployeeDescription')}
                    </Text>
                  </Box>
                  <Button
                    color="green"
                    leftSection={<IconUserCheck size={16} />}
                    disabled={!canEdit}
                    onClick={onActivate}
                  >
                    {t('common.activate')}
                  </Button>
                </Group>
              ) : (
                <Stack gap="sm">
                  <Box>
                    <Text fw={500}>{t('employee.activateEmployee')}</Text>
                    <Text size="sm" c="dimmed">
                      {t('employee.activateEmployeeDescription')}
                    </Text>
                  </Box>
                  <Button
                    fullWidth
                    color="green"
                    leftSection={<IconUserCheck size={16} />}
                    disabled={!canEdit}
                    onClick={onActivate}
                  >
                    {t('common.activate')}
                  </Button>
                </Stack>
              )}
            </Paper>
          )}

          <Paper withBorder p="md">
            {isDesktop ? (
              <Group justify="space-between" wrap="nowrap">
                <Box>
                  <Text fw={500}>{t('employee.deleteEmployee')}</Text>
                  <Text size="sm" c="dimmed">
                    {t('employee.deleteEmployeeDescription')}
                  </Text>
                </Box>
                <Button
                  disabled
                  color="red"
                  variant="outline"
                  leftSection={<IconTrash size={16} />}
                >
                  {t('common.delete')}
                </Button>
              </Group>
            ) : (
              <Stack gap="sm">
                <Box>
                  <Text fw={500}>{t('employee.deleteEmployee')}</Text>
                  <Text size="sm" c="dimmed">
                    {t('employee.deleteEmployeeDescription')}
                  </Text>
                </Box>
                <Button
                  fullWidth
                  disabled
                  color="red"
                  variant="outline"
                  leftSection={<IconTrash size={16} />}
                >
                  {t('common.delete')}
                </Button>
              </Stack>
            )}
          </Paper>
        </Stack>
      </Stack>
    </Card>
  );
}
