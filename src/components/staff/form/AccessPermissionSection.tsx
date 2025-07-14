import {
  Stack,
  Group,
  Text,
  Select,
  Alert,
  Paper,
  Badge,
  List,
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
import {
  permissionMatrix,
  type CreateStaffRequest,
  type Staff,
} from '@/services/staff';

export interface AccessPermissionSectionProps {
  readonly form: UseFormReturnType<CreateStaffRequest>;
}

export function AccessPermissionSection({form}: AccessPermissionSectionProps) {
  const roleData = [
    {
      value: 'member',
      label: 'Member',
      description: 'Basic staff access - can view own profile and clock in',
      icon: IconUser,
      color: 'green',
    },
    {
      value: 'manager',
      label: 'Manager',
      description: 'Supervisor access - can manage staff and view reports',
      icon: IconUsers,
      color: 'blue',
    },
    {
      value: 'admin',
      label: 'Administrator',
      description:
        'Full access - can manage everything including store settings',
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
      manage_store: 'Configure store settings, operating hours, and location',
      manage_staff: 'Add, edit, and remove staff members',
      view_all_reports: 'Access all business reports and analytics',
      manage_permissions: 'Modify user roles and permissions',
      manage_schedule: 'Create and edit staff schedules',
      view_all_profiles: 'View detailed information of all staff members',
      clock_in: 'Access to clock in and out of shifts',
      view_reports: 'View reports relevant to managed teams',
      view_own_profile: 'View and edit personal profile information',
      view_schedule: 'View assigned shifts and schedule',
    };

    return descriptions[permission] || 'Standard system access';
  };

  return (
    <Stack gap="lg">
      <div>
        <Text size="lg" fw={600} mb="md">
          Access & Permissions
        </Text>
        <Text size="sm" c="dimmed">
          Choose the appropriate role for this staff member. Each role has
          predefined permissions that control what the user can access and do in
          the system.
        </Text>
      </div>

      <Paper withBorder p="md" radius="md">
        <Stack gap="md">
          <Group gap="xs">
            <IconShield size={16} />
            <Text size="sm" fw={500}>
              Role Selection
            </Text>
          </Group>

          <Select
            required
            label="Staff Role"
            placeholder="Select a role"
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
              Role Permissions ({permissions.length})
            </Text>
          </Group>

          {permissions.length > 0 ? (
            <SimpleGrid cols={{base: 1, sm: 2}} spacing="md">
              {permissions.map((permission, index) => (
                <Paper
                  key={permission}
                  withBorder
                  p="sm"
                  radius="sm"
                  bg="gray.0"
                  style={{backgroundColor: 'var(--mantine-color-gray-0)'}}
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
              No permissions defined for the selected role.
            </Alert>
          )}
        </Stack>
      </Paper>

      <Paper
        withBorder
        p="md"
        radius="md"
        bg="blue.0"
        style={{backgroundColor: 'var(--mantine-color-blue-0)'}}
      >
        <Stack gap="md">
          <Text size="sm" fw={500}>
            Role Comparison
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
                      ? `var(--mantine-color-${role.color}-0)`
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
                    permissions
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
              <strong>Note:</strong> Permissions are automatically assigned
              based on the selected role. Custom permission management will be
              available in future updates.
            </Text>
          </Alert>
        </Stack>
      </Paper>
    </Stack>
  );
}
