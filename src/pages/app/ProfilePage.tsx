import {
  Title,
  Text,
  Container,
  Button,
  Card,
  Group,
  Box,
  Stack,
  Badge,
  Alert,
  LoadingOverlay,
  Transition,
} from '@mantine/core';
import {useNavigate} from 'react-router';
import {useState} from 'react';
import {IconAlertCircle} from '@tabler/icons-react';
import {useAppStore} from '@/stores/useAppStore';
import {useTranslation} from '@/hooks/useTranslation';
import {authApi, type GetMeResponse} from '@/lib/api';
import {GoBack} from '@/components/common';
import {ROUTERS} from '@/config/routeConfig';
import {useOnce} from '@/hooks/useOnce';

export function ProfilePage() {
  const navigate = useNavigate();
  const {t} = useTranslation();
  const {isAuthenticated, logout} = useAppStore();
  const [userData, setUserData] = useState<GetMeResponse | undefined>(
    undefined,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | undefined>(undefined);
  const [showAlert, setShowAlert] = useState(false);

  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      setError(undefined);
      const response = await authApi.getMe();
      setUserData(response);
    } catch {
      setError(t('profile.fetchError'));
      setShowAlert(true);
    } finally {
      setIsLoading(false);
    }
  };

  useOnce(() => {
    fetchUserData();
  });

  const handleLogout = () => {
    logout();
    navigate(ROUTERS.ROOT);
  };

  if (!isAuthenticated) {
    return (
      <Container size="md" mt="xl">
        <Card shadow="sm" padding="lg">
          <Title order={2}>{t('profile.notLoggedIn')}</Title>
          <Text mt="md">{t('profile.pleaseLogin')}</Text>
          <Button mt="md" onClick={() => navigate(ROUTERS.ROOT)}>
            {t('common.goToHome')}
          </Button>
        </Card>
      </Container>
    );
  }

  return (
    <Container size="md" mt="xl">
      <Stack gap="xl">
        <Group justify="space-between">
          <GoBack />
          <Button color="red" onClick={handleLogout}>
            {t('common.logout')}
          </Button>
        </Group>

        <Title order={1} ta="center">
          {t('profile.title')}
        </Title>

        <Box pos="relative">
          <LoadingOverlay
            visible={isLoading}
            overlayProps={{blur: 2}}
            transitionProps={{duration: 300}}
          />

          <Transition
            mounted={showAlert ? Boolean(error) : false}
            transition="fade"
          >
            {(styles) => (
              <Alert
                withCloseButton
                style={styles}
                icon={<IconAlertCircle size={16} />}
                color="red"
                variant="light"
                mb="md"
                onClose={() => {
                  setShowAlert(false);
                }}
              >
                {error}
              </Alert>
            )}
          </Transition>

          {userData ? (
            <Stack gap="lg">
              {/* Basic Information */}
              <Card shadow="sm" padding="xl" radius="md">
                <Title order={3} mb="md">
                  {t('profile.basicInfo')}
                </Title>
                <Stack gap="sm">
                  <Group>
                    <Text fw={500}>{t('profile.email')}:</Text>
                    <Text>{userData.email}</Text>
                  </Group>
                  <Group>
                    <Text fw={500}>{t('profile.username')}:</Text>
                    <Text>{userData.userName || t('common.notSet')}</Text>
                  </Group>
                  <Group>
                    <Text fw={500}>{t('profile.clientCode')}:</Text>
                    <Badge variant="light">{userData.clientCode}</Badge>
                  </Group>
                  {userData.isRoot ? (
                    <Badge color="red" variant="filled">
                      {t('profile.rootUser')}
                    </Badge>
                  ) : null}
                </Stack>
              </Card>

              {/* Roles Section */}
              <Card shadow="sm" padding="xl" radius="md">
                <Title order={3} mb="md">
                  {t('profile.roles')}
                </Title>
                <Stack gap="sm">
                  {userData.roles.map((role) => (
                    <Group key={role.id} justify="space-between">
                      <Badge size="lg" variant="light">
                        {role.name}
                      </Badge>
                      <Text size="sm" c="dimmed">
                        {t('profile.level')}: {role.level}
                      </Text>
                    </Group>
                  ))}
                </Stack>
              </Card>
            </Stack>
          ) : null}
        </Box>
      </Stack>
    </Container>
  );
}
