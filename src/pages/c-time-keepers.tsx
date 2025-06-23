import {
  Container,
  Stack,
  Title,
  Text,
  Button,
  Group,
  Box,
  BackgroundImage,
  Overlay,
  Center,
  ThemeIcon,
  SimpleGrid,
  Card,
  Badge,
  Timeline,
  List,
  Grid,
  Paper,
  RingProgress,
  Divider
} from '@mantine/core';
import {
  IconClock,
  IconCalendarStats,
  IconReportAnalytics,
  IconUsersGroup,
  IconDeviceAnalytics,
  IconBolt,
  IconShieldCheck,
  IconCloudComputing,
  IconChartBar,
  IconAlarm,
  IconHistory,
  IconTarget,
  IconTrendingUp,
  IconCheck,
  IconArrowRight
} from '@tabler/icons-react';

export default function CTimeKeepers() {
  return (
    <>
      {/* Hero Section */}
      <Box pos="relative" h={{ base: '100vh', sm: 600, md: 700 }} mih={500}>
        <BackgroundImage
          src="https://images.unsplash.com/photo-1501139083538-0139583c060f?w=1920&q=80"
          h="100%"
        >
          <Overlay
            gradient="linear-gradient(180deg, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, .7) 40%)"
            opacity={1}
            zIndex={0}
          />
          <Container size="xl" h="100%" pos="relative" style={{ zIndex: 1 }} px={{ base: 'md', sm: 'xl' }}>
            <Center h="100%">
              <Stack align="center" gap="xl" maw={800} ta="center" py={{ base: 'xl', sm: 0 }}>
                <Badge
                  size="lg"
                  variant="gradient"
                  gradient={{ from: 'blue', to: 'ocean' }}
                  leftSection={<IconClock size={16} />}
                >
                  Time Management Redefined
                </Badge>

                <Title
                  order={1}
                  fz={{ base: 32, xs: 42, sm: 58, md: 72 }}
                  fw={900}
                  c="white"
                  style={{ lineHeight: 1.1 }}
                >
                  Track Time.
                  <Text
                    component="span"
                    inherit
                    variant="gradient"
                    gradient={{ from: 'ocean', to: 'sky' }}
                  >
                    {' '}Boost Productivity.
                  </Text>
                </Title>

                <Text
                  fz={{ base: 'md', sm: 'lg', md: 'xl' }}
                  c="dimmed"
                  maw={600}
                  style={{ color: 'rgba(255, 255, 255, 0.9)' }}
                  px={{ base: 'xs', sm: 0 }}
                >
                  The intelligent time tracking solution that helps teams work smarter,
                  not harder. Get insights, automate timesheets, and maximize efficiency.
                </Text>

                <Stack gap="sm" w="100%" maw={400} mt={{ base: 'md', sm: 'xl' }}>
                  <Button
                    size="lg"
                    radius="md"
                    variant="gradient"
                    gradient={{ from: 'blue', to: 'indigo' }}
                    leftSection={<IconClock size={20} />}
                    w={{ base: '100%', sm: 'auto' }}
                  >
                    Start Tracking Free
                  </Button>
                  <Button
                    size="lg"
                    radius="md"
                    variant="white"
                    color="dark"
                    w={{ base: '100%', sm: 'auto' }}
                  >
                    See How It Works
                  </Button>
                </Stack>

                <SimpleGrid cols={{ base: 1, xs: 3 }} spacing="xl" mt="md" w="100%">
                  <Box ta="center">
                    <Text c="white" fz={{ base: 'xs', sm: 'sm' }} fw={600}>
                      <Text component="span" fz={{ base: 'lg', sm: 'xl' }} fw={800} display="block">30K+</Text>
                      Active Users
                    </Text>
                  </Box>
                  <Box ta="center">
                    <Text c="white" fz={{ base: 'xs', sm: 'sm' }} fw={600}>
                      <Text component="span" fz={{ base: 'lg', sm: 'xl' }} fw={800} display="block">5M+</Text>
                      Hours Tracked
                    </Text>
                  </Box>
                  <Box ta="center">
                    <Text c="white" fz={{ base: 'xs', sm: 'sm' }} fw={600}>
                      <Text component="span" fz={{ base: 'lg', sm: 'xl' }} fw={800} display="block">99.9%</Text>
                      Uptime
                    </Text>
                  </Box>
                </SimpleGrid>
              </Stack>
            </Center>
          </Container>
        </BackgroundImage>
      </Box>

      {/* Key Features Section */}
      <Container size="xl" py={80}>
        <Stack gap={60}>
          <Stack align="center" gap="md" ta="center">
            <Title order={2} fz={{ base: 28, sm: 36, md: 42 }} fw={800}>
              Everything You Need for Perfect Time Management
            </Title>
            <Text fz={{ base: 'md', sm: 'lg', md: 'xl' }} c="dimmed" maw={700} px={{ base: 'md', sm: 0 }}>
              From automatic time tracking to detailed analytics, C-Time Keepers provides
              all the tools your team needs to optimize productivity.
            </Text>
          </Stack>

          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="xl">
            <Card shadow="sm" padding="xl" radius="md" withBorder>
              <ThemeIcon
                size={60}
                radius="md"
                variant="gradient"
                gradient={{ from: 'indigo', to: 'purple' }}
                mb="md"
              >
                <IconAlarm size={30} />
              </ThemeIcon>
              <Text fz={{ base: 'md', sm: 'lg' }} fw={600} mb="xs">
                Automatic Time Tracking
              </Text>
              <Text size="sm" c="dimmed">
                Smart detection tracks your work automatically. No more manual
                timers or forgotten entries.
              </Text>
            </Card>

            <Card shadow="sm" padding="xl" radius="md" withBorder>
              <ThemeIcon
                size={60}
                radius="md"
                variant="gradient"
                gradient={{ from: 'purple', to: 'pink' }}
                mb="md"
              >
                <IconChartBar size={30} />
              </ThemeIcon>
              <Text fz={{ base: 'md', sm: 'lg' }} fw={600} mb="xs">
                Detailed Analytics
              </Text>
              <Text size="sm" c="dimmed">
                Visualize productivity patterns with comprehensive reports and
                actionable insights.
              </Text>
            </Card>

            <Card shadow="sm" padding="xl" radius="md" withBorder>
              <ThemeIcon
                size={60}
                radius="md"
                variant="gradient"
                gradient={{ from: 'sky', to: 'blue' }}
                mb="md"
              >
                <IconUsersGroup size={30} />
              </ThemeIcon>
              <Text fz={{ base: 'md', sm: 'lg' }} fw={600} mb="xs">
                Team Collaboration
              </Text>
              <Text size="sm" c="dimmed">
                Share timesheets, manage projects together, and keep everyone
                aligned on goals.
              </Text>
            </Card>

            <Card shadow="sm" padding="xl" radius="md" withBorder>
              <ThemeIcon
                size={60}
                radius="md"
                variant="gradient"
                gradient={{ from: 'indigo', to: 'ocean' }}
                mb="md"
              >
                <IconCalendarStats size={30} />
              </ThemeIcon>
              <Text fz={{ base: 'md', sm: 'lg' }} fw={600} mb="xs">
                Smart Scheduling
              </Text>
              <Text size="sm" c="dimmed">
                AI-powered scheduling suggests optimal work blocks based on
                your productivity patterns.
              </Text>
            </Card>

            <Card shadow="sm" padding="xl" radius="md" withBorder>
              <ThemeIcon
                size={60}
                radius="md"
                variant="gradient"
                gradient={{ from: 'blue', to: 'sky' }}
                mb="md"
              >
                <IconDeviceAnalytics size={30} />
              </ThemeIcon>
              <Text fz={{ base: 'md', sm: 'lg' }} fw={600} mb="xs">
                Cross-Platform Sync
              </Text>
              <Text size="sm" c="dimmed">
                Track time seamlessly across desktop, mobile, and web. Your
                data follows you everywhere.
              </Text>
            </Card>

            <Card shadow="sm" padding="xl" radius="md" withBorder>
              <ThemeIcon
                size={60}
                radius="md"
                variant="gradient"
                gradient={{ from: 'blue', to: 'indigo' }}
                mb="md"
              >
                <IconShieldCheck size={30} />
              </ThemeIcon>
              <Text fz={{ base: 'md', sm: 'lg' }} fw={600} mb="xs">
                Privacy First
              </Text>
              <Text size="sm" c="dimmed">
                Your data is encrypted and secure. Control exactly what's
                tracked and who sees it.
              </Text>
            </Card>
          </SimpleGrid>
        </Stack>
      </Container>

      {/* How It Works Section */}
      <Box bg="blue.0" py={80}>
        <Container size="xl">
          <Stack gap={60}>
            <Stack align="center" gap="md" ta="center">
              <Title order={2} fz={{ base: 28, sm: 36, md: 42 }} fw={800}>
                How C-Time Keepers Works
              </Title>
              <Text fz={{ base: 'md', sm: 'lg', md: 'xl' }} c="dimmed" maw={600} px={{ base: 'md', sm: 0 }}>
                Get started in minutes and see immediate improvements in your productivity
              </Text>
            </Stack>

            <Grid gutter={60} align="center">
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Timeline active={3} bulletSize={40} lineWidth={3}>
                  <Timeline.Item
                    bullet={<IconClock size={20} />}
                    title="Install & Connect"
                  >
                    <Text c="dimmed" size="sm" mt="sm">
                      Download our app and connect your favorite tools. Works with
                      100+ popular apps and services.
                    </Text>
                  </Timeline.Item>

                  <Timeline.Item
                    bullet={<IconTarget size={20} />}
                    title="Set Your Goals"
                  >
                    <Text c="dimmed" size="sm" mt="sm">
                      Define projects, set time budgets, and customize tracking
                      rules to match your workflow.
                    </Text>
                  </Timeline.Item>

                  <Timeline.Item
                    bullet={<IconBolt size={20} />}
                    title="Track Automatically"
                  >
                    <Text c="dimmed" size="sm" mt="sm">
                      Our AI learns your patterns and tracks time automatically.
                      Focus on work, not timers.
                    </Text>
                  </Timeline.Item>

                  <Timeline.Item
                    bullet={<IconReportAnalytics size={20} />}
                    title="Analyze & Improve"
                  >
                    <Text c="dimmed" size="sm" mt="sm">
                      Get weekly insights, identify time drains, and optimize
                      your schedule for maximum productivity.
                    </Text>
                  </Timeline.Item>
                </Timeline>
              </Grid.Col>

              <Grid.Col span={{ base: 12, md: 6 }}>
                <Stack gap="md">
                  <Paper shadow="md" p="xl" radius="md" withBorder>
                    <Group align="center" mb="md" wrap="wrap">
                      <RingProgress
                        size={80}
                        thickness={8}
                        roundCaps
                        sections={[
                          { value: 35, color: 'blue' },
                          { value: 25, color: 'ocean' },
                          { value: 20, color: 'sky' },
                          { value: 20, color: 'indigo' },
                        ]}
                      />
                      <Box ta={{ base: 'center', sm: 'left' }}>
                        <Text fz={{ base: 'md', sm: 'lg' }} fw={700}>Your Productivity Breakdown</Text>
                        <Text fz={{ base: 'xs', sm: 'sm' }} c="dimmed" mt={4}>Real-time activity tracking</Text>
                      </Box>
                    </Group>
                    <Divider my="md" />
                    <Stack gap="xs">
                      <Group justify="space-between">
                        <Group gap="xs">
                          <Box w={{ base: 10, sm: 12 }} h={{ base: 10, sm: 12 }} bg="blue" style={{ borderRadius: 2 }} />
                          <Text size="sm">Deep Work</Text>
                        </Group>
                        <Text size="sm" fw={600}>35%</Text>
                      </Group>
                      <Group justify="space-between">
                        <Group gap="xs">
                          <Box w={{ base: 10, sm: 12 }} h={{ base: 10, sm: 12 }} bg="ocean" style={{ borderRadius: 2 }} />
                          <Text size="sm">Meetings</Text>
                        </Group>
                        <Text size="sm" fw={600}>25%</Text>
                      </Group>
                      <Group justify="space-between">
                        <Group gap="xs">
                          <Box w={{ base: 10, sm: 12 }} h={{ base: 10, sm: 12 }} bg="sky" style={{ borderRadius: 2 }} />
                          <Text size="sm">Communication</Text>
                        </Group>
                        <Text size="sm" fw={600}>20%</Text>
                      </Group>
                      <Group justify="space-between">
                        <Group gap="xs">
                          <Box w={{ base: 10, sm: 12 }} h={{ base: 10, sm: 12 }} bg="indigo" style={{ borderRadius: 2 }} />
                          <Text size="sm">Breaks</Text>
                        </Group>
                        <Text size="sm" fw={600}>20%</Text>
                      </Group>
                    </Stack>
                  </Paper>

                  <Button
                    size="lg"
                    fullWidth
                    variant="gradient"
                    gradient={{ from: 'blue', to: 'indigo' }}
                    rightSection={<IconArrowRight size={20} />}
                  >
                    View Live Demo
                  </Button>
                </Stack>
              </Grid.Col>
            </Grid>
          </Stack>
        </Container>
      </Box>

      {/* Benefits Section */}
      <Container size="xl" py={80}>
        <Grid gutter={{ base: 'xl', sm: 40, md: 60 }} align="center">
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Stack gap="xl">
              <Box>
                <Badge
                  variant="gradient"
                  gradient={{ from: 'ocean', to: 'sky' }}
                  mb="md"
                >
                  Benefits
                </Badge>
                <Title order={2} size={36} fw={800} mb="md">
                  Save 2+ Hours Every Day
                </Title>
                <Text size="lg" c="dimmed">
                  Our users report significant time savings and productivity gains
                  within the first week of using C-Time Keepers.
                </Text>
              </Box>

              <List
                spacing="md"
                size="md"
                icon={
                  <ThemeIcon color="blue" size={24} radius="xl">
                    <IconCheck size={16} />
                  </ThemeIcon>
                }
              >
                <List.Item>
                  <Text fw={600} fz={{ base: 'sm', sm: 'md' }}>Eliminate Time Tracking Overhead</Text>
                  <Text fz={{ base: 'xs', sm: 'sm' }} c="dimmed" mt={4}>
                    Automatic tracking means no more manual timers or forgotten entries
                  </Text>
                </List.Item>
                <List.Item>
                  <Text fw={600} fz={{ base: 'sm', sm: 'md' }}>Identify and Eliminate Time Wasters</Text>
                  <Text fz={{ base: 'xs', sm: 'sm' }} c="dimmed" mt={4}>
                    AI-powered insights reveal where your time really goes
                  </Text>
                </List.Item>
                <List.Item>
                  <Text fw={600} fz={{ base: 'sm', sm: 'md' }}>Improve Work-Life Balance</Text>
                  <Text fz={{ base: 'xs', sm: 'sm' }} c="dimmed" mt={4}>
                    Set boundaries and get alerts when it's time to disconnect
                  </Text>
                </List.Item>
                <List.Item>
                  <Text fw={600} fz={{ base: 'sm', sm: 'md' }}>Accurate Client Billing</Text>
                  <Text fz={{ base: 'xs', sm: 'sm' }} c="dimmed" mt={4}>
                    Never lose billable hours with precise, automatic time tracking
                  </Text>
                </List.Item>
              </List>
            </Stack>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 6 }}>
            <Stack gap="md">
              <Card shadow="lg" p="xl" radius="md" bg="blue.0">
                <Group align="flex-start">
                  <ThemeIcon size={50} radius="md" color="blue">
                    <IconTrendingUp size={26} />
                  </ThemeIcon>
                  <Box style={{ flex: 1 }}>
                    <Text fz={{ base: 'lg', sm: 'xl' }} fw={700} mb="xs">
                      32% Productivity Increase
                    </Text>
                    <Text c="dimmed">
                      Average improvement reported by teams after 30 days
                    </Text>
                  </Box>
                </Group>
              </Card>

              <Card shadow="lg" p="xl" radius="md" bg="ocean.0">
                <Group align="flex-start">
                  <ThemeIcon size={50} radius="md" color="ocean">
                    <IconHistory size={26} />
                  </ThemeIcon>
                  <Box style={{ flex: 1 }}>
                    <Text fz={{ base: 'lg', sm: 'xl' }} fw={700} mb="xs">
                      15 Minutes Saved Per Day
                    </Text>
                    <Text c="dimmed">
                      On manual time tracking and timesheet management
                    </Text>
                  </Box>
                </Group>
              </Card>

              <Card shadow="lg" p="xl" radius="md" bg="sky.0">
                <Group align="flex-start">
                  <ThemeIcon size={50} radius="md" color="sky">
                    <IconCloudComputing size={26} />
                  </ThemeIcon>
                  <Box style={{ flex: 1 }}>
                    <Text fz={{ base: 'lg', sm: 'xl' }} fw={700} mb="xs">
                      100% Data Security
                    </Text>
                    <Text c="dimmed">
                      End-to-end encryption and GDPR compliant storage
                    </Text>
                  </Box>
                </Group>
              </Card>
            </Stack>
          </Grid.Col>
        </Grid>
      </Container>

      {/* CTA Section */}
      <Box
        py={100}
        style={{
          background: 'linear-gradient(135deg, #0066ff 0%, #003d99 100%)',
        }}
      >
        <Container size="md">
          <Stack align="center" gap="xl" ta="center">
            <Badge
              size="lg"
              variant="light"
              color="white"
              leftSection={<IconClock size={16} />}
            >
              Limited Time Offer
            </Badge>

            <Title
              order={2}
              fz={{ base: 28, sm: 36, md: 42 }}
              fw={800}
              c="white"
            >
              Start Your Free 14-Day Trial
            </Title>

            <Text fz={{ base: 'md', sm: 'lg', md: 'xl' }} c="white" style={{ opacity: 0.9 }} maw={500} px={{ base: 'xs', sm: 0 }}>
              No credit card required. Full access to all features.
              Cancel anytime.
            </Text>

            <Stack gap="sm" w="100%" maw={400}>
              <Button
                size="xl"
                radius="md"
                variant="white"
                color="dark"
                leftSection={<IconClock size={24} />}
                w={{ base: '100%', sm: 'auto' }}
              >
                Start Free Trial
              </Button>
              <Button
                size="xl"
                radius="md"
                variant="outline"
                color="white"
                style={{
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                  color: 'white',
                }}
                w={{ base: '100%', sm: 'auto' }}
              >
                Schedule Demo
              </Button>
            </Stack>

            <SimpleGrid cols={{ base: 1, xs: 3 }} spacing="xl" mt="md" style={{ opacity: 0.8 }} w="100%" maw={400}>
              <Text c="white" fz={{ base: 'xs', sm: 'sm' }} ta="center">
                <IconCheck size={16} style={{ verticalAlign: 'middle' }} /> No credit card
              </Text>
              <Text c="white" fz={{ base: 'xs', sm: 'sm' }} ta="center">
                <IconCheck size={16} style={{ verticalAlign: 'middle' }} /> 14 days free
              </Text>
              <Text c="white" fz={{ base: 'xs', sm: 'sm' }} ta="center">
                <IconCheck size={16} style={{ verticalAlign: 'middle' }} /> Cancel anytime
              </Text>
            </SimpleGrid>
          </Stack>
        </Container>
      </Box>
    </>
  );
}
