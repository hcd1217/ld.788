import {
  Card,
  Stack,
  Group,
  Title,
  Button,
  Divider,
  Grid,
  Text,
  Badge,
  Tooltip,
  Modal,
  Image,
  Code,
  CopyButton,
} from '@mantine/core';
import {IconEdit, IconMail, IconCopy, IconCheck} from '@tabler/icons-react';
import {useDisclosure} from '@mantine/hooks';
import {useState, useEffect} from 'react';
import {useTranslation} from '@/hooks/useTranslation';
import {useAction} from '@/hooks/useAction';
import type {Employee} from '@/services/hr/employee';
import {renderFullName, formatDate} from '@/utils/string';
import {userService} from '@/services/user/user';
import {generateQRCodeWithLogo} from '@/utils/qr';
import {useClientCode} from '@/hooks/useClientCode';

type EmployeeBasicInfoCardProps = {
  readonly employee: Employee;
  readonly onEdit?: () => void;
};

export function EmployeeBasicInfoCard({
  employee,
  onEdit,
}: EmployeeBasicInfoCardProps) {
  const {t} = useTranslation();
  const [opened, {open, close}] = useDisclosure(false);
  const clientCode = useClientCode();
  const [magicLink, setMagicLink] = useState<string>('');
  const [qrCodeData, setQrCodeData] = useState<string>('');

  // Generate QR code when magic link changes
  useEffect(() => {
    if (magicLink) {
      generateQRCodeWithLogo(magicLink)
        .then((dataUrl) => {
          setQrCodeData(dataUrl);
        })
        .catch((error) => {
          console.error('Error generating QR code:', error);
        });
    }
  }, [magicLink]);

  const handleGetMagicLink = useAction({
    options: {
      successTitle: t('common.success'),
      successMessage: t('employee.magicLinkGenerated'),
      errorTitle: t('common.error'),
      errorMessage: t('employee.magicLinkFailed'),
    },
    async actionHandler() {
      if (!employee.userId) {
        throw new Error('No user ID available');
      }

      console.log('employee.userId', employee.userId, employee);
      const link = await userService.getLoginMagicLink(
        employee.userId,
        clientCode,
      );
      setMagicLink(link);
      open();
    },
  });

  return (
    <>
      <Card shadow="sm" padding="xl" radius="md">
        <Stack gap="lg">
          <Group justify="space-between" align="flex-start">
            <Title order={3}>{t('employee.basicInformation')}</Title>
            <Group gap="xs">
              {employee.userId ? (
                <Tooltip label={t('employee.getMagicLink')}>
                  <Button
                    leftSection={<IconMail size={16} />}
                    variant="subtle"
                    onClick={() => handleGetMagicLink()}
                  >
                    {t('employee.magicLink')}
                  </Button>
                </Tooltip>
              ) : null}
              <Button
                leftSection={<IconEdit size={16} />}
                variant="subtle"
                onClick={onEdit}
              >
                {t('common.edit')}
              </Button>
            </Group>
          </Group>

          <Divider />

          <Grid>
            <Grid.Col span={{base: 6}}>
              <Stack gap="xs">
                <Text c="dimmed" size="sm">
                  {t('employee.name')}
                </Text>
                <Text fw={500}>{renderFullName(employee)}</Text>
              </Stack>
            </Grid.Col>

            <Grid.Col span={{base: 6}}>
              <Stack gap="xs">
                <Text c="dimmed" size="sm">
                  {t('employee.employeeCode')}
                </Text>
                <Text fw={500}>
                  {employee.employeeCode.toLocaleUpperCase()}
                </Text>
              </Stack>
            </Grid.Col>

            <Grid.Col span={{base: 6}}>
              <Stack gap="xs">
                <Text c="dimmed" size="sm">
                  {t('employee.unit')}
                </Text>
                <Text fw={500}>{employee.unit ?? '-'}</Text>
              </Stack>
            </Grid.Col>

            <Grid.Col span={{base: 6}}>
              <Stack gap="xs">
                <Text c="dimmed" size="sm">
                  {t('employee.status')}
                </Text>
                <Badge
                  color={employee.isActive ? 'green' : 'gray'}
                  variant="light"
                  size="lg"
                >
                  {employee.isActive
                    ? t('employee.active')
                    : t('employee.inactive')}
                </Badge>
              </Stack>
            </Grid.Col>

            <Grid.Col span={{base: 6}} visibleFrom="sm">
              <Stack gap="xs">
                <Text c="dimmed" size="sm">
                  {t('common.createdAt')}
                </Text>
                <Text fw={500}>
                  {formatDate(employee.createdAt.toString())}
                </Text>
              </Stack>
            </Grid.Col>

            <Grid.Col span={{base: 6}} visibleFrom="sm">
              <Stack gap="xs">
                <Text c="dimmed" size="sm">
                  {t('common.updatedAt')}
                </Text>
                <Text fw={500}>
                  {formatDate(employee.updatedAt.toString())}
                </Text>
              </Stack>
            </Grid.Col>
          </Grid>
        </Stack>
      </Card>

      {/* Magic Link Modal */}
      <Modal
        centered
        opened={opened}
        title={
          <Title order={3}>
            {t('employee.magicLinkTitle', {name: renderFullName(employee)})}
          </Title>
        }
        onClose={close}
      >
        <Stack gap="md" align="center">
          <Text size="sm" c="dimmed" ta="center">
            {t('employee.magicLinkDescription')}
          </Text>

          {qrCodeData ? (
            <Image src={qrCodeData} alt={t('employee.magicLinkQrAlt')} />
          ) : null}

          <Stack gap="xs" w="100%">
            <Text size="xs" c="dimmed">
              {t('employee.magicLinkUrl')}
            </Text>
            <Code block>{magicLink}</Code>

            <CopyButton value={magicLink}>
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
                  {copied ? t('common.copied') : t('employee.copyMagicLink')}
                </Button>
              )}
            </CopyButton>
          </Stack>
        </Stack>
      </Modal>
    </>
  );
}
