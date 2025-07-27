import {
  Card,
  Group,
  Text,
  Badge,
  Button,
  ActionIcon,
  Stack,
  Avatar,
  Switch,
  Tooltip,
  CopyButton,
} from '@mantine/core';
import {
  IconTrash,
  IconMail,
  IconPhone,
  IconQrcode,
  IconCopy,
  IconCheck,
  IconBriefcase,
} from '@tabler/icons-react';
import type {Staff} from '@/services/staff';
import useTranslation from '@/hooks/useTranslation';

export interface StaffCardProps {
  readonly staff: Staff;
  readonly onEdit?: (staff: Staff) => void;
  readonly onDelete?: (staff: Staff) => void;
  readonly onToggleStatus?: (staff: Staff) => void;
  readonly onShowQrCode?: (staff: Staff) => void;
  readonly showActions?: boolean;
}

export function StaffCard({
  staff,
  onEdit,
  onDelete,
  onToggleStatus,
  onShowQrCode,
  showActions = true,
}: StaffCardProps) {
  const {t} = useTranslation();
  const getRoleBadgeColor = (role: Staff['role']) => {
    switch (role) {
      case 'admin': {
        return 'red';
      }

      case 'manager': {
        return 'blue';
      }

      case 'member': {
        return 'green';
      }

      default: {
        return 'gray';
      }
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatWorkingPattern = (staff: Staff) => {
    const pattern =
      staff.workingPattern === 'fulltime'
        ? t('staff.fulltime')
        : t('staff.shift');
    const hours =
      staff.workingPattern === 'fulltime'
        ? staff.defaultWeeklyHours || staff.weeklyContractedHours
        : staff.weeklyContractedHours;
    return `${pattern} (${t('staff.hoursPerWeek', {hours})})`;
  };

  return (
    <Card withBorder shadow="sm" padding="lg" radius="md">
      <Stack gap="md">
        <Group justify="space-between" align="flex-start">
          <Group gap="sm">
            <Avatar size={40} radius="xl" color="blue">
              {staff.fullName.charAt(0).toUpperCase()}
            </Avatar>
            <div>
              <Text fw={600} size="sm">
                {staff.fullName}
              </Text>
              <Badge
                size="xs"
                color={getRoleBadgeColor(staff.role)}
                variant="light"
              >
                {t(`staff.${staff.role}`)}
              </Badge>
            </div>
          </Group>

          {showActions && onToggleStatus ? (
            <Group gap={4}>
              <Switch
                size="sm"
                checked={staff.status === 'active'}
                color={staff.status === 'active' ? 'green' : 'orange'}
                onChange={() => {
                  onToggleStatus(staff);
                }}
              />
            </Group>
          ) : null}
        </Group>

        <Stack gap="xs">
          <Group gap="xs" c="dimmed">
            <IconMail size={14} />
            <Text truncate size="xs">
              {staff.email}
            </Text>
          </Group>

          <Group gap="xs" c="dimmed">
            <IconPhone size={14} />
            <Text size="xs">{staff.phoneNumber}</Text>
          </Group>

          <Group gap="xs" c="dimmed">
            <IconBriefcase size={14} />
            <Text size="xs">
              {formatWorkingPattern(staff)} • {formatCurrency(staff.hourlyRate)}
              {t('staff.perHour')}
            </Text>
          </Group>
        </Stack>

        {showActions ? (
          <Group
            justify="space-between"
            pt="sm"
            style={{borderTop: '1px solid var(--mantine-color-gray-3)'}}
          >
            <Group gap="xs">
              {onShowQrCode ? (
                <Tooltip label={t('staff.viewQrCode')}>
                  <ActionIcon
                    variant="light"
                    color="blue"
                    size="sm"
                    onClick={() => {
                      onShowQrCode(staff);
                    }}
                  >
                    <IconQrcode size={14} />
                  </ActionIcon>
                </Tooltip>
              ) : null}

              <CopyButton value={staff.clockInUrl}>
                {({copied, copy}) => (
                  <Tooltip
                    label={
                      copied ? t('staff.copied') : t('staff.copyClockInUrl')
                    }
                  >
                    <ActionIcon
                      variant="light"
                      color={copied ? 'green' : 'gray'}
                      size="sm"
                      onClick={copy}
                    >
                      {copied ? (
                        <IconCheck size={14} />
                      ) : (
                        <IconCopy size={14} />
                      )}
                    </ActionIcon>
                  </Tooltip>
                )}
              </CopyButton>
            </Group>

            <Group gap="xs">
              {onEdit ? (
                <Button
                  variant="light"
                  size="xs"
                  onClick={() => {
                    onEdit(staff);
                  }}
                >
                  {t('staff.edit')}
                </Button>
              ) : null}
              {onDelete ? (
                <ActionIcon
                  color="red"
                  variant="light"
                  size="sm"
                  onClick={() => {
                    onDelete(staff);
                  }}
                >
                  <IconTrash size={14} />
                </ActionIcon>
              ) : null}
            </Group>
          </Group>
        ) : null}
      </Stack>
    </Card>
  );
}
