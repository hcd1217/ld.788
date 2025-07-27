import {
  Stack,
  Group,
  Text,
  Select,
  Alert,
  Paper,
  Badge,
  ThemeIcon,
  SimpleGrid,
} from '@mantine/core';
import {
  IconShield,
  IconShieldCheck,
  IconUser,
  IconUsers,
  IconUserCheck,
  IconCheck,
  IconInfoCircle,
} from '@tabler/icons-react';
import type {UseFormReturnType} from '@mantine/form';
import useTranslation from '@/hooks/useTranslation';
import {permissionMatrix} from '@/services/staff';
import type {StaffFormData} from '@/lib/api/schemas/staff.schemas';
import useIsDarkMode from '@/hooks/useIsDarkMode';

export interface AccessPermissionSectionProps {
  readonly form: UseFormReturnType<StaffFormData>;
}

export function AccessPermissionSection({form}: AccessPermissionSectionProps) {
  const {t} = useTranslation();
  const isDarkMode = useIsDarkMode();

  const roleData = [
    {
      value: 'member',
      label: t('staff.accessPermissions.memberRole'),
      description: t('staff.accessPermissions.memberDescription'),
      icon: IconUser,
      color: 'green',
    },
    {
      value: 'manager',
      label: t('staff.accessPermissions.managerRole'),
      description: t('staff.accessPermissions.managerDescription'),
      icon: IconUsers,
      color: 'blue',
    },
    {
      value: 'admin',
      label: t('staff.accessPermissions.adminRole'),
      description: t('staff.accessPermissions.adminDescription'),
      icon: IconShieldCheck,
      color: 'red',
    },
  ];

  const selectedRole = form.values.role;
  const selectedRoleData = roleData.find((role) => role.value === selectedRole);
  const permissions = permissionMatrix[selectedRole] || [];

  const formatPermissionName = (permission: string) => {
    return permission
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getPermissionDescription = (permission: string) => {
    const descriptions: Record<string, string> = {
      manage_store: t('staff.accessPermissions.permissions.manage_store'),
      manage_staff: t('staff.accessPermissions.permissions.manage_staff'),
      view_all_reports: t(
        'staff.accessPermissions.permissions.view_all_reports',
      ),
      manage_permissions: t(
        'staff.accessPermissions.permissions.manage_permissions',
      ),
      manage_schedule: t('staff.accessPermissions.permissions.manage_schedule'),
      view_all_profiles: t(
        'staff.accessPermissions.permissions.view_all_profiles',
      ),
      clock_in: t('staff.accessPermissions.permissions.clock_in'),
      view_reports: t('staff.accessPermissions.permissions.view_reports'),
      view_own_profile: t(
        'staff.accessPermissions.permissions.view_own_profile',
      ),
      view_schedule: t('staff.accessPermissions.permissions.view_schedule'),
    };

    return (
      descriptions[permission] ||
      t('staff.accessPermissions.permissions.default')
    );
  };

  return (
    <Stack gap="lg">
      <div>
        <Text size="lg" fw={600} mb="md">
          {t('staff.accessPermissions.title')}
        </Text>
        <Text size="sm" c="dimmed">
          {t('staff.accessPermissions.description')}
        </Text>
      </div>

      <Paper withBorder p="md" radius="md">
        <Stack gap="md">
          <Group gap="xs">
            <IconShield size={16} />
            <Text size="sm" fw={500}>
              {t('staff.accessPermissions.roleSelection')}
            </Text>
          </Group>

          <Select
            required
            label={t('staff.accessPermissions.staffRole')}
            placeholder={t('staff.accessPermissions.selectRole')}
            data={roleData.map((role) => ({
              value: role.value,
              label: role.label,
            }))}
            {...form.getInputProps('role')}
          />

          {selectedRoleData ? (
            <Alert
              icon={<selectedRoleData.icon size={16} />}
              color={selectedRoleData.color}
              variant="light"
            >
              <Text fw={500}>{selectedRoleData.label}</Text>
              <Text size="sm">{selectedRoleData.description}</Text>
            </Alert>
          ) : null}
        </Stack>
      </Paper>

      <Paper withBorder p="md" radius="md">
        <Stack gap="md">
          <Group gap="xs">
            <IconUserCheck size={16} />
            <Text size="sm" fw={500}>
              {t('staff.accessPermissions.rolePermissions', {
                count: permissions.length,
              })}
            </Text>
          </Group>

          {permissions.length > 0 ? (
            <SimpleGrid cols={{base: 1, sm: 2}} spacing="md">
              {permissions.map((permission) => (
                <Paper
                  key={permission}
                  withBorder
                  p="sm"
                  radius="sm"
                  style={{
                    backgroundColor: isDarkMode
                      ? 'var(--mantine-color-dark-6)'
                      : 'var(--mantine-color-gray-0)',
                  }}
                >
                  <Group gap="sm" align="flex-start">
                    <ThemeIcon
                      color="green"
                      variant="light"
                      size="sm"
                      radius="xl"
                    >
                      <IconCheck size={12} />
                    </ThemeIcon>
                    <div style={{flex: 1}}>
                      <Text size="sm" fw={500}>
                        {formatPermissionName(permission)}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {getPermissionDescription(permission)}
                      </Text>
                    </div>
                  </Group>
                </Paper>
              ))}
            </SimpleGrid>
          ) : (
            <Alert
              icon={<IconInfoCircle size={16} />}
              color="orange"
              variant="light"
            >
              {t('staff.accessPermissions.noPermissionsDefined')}
            </Alert>
          )}
        </Stack>
      </Paper>

      <Paper
        withBorder
        p="md"
        radius="md"
        style={{
          backgroundColor: isDarkMode
            ? 'var(--mantine-color-dark-6)'
            : 'var(--mantine-color-blue-0)',
        }}
      >
        <Stack gap="md">
          <Text size="sm" fw={500}>
            {t('staff.accessPermissions.roleComparison')}
          </Text>
          <SimpleGrid cols={{base: 1, sm: 3}} spacing="md">
            {roleData.map((role) => (
              <Paper
                key={role.value}
                withBorder
                p="sm"
                radius="sm"
                style={{
                  backgroundColor:
                    selectedRole === role.value
                      ? isDarkMode
                        ? 'var(--mantine-color-dark-5)'
                        : `var(--mantine-color-${role.color}-0)`
                      : isDarkMode
                        ? 'var(--mantine-color-dark-6)'
                        : 'white',
                }}
              >
                <Stack gap="xs" align="center">
                  <Group gap="xs">
                    <role.icon size={16} />
                    <Badge
                      color={role.color}
                      variant={selectedRole === role.value ? 'filled' : 'light'}
                      size="sm"
                    >
                      {role.label}
                    </Badge>
                  </Group>
                  <Text size="xs" ta="center" c="dimmed">
                    {permissionMatrix[
                      role.value as keyof typeof permissionMatrix
                    ]?.length || 0}{' '}
                    {t('staff.accessPermissions.permissionsCount')}
                  </Text>
                </Stack>
              </Paper>
            ))}
          </SimpleGrid>

          <Alert
            icon={<IconInfoCircle size={16} />}
            color="blue"
            variant="light"
            style={{fontSize: '0.8rem'}}
          >
            <Text size="xs">
              <strong>{t('staff.accessPermissions.noteTitle')}</strong>{' '}
              {t('staff.accessPermissions.noteText')}
            </Text>
          </Alert>
        </Stack>
      </Paper>
    </Stack>
  );
}
