import {
  Title,
  Text,
  Container,
  Card,
  Stack,
  Group,
  Button,
  Divider,
  rem,
  Box,
} from '@mantine/core';
import {
  IconHome,
  IconSearch,
  IconBell,
  IconUser,
  IconBugOff,
  IconExternalLink,
  IconInfoCircle,
  IconLogout,
  IconUserPlus,
  IconBuildingStore,
  IconUsersGroup,
} from '@tabler/icons-react';
import {Navigate, useNavigate} from 'react-router';
import useTranslation from '@/hooks/useTranslation';
import {useAppStore} from '@/stores/useAppStore';
import useIsDarkMode from '@/hooks/useIsDarkMode';
import {isDevelopment} from '@/utils/env';

export function MorePage() {
  const navigate = useNavigate();
  const {t} = useTranslation();
  const {user, logout} = useAppStore();
  const isDarkMode = useIsDarkMode();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = [
    {
      title: t('common.dashboard'),
      description: 'Main dashboard overview',
      icon: IconHome,
      onClick: () => navigate('/home'),
      color: 'blue',
    },
    {
      title: 'Store Management',
      description: 'Manage your stores and locations',
      icon: IconBuildingStore,
      onClick: () => navigate('/stores'),
      color: 'indigo',
    },
    {
      title: 'Staff Management',
      description: 'Manage staff members and permissions',
      icon: IconUsersGroup,
      onClick: () => navigate('/staff'),
      color: 'violet',
    },
    {
      title: t('common.explore'),
      description: 'Discover new content',
      icon: IconSearch,
      onClick: () => navigate('/explore'),
      color: 'teal',
    },
    {
      title: t('common.notifications'),
      description: 'Your notifications and alerts',
      icon: IconBell,
      onClick: () => navigate('/notifications'),
      color: 'orange',
    },
    {
      title: t('common.profile'),
      description: 'Manage your profile',
      icon: IconUser,
      onClick: () => navigate('/profile'),
      color: 'grape',
    },
  ];

  const utilityItems = [
    {
      title: t('common.addUser'),
      description: 'Add new users to the system',
      icon: IconUserPlus,
      onClick: () => navigate('/add-user'),
      color: 'blue',
      hidden: !user?.isRoot,
    },
    {
      title: 'Error Testing',
      description: 'Test error handling (Dev only)',
      icon: IconBugOff,
      onClick: () => navigate('/sample/errors'),
      color: 'red',
      devOnly: true,
    },
    {
      title: t('common.about'),
      description: 'About this application',
      icon: IconInfoCircle,
      onClick: () => navigate('/'),
      color: 'cyan',
    },
  ].filter((item) => !item.hidden);

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <Container fluid mt="xl">
      <Stack gap="xl">
        <Box
          style={{
            display: 'flex',
            justifyContent: 'center',
            width: '100%',
            padding: '0 16px',
          }}
        >
          <Box style={{maxWidth: '600px', width: '100%'}}>
            <Card shadow="sm" padding="lg" radius="md">
              <Title order={1} mb="lg">
                {t('common.more')}
              </Title>

              <Card
                withBorder
                p="md"
                mb="lg"
                bg={isDarkMode ? 'dark.6' : 'gray.0'}
              >
                <Group>
                  <IconUser size={20} />
                  <div>
                    <Text fw={500}>{user.email}</Text>
                    <Text size="sm" c="dimmed">
                      {t('common.account')}
                    </Text>
                  </div>
                </Group>
              </Card>

              <Stack gap="md">
                <div>
                  <Text fw={600} mb="sm">
                    Navigation
                  </Text>
                  <Stack gap="xs">
                    {menuItems.map((item) => (
                      <Card
                        key={item.title}
                        withBorder
                        p="md"
                        style={{cursor: 'pointer'}}
                        onClick={item.onClick}
                      >
                        <Group justify="space-between">
                          <Group gap="sm">
                            <item.icon
                              size={20}
                              style={{
                                color: `var(--mantine-color-${item.color}-6)`,
                              }}
                            />
                            <div>
                              <Text fw={500}>{item.title}</Text>
                              <Text size="sm" c="dimmed">
                                {item.description}
                              </Text>
                            </div>
                          </Group>
                          <IconExternalLink
                            size={16}
                            style={{color: 'var(--mantine-color-gray-5)'}}
                          />
                        </Group>
                      </Card>
                    ))}
                  </Stack>
                </div>

                <Divider />

                <div>
                  <Text fw={600} mb="sm">
                    Utilities
                  </Text>
                  <Stack gap="xs">
                    {utilityItems
                      .filter((item) => !item.devOnly || isDevelopment)
                      .map((item) => (
                        <Card
                          key={item.title}
                          withBorder
                          p="md"
                          style={{cursor: 'pointer'}}
                          onClick={item.onClick}
                        >
                          <Group justify="space-between">
                            <Group gap="sm">
                              <item.icon
                                size={20}
                                style={{
                                  color: `var(--mantine-color-${item.color}-6)`,
                                }}
                              />
                              <div>
                                <Text fw={500}>{item.title}</Text>
                                <Text size="sm" c="dimmed">
                                  {item.description}
                                </Text>
                              </div>
                            </Group>
                            <IconExternalLink
                              size={16}
                              style={{color: 'var(--mantine-color-gray-5)'}}
                            />
                          </Group>
                        </Card>
                      ))}
                  </Stack>
                </div>

                <Divider />
                <Button
                  fullWidth
                  color="red"
                  variant="light"
                  onClick={handleLogout}
                >
                  <IconLogout size={rem(16)} />
                  <Text ml="xs">{t('common.logout')}</Text>
                </Button>
              </Stack>
            </Card>
          </Box>
        </Box>
      </Stack>
    </Container>
  );
}
