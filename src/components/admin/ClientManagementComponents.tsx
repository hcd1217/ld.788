import React, {useState} from 'react';
import {
  Badge,
  Group,
  Text,
  Box,
  Modal,
  Stack,
  Title,
  Alert,
  TextInput,
  Button,
  Card,
  ActionIcon,
  Menu,
  Table,
  Switch,
  type BadgeProps,
} from '@mantine/core';
import {
  IconBuilding,
  IconUser,
  IconMail,
  IconCalendar,
  IconAlertTriangle,
  IconEdit,
  IconDotsVertical,
  IconCircleCheck,
  IconBan,
  IconTrash,
  IconLock,
  IconFlag,
  IconUsers,
  IconChevronDown,
  IconChevronUp,
} from '@tabler/icons-react';
import {notifications} from '@mantine/notifications';
import {AdminDataTable, type TableColumn} from './AdminDataTable';
import {
  FilterableAdminDataTable,
  type FilterableColumn,
} from './FilterableAdminDataTable';
import {ExportButton} from './ExportButton';
import {TruncatedText} from './TruncatedText';
import useTranslation from '@/hooks/useTranslation';
import {type ExportColumn} from '@/utils/export';
import {convertCamelCaseToText, formatDate} from '@/utils/string';
import {
  adminApi,
  type Client,
  type ClientDetail,
  type RoleDetail,
  type DynamicFeatureFlagDetail,
  type ClientUser,
} from '@/lib/api';

// Client Status Badge Component
interface ClientStatusBadgeProps extends BadgeProps {
  readonly status: 'active' | 'suspended';
}

export function ClientStatusBadge({
  status,
  size = 'lg',
  ...props
}: ClientStatusBadgeProps) {
  const {t} = useTranslation();

  return (
    <Badge
      size={size}
      color={status === 'active' ? 'green' : 'red'}
      variant="filled"
      {...props}
    >
      {status === 'active'
        ? t('admin.clients.active')
        : t('admin.clients.suspended')}
    </Badge>
  );
}

// Client Info Display Component
interface ClientInfoDisplayProps {
  readonly label: string;
  readonly value: string;
  readonly icon?: React.ReactNode;
}

export function ClientInfoDisplay({
  label,
  value,
  icon,
}: ClientInfoDisplayProps) {
  return (
    <Box>
      <Text size="sm" c="dimmed" mb={4}>
        {label}
      </Text>
      {icon ? (
        <Group gap="xs">
          {icon}
          <Text fw={500}>{value}</Text>
        </Group>
      ) : (
        <Text fw={500}>{value}</Text>
      )}
    </Box>
  );
}

// Client Basic Info Component
interface ClientBasicInfoProps {
  readonly client: Client;
}

export function ClientBasicInfo({client}: ClientBasicInfoProps) {
  const {t} = useTranslation();

  return (
    <>
      <Group justify="space-between" align="center">
        <Title order={3}>{t('admin.clients.clientInformation')}</Title>
        <ClientStatusBadge status={client.status} />
      </Group>

      <Box>
        <Text size="sm" c="dimmed" mb={4}>
          {t('admin.clients.clientCode')}
        </Text>
        <Badge size="lg" variant="light" color="blue">
          {client.clientCode}
        </Badge>
      </Box>

      <ClientInfoDisplay
        label={t('admin.clients.clientName')}
        value={client.clientName}
        icon={<IconBuilding size={16} />}
      />

      <Group gap="xs" c="dimmed">
        <IconCalendar size={14} />
        <Text size="sm">
          {t('common.created')} {formatDate(client.createdAt)}
        </Text>
      </Group>
    </>
  );
}

// Root User Info Component
interface RootUserInfoProps {
  readonly rootUser: Client['rootUser'];
}

export function RootUserInfo({rootUser}: RootUserInfoProps) {
  const {t} = useTranslation();

  return (
    <>
      <Title order={3}>{t('admin.clients.rootUserInformation')}</Title>

      <Group grow>
        <ClientInfoDisplay
          label={t('admin.clients.firstName')}
          value={rootUser.firstName}
          icon={<IconUser size={16} />}
        />

        <ClientInfoDisplay
          label={t('admin.clients.lastName')}
          value={rootUser.lastName}
          icon={<IconUser size={16} />}
        />
      </Group>

      <ClientInfoDisplay
        label={t('admin.clients.email')}
        value={rootUser.email}
        icon={<IconMail size={16} />}
      />
    </>
  );
}

