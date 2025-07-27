import {
  Container,
  Title,
  Stack,
  Card,
  Group,
  Button,
  Text,
  Grid,
  Paper,
  Badge,
} from '@mantine/core';
import {
  IconUsers,
  IconBuildingStore,
  IconSettings,
  IconActivity,
  IconLogout,
  IconShieldCheck,
  IconShieldLock,
} from '@tabler/icons-react';
import {useNavigate} from 'react-router';
import {useAppStore} from '@/stores/useAppStore';
import useTranslation from '@/hooks/useTranslation';

export function AdminDashboardPage() {
  const navigate = useNavigate();
  const {adminLogout} = useAppStore();
  const {t} = useTranslation();

  const handleLogout = () => {
    adminLogout();
    navigate('/admin/login');
  };

  const dashboardCards = [
    {
      icon: IconUsers,
      title: t('admin.dashboard.clients'),
      description: t('admin.dashboard.clientsDescription'),
      color: 'blue',
      onClick: () => navigate('/admin/clients'),
    },
    {
      icon: IconShieldLock,
      title: t('admin.dashboard.permissions'),
      description: t('admin.dashboard.permissionsDescription'),
      color: 'red',
      onClick: () => navigate('/admin/permissions'),
    },
    {
      icon: IconBuildingStore,
      title: t('admin.dashboard.stores'),
      description: t('admin.dashboard.storesDescription'),
      color: 'grape',
      onClick: () => navigate('/admin/stores'),
    },
    {
      icon: IconActivity,
      title: t('admin.dashboard.monitoring'),
      description: t('admin.dashboard.monitoringDescription'),
      color: 'green',
      onClick: () => navigate('/admin/monitoring'),
    },
    {
      icon: IconSettings,
      title: t('admin.dashboard.settings'),
      description: t('admin.dashboard.settingsDescription'),
      color: 'orange',
      onClick: () => navigate('/admin/settings'),
    },
  ];

  return (
    <Container fluid mt="xl">
      <Stack gap="xl">
        {/* Header */}
        <Container fluid px="md">
          <Group justify="space-between" align="center">
            <Group>
              <IconShieldCheck size={32} stroke={1.5} />
              <Title order={1}>{t('admin.dashboard.label')}</Title>
            </Group>
            <Button
              variant="subtle"
              color="red"
              leftSection={<IconLogout size={16} />}
              onClick={handleLogout}
            >
              {t('admin.logout')}
            </Button>
          </Group>
        </Container>

        {/* Status Bar */}
        <Container fluid px="md">
          <Paper withBorder p="md">
            <Group justify="space-between">
              <Text size="sm" c="dimmed">
                {t('admin.systemStatus')}
              </Text>
              <Badge color="green" variant="dot">
                {t('admin.operational')}
              </Badge>
            </Group>
          </Paper>
        </Container>

        {/* Dashboard Cards */}
        <Container fluid px="md">
          <Grid>
            {dashboardCards.map((card) => (
              <Grid.Col key={card.title} span={{base: 12, sm: 6, md: 3}}>
                <Card
                  withBorder
                  shadow="sm"
                  padding="lg"
                  radius="md"
                  style={{cursor: 'pointer'}}
                  h={160}
                  onClick={card.onClick}
                >
                  <Stack gap="sm">
                    <card.icon
                      size={32}
                      stroke={1.5}
                      color={`var(--mantine-color-${card.color}-6)`}
                    />
                    <Title order={4}>{card.title}</Title>
                    <Text size="sm" c="dimmed">
                      {card.description}
                    </Text>
                  </Stack>
                </Card>
              </Grid.Col>
            ))}
          </Grid>
        </Container>
      </Stack>
    </Container>
  );
}
