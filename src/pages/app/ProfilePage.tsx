import { useState } from 'react';

import { useNavigate } from 'react-router';

import {
  Avatar,
  Badge,
  Button,
  Card,
  Container,
  Divider,
  Group,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { IconBuilding, IconIdBadge2, IconLock, IconLogout, IconUser } from '@tabler/icons-react';

import { ChangePasswordModal } from '@/components/app/profile';
import { GoBack } from '@/components/common';
import { ROUTERS } from '@/config/routeConfig';
import { useDeviceType } from '@/hooks/useDeviceType';
import { useTranslation } from '@/hooks/useTranslation';
import { useLogout, useMe } from '@/stores/useAppStore';
import { renderFullName } from '@/utils/string';

export function ProfilePage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isDesktop } = useDeviceType();
  const me = useMe();
  const logout = useLogout();
  const [changePasswordModalOpened, setChangePasswordModalOpened] = useState(false);

  const handleLogout = () => {
    logout();
    navigate(ROUTERS.LOGIN);
  };

  // If no user data, show login prompt
  if (!me) {
    return (
      <Container size="xs" px="xs" mt="xl">
        <Card shadow="sm" padding="lg" radius="md">
          <Stack gap="md" ta="center">
            <IconUser size={48} stroke={1.5} />
            <Title order={3}>{t('profile.notLoggedIn')}</Title>
            <Text size="sm" c="dimmed">
              {t('profile.pleaseLogin')}
            </Text>
            <Button fullWidth onClick={() => navigate(ROUTERS.LOGIN)}>
              {t('auth.signIn')}
            </Button>
          </Stack>
        </Card>
      </Container>
    );
  }

  const userInitial = me.userName?.charAt(0).toUpperCase() || me.email?.charAt(0).toUpperCase();

  return (
    <Container fluid p="lg">
      <Stack gap="md">
        {/* Header with GoBack */}
        <Group justify="space-between">
          <GoBack />
        </Group>

        {/* Profile Header Card */}
        <Card shadow="sm" padding="lg" radius="md">
          <Stack gap="md" align="center">
            <Avatar size="xl" radius="xl" color="brand">
              {userInitial}
            </Avatar>
            <Stack gap={4} ta="center">
              {me.employee ? <Title order={3}>{renderFullName(me.employee)}</Title> : null}
              <Text size="sm" c="dimmed">
                {me.email ?? '-'}
              </Text>
              {me.isRoot && (
                <Badge color="red" variant="filled" size="sm">
                  {t('profile.rootUser')}
                </Badge>
              )}
            </Stack>
          </Stack>
        </Card>

        {/* Employee Information */}
        {me.employee && (
          <Card shadow="sm" padding="lg" radius="md">
            <Stack gap="xs">
              <Group gap="xs" mb="xs">
                <IconIdBadge2 size={20} stroke={1.5} />
                <Text fw={600}>{t('profile.employeeInfo')}</Text>
              </Group>
              <Divider />
              <SimpleGrid cols={1} spacing="xs" mt="xs">
                <Group justify="space-between">
                  <Text size="sm" c="dimmed">
                    {t('profile.employeeCode')}
                  </Text>
                  <Text size="sm" fw={500}>
                    {me.employee.employeeCode}
                  </Text>
                </Group>
                {me.employee.email && (
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">
                      {t('profile.workEmail')}
                    </Text>
                    <Text size="sm" fw={500}>
                      {me.employee.email}
                    </Text>
                  </Group>
                )}
                <Group justify="space-between">
                  <Text size="sm" c="dimmed">
                    {t('profile.phone')}
                  </Text>
                  <Text size="sm" fw={500}>
                    {me.employee.phoneNumber}
                  </Text>
                </Group>
                <Group justify="space-between">
                  <Text size="sm" c="dimmed">
                    {t('profile.employmentType')}
                  </Text>
                  <Badge variant="light" size="md">
                    {me.employee.employmentType === 'FULL_TIME'
                      ? t('profile.fullTime')
                      : t('profile.partTime')}
                  </Badge>
                </Group>
              </SimpleGrid>
            </Stack>
          </Card>
        )}

        {/* Department Information */}
        {me.department && (
          <Card shadow="sm" padding="lg" radius="md">
            <Stack gap="xs">
              <Group gap="xs" mb="xs">
                <IconBuilding size={20} stroke={1.5} />
                <Text fw={600}>{t('profile.departmentInfo')}</Text>
              </Group>
              <Divider />
              <SimpleGrid cols={1} spacing="xs" mt="xs">
                <Group justify="space-between">
                  <Text size="sm" c="dimmed">
                    {t('profile.departmentName')}
                  </Text>
                  <Text size="sm" fw={500}>
                    {me.department.name}
                  </Text>
                </Group>
                <Group justify="space-between">
                  <Text size="sm" c="dimmed">
                    {t('profile.departmentCode')}
                  </Text>
                  <Badge variant="light" size="md">
                    {me.department.code}
                  </Badge>
                </Group>
              </SimpleGrid>
            </Stack>
          </Card>
        )}

        {/* Actions */}
        <Stack gap="xs">
          <Group gap="xs" justify={isDesktop ? 'space-between' : 'flex-end'} wrap="nowrap">
            {/* Change Password Button - Desktop Only */}
            {isDesktop && (
              <Button
                variant="light"
                mt="md"
                leftSection={<IconLock size={20} />}
                onClick={() => setChangePasswordModalOpened(true)}
              >
                {t('profile.changePassword')}
              </Button>
            )}
            {/* Logout Button */}
            <Button
              variant="light"
              mt={isDesktop ? 'xs' : 'md'}
              leftSection={<IconLogout size={20} />}
              color="red"
              onClick={handleLogout}
            >
              {t('common.logout')}
            </Button>
          </Group>
        </Stack>
      </Stack>

      {/* Change Password Modal */}
      <ChangePasswordModal
        opened={changePasswordModalOpened}
        onClose={() => setChangePasswordModalOpened(false)}
      />
    </Container>
  );
}