// Client Action Modal Component
interface ClientActionModalProps {
  readonly opened: boolean;
  readonly onClose: () => void;
  readonly actionType: 'suspend' | 'reactivate' | 'delete';
  readonly clientName: string;
  readonly clientCode?: string;
  readonly suspendReason?: string;
  readonly onSuspendReasonChange?: (value: string) => void;
  readonly deleteConfirmCode?: string;
  readonly onDeleteConfirmCodeChange?: (value: string) => void;
  readonly deleteReason?: string;
  readonly onDeleteReasonChange?: (value: string) => void;
  readonly onConfirm: () => void;
  readonly confirmButtonColor?: string;
}

export function ClientActionModal({
  opened,
  onClose,
  actionType,
  clientName,
  clientCode,
  suspendReason = '',
  onSuspendReasonChange,
  deleteConfirmCode = '',
  onDeleteConfirmCodeChange,
  deleteReason = '',
  onDeleteReasonChange,
  onConfirm,
  confirmButtonColor,
}: ClientActionModalProps) {
  const {t} = useTranslation();

  const getTitle = () => {
    switch (actionType) {
      case 'suspend': {
        return t('admin.clients.confirmSuspendTitle');
      }

      case 'reactivate': {
        return t('admin.clients.confirmActivateTitle');
      }

      case 'delete': {
        return t('admin.clients.confirmDeleteTitle');
      }
      // No default needed - actionType is exhaustive
    }
  };

  const getButtonText = () => {
    switch (actionType) {
      case 'suspend': {
        return t('admin.clients.suspend');
      }

      case 'reactivate': {
        return t('admin.clients.activate');
      }

      case 'delete': {
        return t('admin.clients.delete');
      }
      // No default needed - actionType is exhaustive
    }
  };

  const getColor = () => {
    switch (actionType) {
      case 'suspend': {
        return 'yellow';
      }

      case 'reactivate': {
        return 'green';
      }

      case 'delete': {
        return 'red';
      }
      // No default needed - actionType is exhaustive
    }
  };

  return (
    <Modal
      centered
      opened={opened}
      title={<Title order={3}>{getTitle()}</Title>}
      onClose={onClose}
    >
      <Stack gap="md">
        {actionType === 'suspend' && (
          <>
            <Text>
              {t('admin.clients.confirmSuspendMessage', {name: clientName})}
            </Text>

            <TextInput
              required
              label={t('admin.clients.suspendReason')}
              placeholder={t('admin.clients.suspendReasonPlaceholder')}
              value={suspendReason}
              onChange={(e) => onSuspendReasonChange?.(e.currentTarget.value)}
            />

            <Alert
              icon={<IconAlertTriangle size={16} />}
              color="yellow"
              variant="light"
            >
              {t('admin.clients.suspendWarning')}
            </Alert>
          </>
        )}

        {actionType === 'reactivate' && (
          <Text>
            {t('admin.clients.confirmActivateMessage', {name: clientName})}
          </Text>
        )}

        {actionType === 'delete' && (
          <>
            <Alert
              icon={<IconAlertTriangle size={16} />}
              color="red"
              variant="filled"
            >
              {t('admin.clients.deleteWarning')}
            </Alert>

            <Text c="dimmed">
              {t('admin.clients.confirmDeleteMessage', {name: clientName})}
            </Text>

            <TextInput
              required
              label={t('admin.clients.confirmClientCode')}
              description={t('admin.clients.confirmClientCodeDescription', {
                code: clientCode || '',
              })}
              placeholder={clientCode}
              value={deleteConfirmCode}
              onChange={(e) =>
                onDeleteConfirmCodeChange?.(e.currentTarget.value)
              }
            />

            <TextInput
              required
              label={t('admin.clients.deleteReason')}
              placeholder={t('admin.clients.deleteReasonPlaceholder')}
              value={deleteReason}
              onChange={(e) => onDeleteReasonChange?.(e.currentTarget.value)}
            />
          </>
        )}

        <Group justify="flex-end" gap="sm">
          <Button variant="light" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button color={confirmButtonColor || getColor()} onClick={onConfirm}>
            {getButtonText()}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

// Client Card Component
interface ClientCardProps {
  readonly client: Client;
  readonly onSuspend: (client: Client) => void;
  readonly onReactivate: (client: Client) => void;
  readonly onDelete: (client: Client) => void;
  readonly onViewDetails: (clientCode: string) => void;
}

// Client Action Menu Component
interface ClientActionMenuProps {
  readonly client: Client | ClientDetail;
  readonly onSuspend: () => void;
  readonly onReactivate: () => void;
  readonly onDelete: () => void;
  readonly size?: 'sm' | 'lg';
}

export function ClientActionMenu({
  client,
  onSuspend,
  onReactivate,
  onDelete,
  size = 'sm',
}: ClientActionMenuProps) {
  const {t} = useTranslation();
  const isSuspended = client.status === 'suspended';

  return (
    <Menu shadow="md" width={200}>
      <Menu.Target>
        <ActionIcon
          variant="light"
          size={size}
          title={t('admin.clients.moreActions')}
        >
          <IconDotsVertical size={size === 'sm' ? 14 : 16} />
        </ActionIcon>
      </Menu.Target>

      <Menu.Dropdown>
        {isSuspended ? (
          <Menu.Item
            leftSection={<IconCircleCheck size={14} />}
            color="green"
            onClick={onReactivate}
          >
            {t('admin.clients.activateClient')}
          </Menu.Item>
        ) : (
          <Menu.Item
            leftSection={<IconBan size={14} />}
            color="yellow"
            onClick={onSuspend}
          >
            {t('admin.clients.suspendClient')}
          </Menu.Item>
        )}
        <Menu.Divider />
        <Menu.Item
          leftSection={<IconTrash size={14} />}
          color="red"
          onClick={onDelete}
        >
          {t('admin.clients.deleteClient')}
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}

export function ClientCard({
  client,
  onSuspend,
  onReactivate,
  onDelete,
  onViewDetails,
}: ClientCardProps) {
  const {t} = useTranslation();
  const isSuspended = client.status === 'suspended';

  return (
    <Card
      withBorder
      shadow="sm"
      padding="lg"
      radius="md"
      style={isSuspended ? {opacity: 0.7} : undefined}
    >
      <Stack gap="md">
        <Group justify="space-between" align="flex-start">
          <Stack gap={4} style={{flex: 1}}>
            <Group gap="xs" wrap="nowrap">
              <Text truncate fw={700} size="lg">
                {client.clientName}
              </Text>
              <ClientStatusBadge status={client.status} size="sm" />
            </Group>

            <Badge size="md" variant="light" color="blue">
              {client.clientCode}
            </Badge>

            <Group gap="xs" c="dimmed" mt="xs">
              <IconMail size={14} />
              <Text size="sm">{client.rootUser.email}</Text>
            </Group>

            <Text size="sm" c="dimmed">
              {client.rootUser.firstName} {client.rootUser.lastName}
            </Text>
          </Stack>

          <Group gap="xs">
            <ActionIcon
              color="blue"
              variant="light"
              size="sm"
              title={t('admin.clients.viewDetails')}
              onClick={() => {
                onViewDetails(client.clientCode);
              }}
            >
              <IconEdit size={14} />
            </ActionIcon>

            <ClientActionMenu
              client={client}
              onSuspend={() => {
                onSuspend(client);
              }}
              onReactivate={() => {
                onReactivate(client);
              }}
              onDelete={() => {
                onDelete(client);
              }}
            />
          </Group>
        </Group>

        <Group
          justify="space-between"
          pt="md"
          style={{borderTop: '1px solid var(--mantine-color-gray-3)'}}
        >
          <Group gap="xs" c="dimmed">
            <IconCalendar size={14} />
            <Text size="xs">
              {t('common.created')} {formatDate(client.createdAt)}
            </Text>
          </Group>
        </Group>
      </Stack>
    </Card>
  );
}

// Client Roles Section Component
interface ClientRolesSectionProps {
  readonly roles: RoleDetail[];
}

export const ClientRolesSection = React.memo(function ({
  roles,
}: ClientRolesSectionProps) {
  const {t} = useTranslation();

  const columns: Array<TableColumn<RoleDetail>> = [
    {
      key: 'name',
      label: t('admin.clients.roleName'),
      render: (role) => (
        <Badge variant="light" color="blue">
          {role.name}
        </Badge>
      ),
    },
    {
      key: 'displayName',
      label: t('admin.clients.roleDisplayName'),
    },
    {
      key: 'description',
      label: t('admin.clients.roleDescription'),
      render: (role) => (
        <TruncatedText
          text={role.description}
          size="sm"
          c="dimmed"
          maxWidth="300px"
          lineClamp={2}
        />
      ),
    },
    {
      key: 'level',
      label: t('admin.clients.roleLevel'),
      render: (role) => (
        <Badge variant="filled" color="indigo">
          {t('admin.clients.level')} {role.level}
        </Badge>
      ),
    },
    {
      key: 'isSystem',
      label: t('admin.clients.roleType'),
      render: (role) =>
        role.isSystem ? (
          <Badge color="gray" variant="dot">
            {t('admin.clients.systemRole')}
          </Badge>
        ) : (
          <Badge color="green" variant="dot">
            {t('admin.clients.customRole')}
          </Badge>
        ),
    },
    {
      key: 'createdAt',
      label: t('common.createdAt'),
      render: (role) => (
        <Text size="sm" c="dimmed">
          {formatDate(role.createdAt)}
        </Text>
      ),
    },
  ];

  return (
    <AdminDataTable<RoleDetail>
      data={roles}
      columns={columns}
      emptyState={{
        icon: <IconLock size={48} color="gray" aria-hidden="true" />,
        message: t('admin.clients.noRolesFound'),
      }}
      ariaLabel={t('admin.clients.rolesTableAriaLabel')}
      getRowKey={(role) => role.id}
      virtualScroll={{
        enabled: false,
        threshold: 50,
        height: 600,
        rowHeight: 60,
      }}
    />
  );
});

// Client Feature Flags Section Component
interface ClientFeatureFlagsSectionProps {
  readonly featureFlags: DynamicFeatureFlagDetail[];
  readonly clientId: string;
  readonly onUpdate?: () => void;
}

export const ClientFeatureFlagsSection = React.memo(function ({
  featureFlags,
  clientId,
  onUpdate,
}: ClientFeatureFlagsSectionProps) {
  const {t} = useTranslation();
  const [expandedFlags, setExpandedFlags] = useState<Set<string>>(new Set());
  const [updating, setUpdating] = useState<Set<string>>(new Set());

  const toggleExpanded = (flagId: string) => {
    setExpandedFlags((prev) => {
      const next = new Set(prev);
      if (next.has(flagId)) {
        next.delete(flagId);
      } else {
        next.add(flagId);
      }

      return next;
    });
  };

  const handleToggleFlag = async (flag: DynamicFeatureFlagDetail) => {
    setUpdating((prev) => new Set(prev).add(flag.key));
    try {
      if (flag.id) {
        await adminApi.updateDynamicFeatureFlag(clientId, flag.key, {
          enabled: !flag.enabled,
          value: flag.value || {},
        });
      } else {
        await adminApi.createDynamicFeatureFlag({
          clientId,
          key: flag.key,
          enabled: true,
          value: flag.value || {},
          rolloutPercentage: 100,
          description: flag.description ?? '',
        });
      }

      notifications.show({
        title: t('common.success'),
        message: t('admin.clients.featureFlagUpdated'),
        color: 'green',
      });
      onUpdate?.();
    } catch (error) {
      console.log(error);
      notifications.show({
        title: t('common.error'),
        message: t('admin.clients.featureFlagUpdateFailed'),
        color: 'red',
      });
    } finally {
      setUpdating((prev) => {
        const next = new Set(prev);
        next.delete(flag.key);
        return next;
      });
    }
  };

  const handleToggleValue = async (
    flag: DynamicFeatureFlagDetail,
    valueKey: string,
    currentValue: boolean,
  ) => {
    setUpdating((prev) => new Set(prev).add(`${flag.key}-${valueKey}`));

    try {
      const updatedValue = {
        ...flag.value,
        [valueKey]: !currentValue,
      };
      await adminApi.updateDynamicFeatureFlag(clientId, flag.key, {
        enabled: flag.enabled,
        value: updatedValue,
        description: flag.description,
        rolloutPercentage: flag.rolloutPercentage,
      });
      notifications.show({
        title: t('common.success'),
        message: t('admin.clients.featureFlagValueUpdated'),
        color: 'green',
      });
      onUpdate?.();
    } catch (error) {
      console.log(error);
      notifications.show({
        title: t('common.error'),
        message: t('admin.clients.featureFlagUpdateFailed'),
        color: 'red',
      });
    } finally {
      setUpdating((prev) => {
        const next = new Set(prev);
        next.delete(`${flag.key}-${valueKey}`);
        return next;
      });
    }
  };

  const columns: Array<TableColumn<DynamicFeatureFlagDetail>> = [
    {
      key: 'expand',
      label: '',
      width: 40,
      render(flag) {
        const hasValues = flag.value && Object.keys(flag.value).length > 0;
        const isExpanded = expandedFlags.has(flag.id ?? flag.key);
        return hasValues ? (
          <ActionIcon
            variant="subtle"
            size="sm"
            onClick={() => {
              toggleExpanded(flag.id ?? flag.key);
            }}
          >
            {isExpanded ? (
              <IconChevronUp size={16} />
            ) : (
              <IconChevronDown size={16} />
            )}
          </ActionIcon>
        ) : null;
      },
    },
    {
      key: 'key',
      label: t('admin.clients.featureFlagKey'),
      render: (flag) => (
        <Badge variant="filled" color="brand">
          {flag.key}
        </Badge>
      ),
    },
    {
      key: 'enabled',
      label: t('admin.clients.featureFlagStatus'),
      render: (flag) => (
        <Badge color={flag.enabled ? 'green' : 'red'} variant="filled">
          {flag.enabled
            ? t('admin.clients.enabled')
            : t('admin.clients.disabled')}
        </Badge>
      ),
    },
    {
      key: 'description',
      label: t('admin.clients.featureFlagDescription'),
      render: (flag) => (
        <TruncatedText
          text={flag.description}
          size="sm"
          c="dimmed"
          maxWidth="300px"
          lineClamp={2}
        />
      ),
    },
    {
      key: 'rolloutPercentage',
      label: t('admin.clients.rolloutPercentage'),
      render: (flag) => <Text size="sm">{flag.rolloutPercentage}%</Text>,
    },
    {
      key: 'enabledAt',
      label: t('admin.clients.enabledAt'),
      render: (flag) => (
        <Text size="sm" c="dimmed">
          {flag.enabledAt ? formatDate(flag.enabledAt) : '-'}
        </Text>
      ),
    },
    {
      key: 'actions',
      label: t('common.actions'),
      render: (flag) => (
        <Switch
          checked={flag.enabled}
          disabled={updating.has(flag.key)}
          onChange={async () => handleToggleFlag(flag)}
        />
      ),
    },
  ];

  const renderRow = (
    flag: DynamicFeatureFlagDetail,
    _index: number,
    rowContent: React.ReactNode,
  ) => {
    const isExpanded = expandedFlags.has(flag.id ?? flag.key);
    const hasValues = flag.value && Object.keys(flag.value).length > 0;

    return (
      <>
        {rowContent}
        {isExpanded && hasValues ? (
          <Table.Tr key={`${flag.id ?? flag.key}-expanded`}>
            <Table.Td
              colSpan={7}
              style={{backgroundColor: 'var(--mantine-color-gray-0)'}}
            >
              <Box p="md">
                <Stack gap="xs">
                  {Object.entries(flag.value || {}).map(([key, value]) => (
                    <Group key={key} ml="xl" justify="space-between" w="15rem">
                      <Text ml="xl" size="sm" fw={600}>
                        {convertCamelCaseToText(key)}
                      </Text>
                      <Switch
                        size="sm"
                        checked={value}
                        disabled={
                          !flag.enabled || updating.has(`${flag.key}-${key}`)
                        }
                        onChange={async () =>
                          handleToggleValue(flag, key, value)
                        }
                      />
                    </Group>
                  ))}
                </Stack>
              </Box>
            </Table.Td>
          </Table.Tr>
        ) : null}
      </>
    );
  };

  return (
    <AdminDataTable<DynamicFeatureFlagDetail>
      data={featureFlags}
      columns={columns}
      emptyState={{
        icon: <IconFlag size={48} color="gray" aria-hidden="true" />,
        message: t('admin.clients.noFeatureFlagsFound'),
      }}
      ariaLabel={t('admin.clients.featureFlagsTableAriaLabel')}
      getRowKey={(flag) => flag.id ?? flag.key}
      renderRow={renderRow}
      // Virtual scrolling disabled for this table due to expandable rows
      virtualScroll={false}
    />
  );
});

// Client Users Section Component
interface ClientUsersSectionProps {
  readonly users: ClientUser[];
}

export const ClientUsersSection = React.memo(function ({
  users,
}: ClientUsersSectionProps) {
  const {t} = useTranslation();

  const columns: Array<FilterableColumn<ClientUser>> = [
    {
      key: 'userName',
      label: t('admin.clients.userName'),
      render: (user) => (
        <Text fw={500}>{user.userName || user.email.split('@')[0]}</Text>
      ),
    },
    {
      key: 'email',
      label: t('admin.clients.email'),
      render: (user) => (
        <Group gap="xs">
          <IconMail size={14} />
          <Text size="sm">{user.email}</Text>
        </Group>
      ),
    },
    {
      key: 'fullName',
      label: t('admin.clients.fullName'),
      render: (user) => (
        <Group gap="xs">
          <IconUser size={14} />
          <Text size="sm">
            {user.firstName} {user.lastName}
          </Text>
        </Group>
      ),
    },
    {
      key: 'roles',
      label: t('admin.clients.roles'),
      render: (user) => (
        <Group gap={4}>
          {user.roles.map((role) => (
            <Badge key={role.id} size="sm" variant="light" color="violet">
              {role.displayName}
            </Badge>
          ))}
          {user.roles.length === 0 && (
            <Text size="sm" c="dimmed">
              {t('admin.clients.noRoles')}
            </Text>
          )}
        </Group>
      ),
    },
    {
      key: 'isRoot',
      label: t('admin.clients.userType'),
      render: (user) =>
        user.isRoot ? (
          <Badge color="orange" variant="filled">
            {t('admin.clients.rootUser')}
          </Badge>
        ) : (
          <Badge color="blue" variant="light">
            {t('admin.clients.regularUser')}
          </Badge>
        ),
    },
    {
      key: 'createdAt',
      label: t('common.createdAt'),
      render: (user) => (
        <Text size="sm" c="dimmed">
          {formatDate(user.createdAt)}
        </Text>
      ),
    },
  ];

  // Export columns with simplified data
  const exportColumns: Array<ExportColumn<ClientUser>> = [
    {
      key: 'userName',
      label: t('admin.clients.userName'),
      getValue: (user) => user.userName || user.email.split('@')[0],
    },
    {
      key: 'email',
      label: t('admin.clients.email'),
    },
    {
      key: 'firstName',
      label: t('admin.clients.firstName'),
    },
    {
      key: 'lastName',
      label: t('admin.clients.lastName'),
    },
    {
      key: 'roles',
      label: t('admin.clients.roles'),
      getValue: (user) =>
        user.roles.map((role) => role.displayName).join('; ') ||
        t('admin.clients.noRoles'),
    },
    {
      key: 'isRoot',
      label: t('admin.clients.userType'),
      getValue: (user) =>
        user.isRoot
          ? t('admin.clients.rootUser')
          : t('admin.clients.regularUser'),
    },
    {
      key: 'createdAt',
      label: t('common.createdAt'),
      getValue: (user) => formatDate(user.createdAt),
    },
  ];

  return (
    <FilterableAdminDataTable<ClientUser>
      data={users}
      columns={columns}
      emptyState={{
        icon: <IconUsers size={48} color="gray" aria-hidden="true" />,
        message: t('admin.clients.noUsersFound'),
      }}
      ariaLabel={t('admin.clients.usersTableAriaLabel')}
      searchPlaceholder={t('admin.clients.searchUsers')}
      searchFields={['userName', 'email', 'firstName', 'lastName']}
      defaultSortBy="userName"
      getRowKey={(user) => user.id}
      virtualScroll={{
        enabled: false,
        threshold: 50,
        height: 600,
        rowHeight: 60,
      }}
      extraActions={
        <ExportButton
          data={users}
          columns={exportColumns}
          filename="client-users"
        />
      }
    />
  );
});
