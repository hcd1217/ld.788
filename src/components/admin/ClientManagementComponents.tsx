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
} from '@tabler/icons-react';
import {useTranslation} from '@/hooks/useTranslation';
import {formatDate} from '@/utils/string';
import type {Client} from '@/lib/api';

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
  readonly client: Client;
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
