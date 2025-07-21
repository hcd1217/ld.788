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
  Title,
} from '@mantine/core';
import {useDisclosure, useMediaQuery} from '@mantine/hooks';
import {
  IconEdit,
  IconTrash,
  IconPhone,
  IconQrcode,
  IconCopy,
  IconCheck,
  IconUser,
  IconBriefcase,
  IconUsers,
  IconShieldCheck,
} from '@tabler/icons-react';
import type {Staff} from '@/services/staff';
import {useTranslation} from '@/hooks/useTranslation';
import {formatPhoneNumber} from '@/utils/string';

export interface StaffListProps {
  readonly staffs: readonly Staff[];
  readonly onEdit: (staff: Staff) => void;
  readonly onDelete: (staff: Staff) => void;
  readonly onToggleStatus: (staff: Staff) => void;
}

export function StaffList({
  staffs,
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

  const getRoleIcon = (staff: Staff) => {
    const color = staff.status === 'active' ? '#29CA42' : '#8E8E8E';
    switch (staff.role) {
      case 'admin': {
        return <IconShieldCheck color={color} size={22} />;
      }

      case 'manager': {
        return <IconUsers color={color} size={22} />;
      }

      case 'member': {
        return <IconUser color={color} size={22} />;
      }

      default: {
        return null;
      }
    }
  };

  const formatWorkingPattern = (staff: Staff) => {
    return staff.workingPattern === 'fulltime'
      ? t('staff.fulltime')
      : t('staff.shift');
  };

  const callPhone = (staff: Staff) => {
    if (isMobile) {
      window.open(`tel:${staff.phoneNumber}`);
    }
  };

  if (staffs.length === 0) {
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
              {staffs.length}{' '}
              {staffs.length === 1
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
            {staffs.map((staffMember) => (
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
                      <div style={{position: 'relative'}}>
                        <Avatar size={40} radius="xl" color="blue">
                          {staffMember.fullName.charAt(0).toUpperCase()}
                        </Avatar>
                        <div
                          style={{
                            position: 'absolute',
                            bottom: -2,
                            right: -2,
                            width: 10,
                            height: 10,
                            borderRadius: '50%',
                            backgroundColor:
                              staffMember.status === 'active'
                                ? '#29CA42'
                                : '#8E8E8E',
                            border: '2px solid white',
                          }}
                        />
                      </div>
                      <div>
                        <Text fw={600} size="sm">
                          {staffMember.fullName}
                        </Text>
                        <Badge
                          size="xs"
                          color={getRoleBadgeColor(staffMember.role)}
                          variant="light"
                          leftSection={getRoleIcon(staffMember)}
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
                    <Group
                      gap="xs"
                      c="dimmed"
                      component="a"
                      style={{
                        textDecoration: 'none',
                        color: 'inherit',
                      }}
                      onClick={() => {
                        callPhone(staffMember);
                      }}
                    >
                      <IconPhone size={22} />
                      <Text size="xs">
                        {formatPhoneNumber(staffMember.phoneNumber)}
                      </Text>
                    </Group>

                    <Group gap="xs" c="dimmed">
                      <IconBriefcase size={22} />
                      <Text size="xs">{formatWorkingPattern(staffMember)}</Text>
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
                          <IconQrcode size={22} />
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
                                <IconCheck size={22} />
                              ) : (
                                <IconCopy size={22} />
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
                        <IconTrash size={22} />
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
          title={
            <Title order={3}>
              {t('staff.qrCodeTitle', {name: selectedStaff?.fullName})}
            </Title>
          }
          onClose={closeQrModal}
        >
          {selectedStaff ? (
            <Stack gap="md" align="center">
              <Text size="sm" c="dimmed" ta="center">
                {t('staff.qrCodeDescription')}
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
                  {t('staff.clockInUrl')}
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
                      {copied ? t('staff.copied') : t('staff.copyUrl')}
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
            {staffs.length}{' '}
            {staffs.length === 1
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
                <Table.Th>{t('staff.role')}</Table.Th>
                <Table.Th>{t('staff.workingPatternLabel')}</Table.Th>
                <Table.Th>{t('staff.clockIn')}</Table.Th>
                <Table.Th>{t('staff.actions')}</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {[...staffs]
                .sort((a: Staff, b: Staff) => {
                  const a1 = a.status === 'active' ? 1 : 0;
                  const b1 = b.status === 'active' ? 1 : 0;
                  return a1 - b1;
                })
                .map((staffMember) => (
                  <Table.Tr key={staffMember.id}>
                    <Table.Td>
                      <Group gap="sm">
                        {getRoleIcon(staffMember)}
                        <Text fw={600} size="sm">
                          {staffMember.fullName}
                        </Text>
                      </Group>
                    </Table.Td>

                    <Table.Td>
                      {staffMember.phoneNumber ? (
                        <Group
                          gap="xs"
                          component="a"
                          style={{
                            textDecoration: 'none',
                            color: 'inherit',
                          }}
                          onClick={() => {
                            callPhone(staffMember);
                          }}
                        >
                          <IconPhone size={12} />
                          <Text size="xs">
                            {formatPhoneNumber(staffMember.phoneNumber)}
                          </Text>
                        </Group>
                      ) : null}
                    </Table.Td>

                    <Table.Td>
                      <Group gap="xs">
                        <Badge
                          size="sm"
                          color={getRoleBadgeColor(staffMember.role)}
                          variant="light"
                        >
                          {t(`staff.${staffMember.role}`)}
                        </Badge>
                      </Group>
                    </Table.Td>

                    <Table.Td>
                      <Text size="sm">{formatWorkingPattern(staffMember)}</Text>
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
                            <IconQrcode size={22} />
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
                                  <IconCheck size={22} />
                                ) : (
                                  <IconCopy size={22} />
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
                            <IconEdit size={22} />
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
                            <IconTrash size={22} />
                          </ActionIcon>
                        </Tooltip>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
            </Table.Tbody>
          </Table>
        </ScrollArea>
      </Stack>

      {/* QR Code Modal */}
      <Modal
        centered
        opened={qrModalOpened}
        title={
          <Title order={3}>
            {t('staff.qrCodeTitle', {name: selectedStaff?.fullName})}
          </Title>
        }
        onClose={closeQrModal}
      >
        {selectedStaff ? (
          <Stack gap="md" align="center">
            <Text size="sm" c="dimmed" ta="center">
              {t('staff.qrCodeDescription')}
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
                {t('staff.clockInUrlLabel')}
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
                    {copied ? t('staff.copied') : t('staff.copyUrl')}
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
