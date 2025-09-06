import {
  Title,
  Text,
  Container,
  Button,
  Card,
  Group,
  Stack,
  Badge,
  Divider,
  Avatar,
  SimpleGrid,
  Center,
} from '@mantine/core';
import { useNavigate } from 'react-router';
import {
  IconUser,
  IconLogout,
  // IconShieldCheck,
  // IconBriefcase,
  IconIdBadge2,
  IconBuilding,
} from '@tabler/icons-react';
import { useAppStore } from '@/stores/useAppStore';
import { useTranslation } from '@/hooks/useTranslation';
import { GoBack } from '@/components/common';
import { ROUTERS } from '@/config/routeConfig';
import { renderFullName } from '@/utils/string';

export function ProfilePage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user, logout } = useAppStore();

  const handleLogout = () => {
    logout();
    navigate(ROUTERS.LOGIN);
  };

  // If no user data, show login prompt
  if (!user) {
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

  const userInitial = user.userName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase();

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
              {user.employee ? <Title order={3}>{renderFullName(user.employee)}</Title> : null}
              <Text size="sm" c="dimmed">
                {user.email ?? '-'}
              </Text>
              {user.isRoot && (
                <Badge color="red" variant="filled" size="sm">
                  {t('profile.rootUser')}
                </Badge>
              )}
            </Stack>
          </Stack>
        </Card>

        {/* Employee Information */}
        {user.employee && (
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
                    {user.employee.employeeCode}
                  </Text>
                </Group>
                {user.employee.email && (
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">
                      {t('profile.workEmail')}
                    </Text>
                    <Text size="sm" fw={500}>
                      {user.employee.email}
                    </Text>
                  </Group>
                )}
                <Group justify="space-between">
                  <Text size="sm" c="dimmed">
                    {t('profile.phone')}
                  </Text>
                  <Text size="sm" fw={500}>
                    {user.employee.phoneNumber}
                  </Text>
                </Group>
                <Group justify="space-between">
                  <Text size="sm" c="dimmed">
                    {t('profile.employmentType')}
                  </Text>
                  <Badge variant="light" size="md">
                    {user.employee.employmentType === 'FULL_TIME'
                      ? t('profile.fullTime')
                      : t('profile.partTime')}
                  </Badge>
                </Group>
              </SimpleGrid>
            </Stack>
          </Card>
        )}

        {/* Department Information */}
        {user.department && (
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
                    {user.department.name}
                  </Text>
                </Group>
                <Group justify="space-between">
                  <Text size="sm" c="dimmed">
                    {t('profile.departmentCode')}
                  </Text>
                  <Badge variant="light" size="md">
                    {user.department.code}
                  </Badge>
                </Group>
              </SimpleGrid>
            </Stack>
          </Card>
        )}

        {/* Roles & Permissions */}
        {/* {user.roles.length > 0 && (
          <Card shadow="sm" padding="lg" radius="md">
            <Stack gap="xs">
              <Group gap="xs" mb="xs">
                <IconShieldCheck size={20} stroke={1.5} />
                <Text fw={600}>{t('profile.roles')}</Text>
              </Group>
              <Divider />
              <Stack gap="xs" mt="xs">
                {user.roles.map((role) => (
                  <Group key={role.name} justify="space-between">
                    <Badge variant="light" size="md">
                      {role.name}
                    </Badge>
                    <Text size="xs" c="dimmed">
                      {t('profile.level')} {role.level}
                    </Text>
                  </Group>
                ))}
              </Stack>
            </Stack>
          </Card>
        )} */}

        {/* Actions */}
        <Stack gap="xs">
          <Center>
            <Button
              w="20rem"
              variant="light"
              mt="md"
              leftSection={<IconLogout size={20} />}
              color="red"
              onClick={handleLogout}
            >
              {t('common.logout')}
            </Button>
          </Center>
        </Stack>
      </Stack>
    </Container>
  );
}
