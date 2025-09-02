import { Card, Stack, Group, Title, Divider, Paper, Box, Text, Button } from '@mantine/core';
import { IconAlertTriangle, IconUserOff, IconUserCheck, IconTrash } from '@tabler/icons-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useDeviceType } from '@/hooks/useDeviceType';
import type { Employee } from '@/services/hr/employee';

type EmployeeDangerZoneProps = {
  readonly employee: Employee;
  readonly canEdit: boolean;
  readonly onActivate: () => void;
  readonly onDeactivate: () => void;
};

export function EmployeeDangerZone({
  canEdit,
  employee,
  onActivate,
  onDeactivate,
}: EmployeeDangerZoneProps) {
  const { t } = useTranslation();
  const { isDesktop } = useDeviceType();

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
                    leftSection={<IconUserOff size={16} />}
                    onClick={onDeactivate}
                  >
                    {t('employee.deactivate')}
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
                    leftSection={<IconUserOff size={16} />}
                    onClick={onDeactivate}
                  >
                    {t('employee.deactivate')}
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
                    {t('employee.activate')}
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
                    {t('employee.activate')}
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
