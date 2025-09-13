import { useEffect, useState } from 'react';

import { Button, Card, Divider, Grid, Group, Stack, Text, Title, Tooltip } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconEdit, IconQrcode } from '@tabler/icons-react';

import { ActiveBadge } from '@/components/common/ui';
import { useClientCode } from '@/hooks/useClientCode';
import { useSimpleSWRAction } from '@/hooks/useSWRAction';
import { useTranslation } from '@/hooks/useTranslation';
import type { Employee } from '@/services/hr/employee';
import { userService } from '@/services/user/user';
import { useClientConfig } from '@/stores/useAppStore';
import { logError } from '@/utils/logger';
import { generateQRCodeWithLogo } from '@/utils/qr';
import { formatCurrency, formatDate, renderFullName } from '@/utils/string';

import { EmployeeMagicLinkModal } from './EmployeeMagicLinkModal';
import { WorkTypeBadge } from './WorkTypeBadge';

type EmployeeBasicInfoCardProps = {
  readonly employee: Employee;
  readonly onEdit?: () => void;
  readonly canEdit: boolean;
};

export function EmployeeBasicInfoCard({ employee, canEdit, onEdit }: EmployeeBasicInfoCardProps) {
  const { t } = useTranslation();
  const [opened, { open, close }] = useDisclosure(false);
  const clientCode = useClientCode();
  const clientConfig = useClientConfig();
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
          logError('Error generating QR code:', error, {
            module: 'EmployeeBasicInfoCard',
            action: 'clientCode',
          });
        });
    }
  }, [magicLink]);

  const getMagicLinkAction = useSimpleSWRAction(
    `get-magic-link-${employee.id}`,
    async () => {
      if (!employee.userId) {
        throw new Error('No user ID available');
      }

      const link = await userService.getLoginMagicLink(employee.userId, clientCode);
      return link;
    },
    {
      notifications: {
        successTitle: t('common.success'),
        successMessage: t('employee.magicLinkGenerated'),
        errorTitle: t('common.errors.notificationTitle'),
        errorMessage: t('employee.magicLinkFailed'),
      },
      onSuccess: (link) => {
        setMagicLink(link);
        open();
      },
    },
  );

  return (
    <>
      <Card shadow="sm" p={{ base: 'sm', md: 'xl' }} radius="md">
        <Stack gap="lg">
          <Group justify="space-between" align="flex-start">
            <Title visibleFrom="md" order={3}>
              {t('employee.basicInformation')}
            </Title>
            <Group gap="xs">
              {employee.userId && employee.isActive ? (
                <Tooltip label={t('employee.getMagicLink')}>
                  <Button
                    leftSection={<IconQrcode size={16} />}
                    variant="subtle"
                    onClick={() => {
                      getMagicLinkAction.trigger();
                    }}
                    disabled={!employee.isActive || !canEdit}
                  >
                    {t('employee.magicLink')}
                  </Button>
                </Tooltip>
              ) : null}
              <Button
                leftSection={<IconEdit size={16} />}
                variant="subtle"
                onClick={onEdit}
                disabled={!employee.isActive || !canEdit}
              >
                {t('common.edit')}
              </Button>
            </Group>
          </Group>

          <Divider />

          <Grid>
            <Grid.Col span={{ base: 6 }}>
              <Stack gap="xs">
                <Text c="dimmed" size="sm">
                  {t('employee.name')}
                </Text>
                <Text fw={500}>{renderFullName(employee)}</Text>
              </Stack>
            </Grid.Col>

            <Grid.Col span={{ base: 6 }}>
              <Stack gap="xs">
                <Text c="dimmed" size="sm">
                  {t('employee.employeeCode')}
                </Text>
                <Text fw={500}>{employee.employeeCode.toLocaleUpperCase()}</Text>
              </Stack>
            </Grid.Col>

            <Grid.Col span={{ base: 6 }}>
              <Stack gap="xs">
                <Text c="dimmed" size="sm">
                  {t('employee.unit')}
                </Text>
                <Text fw={500}>{employee.unit ?? '-'}</Text>
              </Stack>
            </Grid.Col>

            <Grid.Col span={{ base: 6 }}>
              <Stack gap="xs">
                <Text c="dimmed" size="sm">
                  {t('employee.status')}
                </Text>
                <ActiveBadge isActive={employee.isActive} />
              </Stack>
            </Grid.Col>

            {employee.email ? (
              <Grid.Col span={{ base: 6 }}>
                <Stack gap="xs">
                  <Text c="dimmed" size="sm">
                    {t('common.form.email')}
                  </Text>
                  <Text fw={500}>{employee.email}</Text>
                </Stack>
              </Grid.Col>
            ) : null}

            {employee.phone ? (
              <Grid.Col span={{ base: 6 }}>
                <Stack gap="xs">
                  <Text c="dimmed" size="sm">
                    {t('employee.phone')}
                  </Text>
                  <Text fw={500}>{employee.phone}</Text>
                </Stack>
              </Grid.Col>
            ) : null}
            {clientConfig.features?.employee?.workType ? (
              <>
                {employee.workType ? (
                  <Grid.Col span={{ base: 6 }}>
                    <Stack gap="xs">
                      <Text c="dimmed" size="sm">
                        {t('employee.workType')}
                      </Text>
                      <WorkTypeBadge workType={employee.workType} />
                    </Stack>
                  </Grid.Col>
                ) : null}

                {employee.startDate ? (
                  <Grid.Col span={{ base: 6 }}>
                    <Stack gap="xs">
                      <Text c="dimmed" size="sm">
                        {t('employee.startDate')}
                      </Text>
                      <Text fw={500}>{formatDate(employee.startDate.toString())}</Text>
                    </Stack>
                  </Grid.Col>
                ) : null}

                {employee.endDate ? (
                  <Grid.Col span={{ base: 6 }}>
                    <Stack gap="xs">
                      <Text c="dimmed" size="sm">
                        {t('employee.endDate')}
                      </Text>
                      <Text fw={500}>{formatDate(employee.endDate.toString())}</Text>
                    </Stack>
                  </Grid.Col>
                ) : null}

                {employee.monthlySalary ? (
                  <Grid.Col span={{ base: 6 }}>
                    <Stack gap="xs">
                      <Text c="dimmed" size="sm">
                        {t('employee.monthlySalary')}
                      </Text>
                      <Text fw={500}>{formatCurrency(employee.monthlySalary)}</Text>
                    </Stack>
                  </Grid.Col>
                ) : null}

                {employee.hourlyRate ? (
                  <Grid.Col span={{ base: 6 }}>
                    <Stack gap="xs">
                      <Text c="dimmed" size="sm">
                        {t('employee.hourlyRate')}
                      </Text>
                      <Text fw={500}>{formatCurrency(employee.hourlyRate)}</Text>
                    </Stack>
                  </Grid.Col>
                ) : null}
              </>
            ) : null}

            <Grid.Col span={{ base: 6 }} visibleFrom="sm">
              <Stack gap="xs">
                <Text c="dimmed" size="sm">
                  {t('common.createdAt')}
                </Text>
                <Text fw={500}>{formatDate(employee.createdAt.toString())}</Text>
              </Stack>
            </Grid.Col>

            <Grid.Col span={{ base: 6 }} visibleFrom="sm">
              <Stack gap="xs">
                <Text c="dimmed" size="sm">
                  {t('common.updatedAt')}
                </Text>
                <Text fw={500}>{formatDate(employee.updatedAt.toString())}</Text>
              </Stack>
            </Grid.Col>
          </Grid>
        </Stack>
      </Card>

      <EmployeeMagicLinkModal
        opened={opened}
        employee={employee}
        magicLink={magicLink}
        qrCodeData={qrCodeData}
        onClose={close}
      />
    </>
  );
}
