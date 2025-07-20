import {Container, Title, Text, Group, Badge, Stack, Tabs} from '@mantine/core';
import {IconUsers, IconLock} from '@tabler/icons-react';
import {useState} from 'react';
import {
  AdminDataTable,
  type TableColumn,
} from '@/components/admin/AdminDataTable';

// Generate demo data
const generateDemoUsers = (count: number) => {
  return Array.from({length: count}, (_, i) => ({
    id: `user-${i}`,
    userName: `user${i}`,
    email: `user${i}@example.com`,
    firstName: `First${i}`,
    lastName: `Last${i}`,
    isActive: i % 3 !== 0,
    createdAt: new Date(
      Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000,
    ).toISOString(),
  }));
};

const generateDemoRoles = (count: number) => {
  return Array.from({length: count}, (_, i) => ({
    id: `role-${i}`,
    name: `role_${i}`,
    displayName: `Role ${i}`,
    description: `This is a description for role ${i}. It can be quite long and detailed.`,
    level: Math.floor(Math.random() * 5) + 1,
    isSystem: i % 4 === 0,
    createdAt: new Date(
      Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000,
    ).toISOString(),
  }));
};

export function VirtualScrollDemo() {
  const [dataSize, setDataSize] = useState<'small' | 'medium' | 'large'>(
    'medium',
  );

  const getUserCount = () => {
    switch (dataSize) {
      case 'small': {
        return 10;
      }

      case 'medium': {
        return 100;
      }

      case 'large': {
        return 1000;
      }
    }
  };

  const users = generateDemoUsers(getUserCount());
  const roles = generateDemoRoles(getUserCount());

  const userColumns: Array<TableColumn<(typeof users)[0]>> = [
    {
      key: 'userName',
      label: 'Username',
      render: (user) => <Text fw={500}>{user.userName}</Text>,
    },
    {
      key: 'email',
      label: 'Email',
      render: (user) => (
        <Group gap="xs">
          <Text size="sm">{user.email}</Text>
        </Group>
      ),
    },
    {
      key: 'firstName',
      label: 'Full Name',
      render: (user) => (
        <Text size="sm">
          {user.firstName} {user.lastName}
        </Text>
      ),
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (user) => (
        <Badge color={user.isActive ? 'green' : 'red'} variant="filled">
          {user.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      label: 'Created At',
      render: (user) => (
        <Text size="sm" c="dimmed">
          {new Date(user.createdAt).toLocaleDateString()}
        </Text>
      ),
    },
  ];

  const roleColumns: Array<TableColumn<(typeof roles)[0]>> = [
    {
      key: 'name',
      label: 'Role Name',
      render: (role) => (
        <Badge variant="light" color="blue">
          {role.name}
        </Badge>
      ),
    },
    {
      key: 'displayName',
      label: 'Display Name',
    },
    {
      key: 'description',
      label: 'Description',
      render: (role) => (
        <Text size="sm" c="dimmed" style={{maxWidth: '300px'}} lineClamp={2}>
          {role.description}
        </Text>
      ),
    },
    {
      key: 'level',
      label: 'Level',
      render: (role) => (
        <Badge variant="filled" color="indigo">
          Level {role.level}
        </Badge>
      ),
    },
    {
      key: 'isSystem',
      label: 'Type',
      render: (role) =>
        role.isSystem ? (
          <Badge color="gray" variant="dot">
            System
          </Badge>
        ) : (
          <Badge color="green" variant="dot">
            Custom
          </Badge>
        ),
    },
  ];

  return (
    <Container fluid px="xl">
      <Stack gap="lg">
        <Title order={2}>Virtual Scrolling Demo</Title>
        <Text c="dimmed">
          Test virtual scrolling performance with different dataset sizes.
        </Text>

        <Group>
          <Text fw={500}>Dataset Size:</Text>
          <Group>
            <Badge
              variant={dataSize === 'small' ? 'filled' : 'light'}
              color="blue"
              style={{cursor: 'pointer'}}
              onClick={() => {
                setDataSize('small');
              }}
            >
              Small (10 rows)
            </Badge>
            <Badge
              variant={dataSize === 'medium' ? 'filled' : 'light'}
              color="blue"
              style={{cursor: 'pointer'}}
              onClick={() => {
                setDataSize('medium');
              }}
            >
              Medium (100 rows)
            </Badge>
            <Badge
              variant={dataSize === 'large' ? 'filled' : 'light'}
              color="blue"
              style={{cursor: 'pointer'}}
              onClick={() => {
                setDataSize('large');
              }}
            >
              Large (1000 rows)
            </Badge>
          </Group>
        </Group>

        <Tabs defaultValue="users">
          <Tabs.List>
            <Tabs.Tab value="users" leftSection={<IconUsers size={14} />}>
              Users Table
            </Tabs.Tab>
            <Tabs.Tab value="roles" leftSection={<IconLock size={14} />}>
              Roles Table
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="users" pt="md">
            <AdminDataTable
              data={users}
              columns={userColumns}
              emptyState={{
                icon: <IconUsers size={48} color="gray" />,
                message: 'No users found',
              }}
              ariaLabel="Demo users table"
              getRowKey={(user) => user.id}
              virtualScroll={{
                enabled: false,
                threshold: 50,
                height: 600,
                rowHeight: 60,
              }}
            />
          </Tabs.Panel>

          <Tabs.Panel value="roles" pt="md">
            <AdminDataTable
              data={roles}
              columns={roleColumns}
              emptyState={{
                icon: <IconLock size={48} color="gray" />,
                message: 'No roles found',
              }}
              ariaLabel="Demo roles table"
              getRowKey={(role) => role.id}
              virtualScroll={{
                enabled: false,
                threshold: 50,
                height: 600,
                rowHeight: 60,
              }}
            />
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </Container>
  );
}
