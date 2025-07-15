import {useState} from 'react';
import {
  Stack,
  Card,
  Group,
  Text,
  Badge,
  Button,
  ActionIcon,
  Table,
  Switch,
  Avatar,
  Tooltip,
  CopyButton,
  Code,
  Image,
  Modal,
  SimpleGrid,
  ScrollArea,
} from '@mantine/core';
import {useDisclosure, useMediaQuery} from '@mantine/hooks';
import {
  IconEdit,
  IconTrash,
  IconMail,
  IconPhone,
  IconQrcode,
  IconCopy,
  IconCheck,
  IconUser,
  IconBriefcase,
} from '@tabler/icons-react';
import type {Staff} from '@/services/staff';
import {useTranslation} from '@/hooks/useTranslation';

export interface StaffListProps {
  readonly staff: readonly Staff[];
  readonly onEdit: (staff: Staff) => void;
  readonly onDelete: (staff: Staff) => void;
  readonly onToggleStatus: (staff: Staff) => void;
}

export function StaffList({
  staff,
  onEdit,
  onDelete,
  onToggleStatus,
}: StaffListProps) {
  const {t} = useTranslation();
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [qrModalOpened, {open: openQrModal, close: closeQrModal}] =
    useDisclosure(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | undefined>(
    undefined,
  );
  const isMobile = useMediaQuery('(max-width: 768px)');

  const handleShowQrCode = (staffMember: Staff) => {
    setSelectedStaff(staffMember);
    openQrModal();
  };

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

  // Const getStatusBadgeColor = (status: Staff['status']) => {
  //   switch (status) {
  //     case 'active': {
  //       return 'green';
  //     }

  //     case 'inactive': {
  //       return 'orange';
  //     }

  //     default: {
  //       return 'gray';
  //     }
  //   }
  // };

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

  if (staff.length === 0) {
    return (
      <Card shadow="sm" padding="xl" radius="md" ta="center">
        <Stack gap="md">
          <IconUser size={48} color="var(--mantine-color-gray-5)" />
          <div>
            <Text size="lg" fw={600} c="dimmed">
              {t('staff.noStaffFound')}
            </Text>
            <Text c="dimmed" mt="xs">
              {t('staff.addFirstStaff')}
            </Text>
          </div>
        </Stack>
      </Card>
    );
  }

  // Use cards on mobile or when explicitly set
  if (isMobile || viewMode === 'cards') {
    return (
      <>
        <Stack gap="md">
          <Group justify="space-between">
            <Text size="sm" c="dimmed">
              {staff.length}{' '}
              {staff.length === 1
                ? t('staff.staffMember')
                : t('staff.staffMembers')}
            </Text>
            {!isMobile && (
              <Button
                variant="light"
                size="xs"
                onClick={() => {
                  setViewMode(viewMode === 'table' ? 'cards' : 'table');
                }}
              >
                {viewMode === 'table'
                  ? t('staff.cardView')
                  : t('staff.tableView')}
              </Button>
            )}
          </Group>

          <SimpleGrid cols={{base: 1, sm: 2, lg: 3}} spacing="md">
            {staff.map((staffMember) => (
              <Card
                key={staffMember.id}
                withBorder
                shadow="sm"
                padding="lg"
                radius="md"
              >
                <Stack gap="md">
                  <Group justify="space-between" align="flex-start">
                    <Group gap="sm">
                      <Avatar size={40} radius="xl" color="blue">
                        {staffMember.fullName.charAt(0).toUpperCase()}
                      </Avatar>
                      <div>
                        <Text fw={600} size="sm">
                          {staffMember.fullName}
                        </Text>
                        <Badge
                          size="xs"
                          color={getRoleBadgeColor(staffMember.role)}
                          variant="light"
                        >
                          {t(`staff.${staffMember.role}`)}
                        </Badge>
                      </div>
                    </Group>

                    <Group gap={4}>
                      <Switch
                        size="sm"
                        checked={staffMember.status === 'active'}
                        color={
                          staffMember.status === 'active' ? 'green' : 'orange'
                        }
                        onChange={() => {
                          onToggleStatus(staffMember);
                        }}
                      />
                    </Group>
                  </Group>

                  <Stack gap="xs">
                    <Group gap="xs" c="dimmed">
                      <IconMail size={14} />
                      <Text truncate size="xs">
                        {staffMember.email}
                      </Text>
                    </Group>

                    <Group gap="xs" c="dimmed">
                      <IconPhone size={14} />
                      <Text size="xs">{staffMember.phoneNumber}</Text>
                    </Group>

                    <Group gap="xs" c="dimmed">
                      <IconBriefcase size={14} />
                      <Text size="xs">
                        {formatWorkingPattern(staffMember)} •{' '}
                        {formatCurrency(staffMember.hourlyRate)}
                        {t('staff.perHour')}
                      </Text>
                    </Group>
                  </Stack>

                  <Group
                    justify="space-between"
                    pt="sm"
                    style={{borderTop: '1px solid var(--mantine-color-gray-3)'}}
                  >
                    <Group gap="xs">
                      <Tooltip label={t('staff.viewQrCode')}>
                        <ActionIcon
                          variant="light"
                          color="blue"
                          size="sm"
                          onClick={() => {
                            handleShowQrCode(staffMember);
                          }}
                        >
                          <IconQrcode size={14} />
                        </ActionIcon>
                      </Tooltip>

                      <CopyButton value={staffMember.clockInUrl}>
                        {({copied, copy}) => (
                          <Tooltip
                            label={
                              copied
                                ? t('staff.copied')
                                : t('staff.copyClockInUrl')
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
                      <Button
                        variant="light"
                        size="xs"
                        onClick={() => {
                          onEdit(staffMember);
                        }}
                      >
                        {t('staff.edit')}
                      </Button>
                      <ActionIcon
                        color="red"
                        variant="light"
                        size="sm"
                        onClick={() => {
                          onDelete(staffMember);
                        }}
                      >
                        <IconTrash size={14} />
                      </ActionIcon>
                    </Group>
                  </Group>
                </Stack>
              </Card>
            ))}
          </SimpleGrid>
        </Stack>

        {/* QR Code Modal */}
        <Modal
          centered
          opened={qrModalOpened}
          title={t('staff.qrCodeTitle', {name: selectedStaff?.fullName})}
          onClose={closeQrModal}
        >
          {selectedStaff ? (
            <Stack gap="md" align="center">
              <Text size="sm" c="dimmed" ta="center">
                Staff can scan this QR code to access their clock-in page
              </Text>

              {selectedStaff.clockInQrCode ? (
                <Image
                  src={selectedStaff.clockInQrCode}
                  alt="Clock-in QR Code"
                  width={200}
                  height={200}
                />
              ) : null}

              <Stack gap="xs" w="100%">
                <Text size="xs" c="dimmed">
                  Clock-in URL:
                </Text>
                <Code block>{selectedStaff.clockInUrl}</Code>

                <CopyButton value={selectedStaff.clockInUrl}>
                  {({copied, copy}) => (
                    <Button
                      fullWidth
                      leftSection={
                        copied ? (
                          <IconCheck size={16} />
                        ) : (
                          <IconCopy size={16} />
                        )
                      }
                      color={copied ? 'green' : 'blue'}
                      variant="light"
                      onClick={copy}
                    >
                      {copied ? 'Copied!' : 'Copy URL'}
                    </Button>
                  )}
                </CopyButton>
              </Stack>
            </Stack>
          ) : null}
        </Modal>
      </>
    );
  }

  // Table view for desktop
  return (
    <>
      <Stack gap="md">
        <Group justify="space-between">
          <Text size="sm" c="dimmed">
            {staff.length}{' '}
            {staff.length === 1
              ? t('staff.staffMember')
              : t('staff.staffMembers')}
          </Text>
          <Button
            variant="light"
            size="xs"
            onClick={() => {
              setViewMode('cards');
            }}
          >
            {t('staff.cardView')}
          </Button>
        </Group>

        <ScrollArea>
          <Table highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>{t('staff.staffMemberHeader')}</Table.Th>
                <Table.Th>{t('staff.contact')}</Table.Th>
                <Table.Th>{t('staff.roleStatus')}</Table.Th>
                <Table.Th>{t('staff.workingPatternLabel')}</Table.Th>
                <Table.Th>{t('staff.hourlyRate')}</Table.Th>
                <Table.Th>{t('staff.clockIn')}</Table.Th>
                <Table.Th>{t('staff.actions')}</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {staff.map((staffMember) => {
                let label = '';
                switch (staffMember.status) {
                  case 'active': {
                    label = t('staff.active');
                    break;
                  }

                  case 'inactive': {
                    label = t('staff.inactive');
                    break;
                  }

                  case 'deleted': {
                    label = t('staff.deleted');
                    break;
                  }

                  default: {
                    break;
                  }
                }

                return (
                  <Table.Tr key={staffMember.id}>
                    <Table.Td>
                      <Group gap="sm">
                        <Avatar size={32} radius="xl" color="blue">
                          {staffMember.fullName.charAt(0).toUpperCase()}
                        </Avatar>
                        <div>
                          <Text fw={600} size="sm">
                            {staffMember.fullName}
                          </Text>
                          <Text size="xs" c="dimmed">
                            {t('staff.joined')}{' '}
                            {new Date(
                              staffMember.createdAt,
                            ).toLocaleDateString()}
                          </Text>
                        </div>
                      </Group>
                    </Table.Td>

                    <Table.Td>
                      <Stack gap={2}>
                        <Group gap="xs">
                          <IconMail size={12} />
                          <Text size="xs">{staffMember.email}</Text>
                        </Group>
                        <Group gap="xs">
                          <IconPhone size={12} />
                          <Text size="xs">{staffMember.phoneNumber}</Text>
                        </Group>
                      </Stack>
                    </Table.Td>

                    <Table.Td>
                      <Stack gap="xs">
                        <Badge
                          size="sm"
                          color={getRoleBadgeColor(staffMember.role)}
                          variant="light"
                        >
                          {t(`staff.${staffMember.role}`)}
                        </Badge>
                        <Switch
                          size="sm"
                          checked={staffMember.status === 'active'}
                          color={
                            staffMember.status === 'active' ? 'green' : 'orange'
                          }
                          label={label}
                          onChange={() => {
                            onToggleStatus(staffMember);
                          }}
                        />
                      </Stack>
                    </Table.Td>

                    <Table.Td>
                      <Text size="sm">{formatWorkingPattern(staffMember)}</Text>
                    </Table.Td>

                    <Table.Td>
                      <Text size="sm" fw={600}>
                        {formatCurrency(staffMember.hourlyRate)}
                      </Text>
                    </Table.Td>

                    <Table.Td>
                      <Group gap="xs">
                        <Tooltip label={t('staff.viewQrCode')}>
                          <ActionIcon
                            variant="light"
                            color="blue"
                            size="sm"
                            onClick={() => {
                              handleShowQrCode(staffMember);
                            }}
                          >
                            <IconQrcode size={14} />
                          </ActionIcon>
                        </Tooltip>

                        <CopyButton value={staffMember.clockInUrl}>
                          {({copied, copy}) => (
                            <Tooltip
                              label={
                                copied ? t('staff.copied') : t('staff.copyUrl')
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
                    </Table.Td>

                    <Table.Td>
                      <Group gap="xs">
                        <Tooltip label={t('staff.editStaff')}>
                          <ActionIcon
                            variant="light"
                            color="blue"
                            size="sm"
                            onClick={() => {
                              onEdit(staffMember);
                            }}
                          >
                            <IconEdit size={14} />
                          </ActionIcon>
                        </Tooltip>

                        <Tooltip label={t('staff.deleteStaffTooltip')}>
                          <ActionIcon
                            variant="light"
                            color="red"
                            size="sm"
                            onClick={() => {
                              onDelete(staffMember);
                            }}
                          >
                            <IconTrash size={14} />
                          </ActionIcon>
                        </Tooltip>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                );
              })}
            </Table.Tbody>
          </Table>
        </ScrollArea>
      </Stack>

      {/* QR Code Modal */}
      <Modal
        centered
        opened={qrModalOpened}
        title={t('staff.qrCodeTitle', {name: selectedStaff?.fullName})}
        onClose={closeQrModal}
      >
        {selectedStaff ? (
          <Stack gap="md" align="center">
            <Text size="sm" c="dimmed" ta="center">
              Staff can scan this QR code to access their clock-in page
            </Text>

            {selectedStaff.clockInQrCode ? (
              <Image
                src={selectedStaff.clockInQrCode}
                alt="Clock-in QR Code"
                width={200}
                height={200}
              />
            ) : null}

            <Stack gap="xs" w="100%">
              <Text size="xs" c="dimmed">
                Clock-in URL:
              </Text>
              <Code block>{selectedStaff.clockInUrl}</Code>

              <CopyButton value={selectedStaff.clockInUrl}>
                {({copied, copy}) => (
                  <Button
                    fullWidth
                    leftSection={
                      copied ? <IconCheck size={16} /> : <IconCopy size={16} />
                    }
                    color={copied ? 'green' : 'blue'}
                    variant="light"
                    onClick={copy}
                  >
                    {copied ? 'Copied!' : 'Copy URL'}
                  </Button>
                )}
              </CopyButton>
            </Stack>
          </Stack>
        ) : null}
      </Modal>
    </>
  );
}
