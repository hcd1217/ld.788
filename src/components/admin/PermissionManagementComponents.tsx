import {
  Badge,
  Group,
  Text,
  Modal,
  Stack,
  Title,
  Alert,
  TextInput,
  Button,
  ActionIcon,
  Menu,
  Textarea,
  Paper,
  Table,
  ScrollArea,
} from '@mantine/core';
import {
  IconAlertTriangle,
  IconEdit,
  IconDotsVertical,
  IconTrash,
  IconLock,
  IconCode,
  IconTag,
} from '@tabler/icons-react';
import {useState, useEffect} from 'react';
import {useTranslation} from '@/hooks/useTranslation';
import {formatDate} from '@/utils/string';
import {useIsDarkMode} from '@/hooks/useIsDarkMode';
import type {AdminPermission} from '@/lib/api';

// Missing imports

// Permission Table Component
interface PermissionTableProps {
  readonly permissions: AdminPermission[];
  readonly onEdit: (permission: AdminPermission) => void;
  readonly onDelete: (permission: AdminPermission) => void;
}

export function PermissionTable({
  permissions,
  onEdit,
  onDelete,
}: PermissionTableProps) {
  const {t} = useTranslation();

  const rows = permissions.map((permission) => (
    <Table.Tr key={permission.id}>
      <Table.Td>
        <Group gap="xs">
          <Code size="sm">
            {permission.resource}.{permission.action}
          </Code>
          {permission.isSystem ? (
            <Badge color="orange" variant="filled" size="sm">
              {t('admin.permissions.system')}
            </Badge>
          ) : null}
        </Group>
      </Table.Td>
      <Table.Td>
        <Badge variant="light" color="blue">
          {permission.scope}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{permission.description}</Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm" c="dimmed">
          {formatDate(permission.createdAt)}
        </Text>
      </Table.Td>
      <Table.Td>
        {permission.isSystem ? (
          <Text size="sm" c="dimmed">
            -
          </Text>
        ) : (
          <Menu shadow="md" width={200} position="bottom-end">
            <Menu.Target>
              <ActionIcon variant="subtle" color="gray">
                <IconDotsVertical size={16} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item
                leftSection={<IconEdit size={14} />}
                onClick={() => {
                  onEdit(permission);
                }}
              >
                {t('admin.permissions.editDescription')}
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item
                color="red"
                leftSection={<IconTrash size={14} />}
                onClick={() => {
                  onDelete(permission);
                }}
              >
                {t('admin.permissions.deletePermission')}
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        )}
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <ScrollArea>
      <Table striped highlightOnHover withTableBorder withColumnBorders>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>{t('admin.permissions.permission')}</Table.Th>
            <Table.Th>{t('admin.permissions.scope')}</Table.Th>
            <Table.Th>{t('admin.permissions.description')}</Table.Th>
            <Table.Th>{t('admin.permissions.createdAt')}</Table.Th>
            <Table.Th style={{width: 80}}>
              {t('admin.permissions.actions')}
            </Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>
    </ScrollArea>
  );
}

// Code component for inline code display
interface CodeProps {
  readonly children: React.ReactNode;
  readonly size?: 'xs' | 'sm' | 'md';
}

function Code({children, size = 'sm'}: CodeProps) {
  const isDarkMode = useIsDarkMode();
  return (
    <Text
      component="code"
      size={size}
      fw={500}
      bg={isDarkMode ? 'dark.6' : 'gray.1'}
      px={6}
      py={2}
      style={{
        borderRadius: 4,
        fontFamily: 'var(--mantine-font-family-monospace)',
      }}
    >
      {children}
    </Text>
  );
}

// Create Permission Modal Component
interface CreatePermissionModalProps {
  readonly opened: boolean;
  readonly onClose: () => void;
  readonly onConfirm: (data: {
    resource: string;
    action: string;
    scope: string;
    description: string;
  }) => Promise<void>;
}

export function CreatePermissionModal({
  opened,
  onClose,
  onConfirm,
}: CreatePermissionModalProps) {
  const {t} = useTranslation();
  const [resource, setResource] = useState('');
  const [action, setAction] = useState('');
  const [scope, setScope] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = () => {
    setResource('');
    setAction('');
    setScope('');
    setDescription('');
    onClose();
  };

  const handleSubmit = async () => {
    if (
      !resource.trim() ||
      !action.trim() ||
      !scope.trim() ||
      !description.trim()
    ) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onConfirm({
        resource: resource.trim(),
        action: action.trim(),
        scope: scope.trim(),
        description: description.trim(),
      });
      handleClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      opened={opened}
      title={
        <Title order={4}>{t('admin.permissions.createNewPermission')}</Title>
      }
      size="md"
      onClose={handleClose}
    >
      <Stack gap="md">
        <Alert
          icon={<IconAlertTriangle size={16} />}
          color="yellow"
          variant="light"
        >
          {t('admin.permissions.createWarning')}
        </Alert>

        <TextInput
          required
          data-autofocus
          label={t('admin.permissions.resource')}
          placeholder={t('admin.permissions.resourcePlaceholder')}
          value={resource}
          onChange={(e) => {
            setResource(e.target.value);
          }}
        />

        <TextInput
          required
          label={t('admin.permissions.action')}
          placeholder={t('admin.permissions.actionPlaceholder')}
          value={action}
          onChange={(e) => {
            setAction(e.target.value);
          }}
        />

        <TextInput
          required
          label={t('admin.permissions.scope')}
          placeholder={t('admin.permissions.scopePlaceholder')}
          value={scope}
          onChange={(e) => {
            setScope(e.target.value);
          }}
        />

        <Textarea
          required
          label={t('admin.permissions.description')}
          placeholder={t('admin.permissions.descriptionPlaceholder')}
          value={description}
          rows={3}
          onChange={(e) => {
            setDescription(e.target.value);
          }}
        />

        <Group justify="flex-end">
          <Button
            variant="subtle"
            disabled={isSubmitting}
            onClick={handleClose}
          >
            {t('common.cancel')}
          </Button>
          <Button
            loading={isSubmitting}
            disabled={
              !resource.trim() ||
              !action.trim() ||
              !scope.trim() ||
              !description.trim()
            }
            onClick={handleSubmit}
          >
            {t('admin.permissions.createPermission')}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

// Edit Permission Modal Component
interface EditPermissionModalProps {
  readonly opened: boolean;
  readonly permission: AdminPermission | undefined;
  readonly onClose: () => void;
  readonly onConfirm: (id: string, description: string) => Promise<void>;
}

export function EditPermissionModal({
  opened,
  permission,
  onClose,
  onConfirm,
}: EditPermissionModalProps) {
  const {t} = useTranslation();
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (permission) {
      setDescription(permission.description);
    }
  }, [permission]);

  const handleClose = () => {
    setDescription('');
    onClose();
  };

  const handleSubmit = async () => {
    if (!permission || !description.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onConfirm(permission.id, description.trim());
      handleClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      opened={opened}
      title={<Title order={4}>{t('admin.permissions.editDescription')}</Title>}
      size="md"
      onClose={handleClose}
    >
      <Stack gap="md">
        {permission ? (
          <>
            <Paper p="sm" bg="gray.0" radius="sm">
              <Stack gap="xs">
                <Group gap="xs">
                  <IconCode size={16} color="var(--mantine-color-gray-6)" />
                  <Text size="sm" fw={500}>
                    {permission.resource}.{permission.action}
                  </Text>
                </Group>
                <Group gap="xs">
                  <IconTag size={16} color="var(--mantine-color-gray-6)" />
                  <Text size="sm" c="dimmed">
                    {t('admin.permissions.scope')}: {permission.scope}
                  </Text>
                </Group>
              </Stack>
            </Paper>

            <Textarea
              required
              data-autofocus
              label={t('admin.permissions.description')}
              placeholder={t('admin.permissions.descriptionPlaceholder')}
              value={description}
              rows={3}
              onChange={(e) => {
                setDescription(e.target.value);
              }}
            />

            <Group justify="flex-end">
              <Button
                variant="subtle"
                disabled={isSubmitting}
                onClick={handleClose}
              >
                {t('common.cancel')}
              </Button>
              <Button
                loading={isSubmitting}
                disabled={!description.trim()}
                onClick={handleSubmit}
              >
                {t('admin.permissions.updatePermission')}
              </Button>
            </Group>
          </>
        ) : null}
      </Stack>
    </Modal>
  );
}

// Delete Permission Modal Component
interface DeletePermissionModalProps {
  readonly opened: boolean;
  readonly permission: AdminPermission | undefined;
  readonly onClose: () => void;
  readonly onConfirm: (id: string) => Promise<void>;
}

export function DeletePermissionModal({
  opened,
  permission,
  onClose,
  onConfirm,
}: DeletePermissionModalProps) {
  const {t} = useTranslation();
  const isDarkMode = useIsDarkMode();
  const [confirmText, setConfirmText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = () => {
    setConfirmText('');
    onClose();
  };

  const handleSubmit = async () => {
    if (!permission || confirmText !== 'DELETE') {
      return;
    }

    setIsSubmitting(true);
    try {
      await onConfirm(permission.id);
      handleClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      opened={opened}
      title={
        <Title order={4} c="red">
          <Group gap="xs">
            <IconLock size={20} />
            {t('admin.permissions.deletePermission')}
          </Group>
        </Title>
      }
      size="md"
      onClose={handleClose}
    >
      <Stack gap="md">
        {permission ? (
          <>
            <Alert
              icon={<IconAlertTriangle size={16} />}
              color="red"
              variant="light"
            >
              {t('admin.permissions.deleteWarning')}
            </Alert>

            <Paper p="sm" bg={isDarkMode ? 'dark.6' : 'gray.1'} radius="sm">
              <Stack gap="xs">
                <Group gap="xs">
                  <IconCode size={16} color="var(--mantine-color-red-6)" />
                  <Text size="sm" fw={500} c="red">
                    {permission.resource}.{permission.action}
                  </Text>
                </Group>
                <Text size="sm">{permission.description}</Text>
              </Stack>
            </Paper>

            <TextInput
              required
              data-autofocus
              label={t('admin.permissions.typeDeleteToConfirm')}
              placeholder="DELETE"
              value={confirmText}
              onChange={(e) => {
                setConfirmText(e.target.value);
              }}
            />

            <Group justify="flex-end">
              <Button
                variant="subtle"
                disabled={isSubmitting}
                onClick={handleClose}
              >
                {t('common.cancel')}
              </Button>
              <Button
                color="red"
                loading={isSubmitting}
                disabled={confirmText !== 'DELETE'}
                onClick={handleSubmit}
              >
                {t('admin.permissions.confirmDelete')}
              </Button>
            </Group>
          </>
        ) : null}
      </Stack>
    </Modal>
  );
}
