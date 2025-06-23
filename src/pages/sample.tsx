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
} from '@mantine/core';
import {
  IconRocket,
  IconSparkles,
  IconTrendingUp,
  IconShieldCheck,
  IconBolt,
  IconUsers
} from '@tabler/icons-react';

export default function Top() {
  return (
    <>
      {/* Hero Section */}
      <Box pos="relative" h={{ base: 600, md: 700 }}>
        <BackgroundImage
          src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&q=80"
          h="100%"
        >
          <Overlay
            gradient="linear-gradient(180deg, rgba(0, 0, 0, 0.25) 0%, rgba(0, 0, 0, .65) 40%)"
            opacity={1}
            zIndex={0}
          />
          <Container size="xl" h="100%" pos="relative" style={{ zIndex: 1 }}>
            <Center h="100%">
              <Stack align="center" gap="xl" maw={800} ta="center">
                <Badge
                  size="lg"
                  variant="gradient"
                  gradient={{ from: 'blue', to: 'cyan' }}
                  leftSection={<IconSparkles size={16} />}
                >
                  Welcome to the Future
                </Badge>

                <Title
                  order={1}
                  size={72}
                  fw={900}
                  c="white"
                  style={{ lineHeight: 1.1 }}
                >
                  Transform Your Business
                  <Text
                    component="span"
                    inherit
                    variant="gradient"
                    gradient={{ from: 'blue', to: 'cyan' }}
                  >
                    {' '}With Innovation
                  </Text>
                </Title>

                <Text
                  size="xl"
                  c="dimmed"
                  maw={600}
                  style={{ color: 'rgba(255, 255, 255, 0.9)' }}
                >
                  Unlock the power of cutting-edge technology to accelerate growth,
                  streamline operations, and stay ahead of the competition.
                </Text>

                <Group mt="xl">
                  <Button
                    size="lg"
                    radius="md"
                    variant="gradient"
                    gradient={{ from: 'blue', to: 'cyan' }}
                    leftSection={<IconRocket size={20} />}
                  >
                    Get Started Free
                  </Button>
                  <Button
                    size="lg"
                    radius="md"
                    variant="white"
                    color="dark"
                  >
                    Watch Demo
                  </Button>
                </Group>
              </Stack>
            </Center>
          </Container>
        </BackgroundImage>
      </Box>

      {/* Features Section */}
      <Container size="xl" py={80}>
        <Stack gap={60}>
          <Stack align="center" gap="md" ta="center">
            <Title order={2} size={42} fw={800}>
              Why Choose Us
            </Title>
            <Text size="xl" c="dimmed" maw={600}>
              Experience the difference with our comprehensive suite of features
              designed to empower your success.
            </Text>
          </Stack>

          <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="xl">
            <Card shadow="sm" padding="xl" radius="md" withBorder>
              <ThemeIcon
                size={60}
                radius="md"
                variant="gradient"
                gradient={{ from: 'blue', to: 'cyan' }}
                mb="md"
              >
                <IconBolt size={30} />
              </ThemeIcon>
              <Text size="lg" fw={600} mb="xs">
                Lightning Fast
              </Text>
              <Text size="sm" c="dimmed">
                Optimized performance that delivers results in milliseconds,
                ensuring your users never wait.
              </Text>
            </Card>

            <Card shadow="sm" padding="xl" radius="md" withBorder>
              <ThemeIcon
                size={60}
                radius="md"
                variant="gradient"
                gradient={{ from: 'teal', to: 'lime' }}
                mb="md"
              >
                <IconShieldCheck size={30} />
              </ThemeIcon>
              <Text size="lg" fw={600} mb="xs">
                Enterprise Security
              </Text>
              <Text size="sm" c="dimmed">
                Bank-level encryption and security measures to keep your
                data safe and compliant.
              </Text>
            </Card>

            <Card shadow="sm" padding="xl" radius="md" withBorder>
              <ThemeIcon
                size={60}
                radius="md"
                variant="gradient"
                gradient={{ from: 'orange', to: 'red' }}
                mb="md"
              >
                <IconTrendingUp size={30} />
              </ThemeIcon>
              <Text size="lg" fw={600} mb="xs">
                Scalable Growth
              </Text>
              <Text size="sm" c="dimmed">
                Built to grow with your business, from startup to enterprise,
                without missing a beat.
              </Text>
            </Card>

            <Card shadow="sm" padding="xl" radius="md" withBorder>
              <ThemeIcon
                size={60}
                radius="md"
                variant="gradient"
                gradient={{ from: 'grape', to: 'pink' }}
                mb="md"
              >
                <IconUsers size={30} />
              </ThemeIcon>
              <Text size="lg" fw={600} mb="xs">
                Team Collaboration
              </Text>
              <Text size="sm" c="dimmed">
                Seamless collaboration tools that bring your team together,
                no matter where they are.
              </Text>
            </Card>

            <Card shadow="sm" padding="xl" radius="md" withBorder>
              <ThemeIcon
                size={60}
                radius="md"
                variant="gradient"
                gradient={{ from: 'indigo', to: 'cyan' }}
                mb="md"
              >
                <IconSparkles size={30} />
              </ThemeIcon>
              <Text size="lg" fw={600} mb="xs">
                AI-Powered
              </Text>
              <Text size="sm" c="dimmed">
                Leverage artificial intelligence to automate tasks and
                gain valuable insights.
              </Text>
            </Card>

            <Card shadow="sm" padding="xl" radius="md" withBorder>
              <ThemeIcon
                size={60}
                radius="md"
                variant="gradient"
                gradient={{ from: 'blue', to: 'grape' }}
                mb="md"
              >
                <IconRocket size={30} />
              </ThemeIcon>
              <Text size="lg" fw={600} mb="xs">
                Quick Setup
              </Text>
              <Text size="sm" c="dimmed">
                Get up and running in minutes with our intuitive setup
                process and documentation.
              </Text>
            </Card>
          </SimpleGrid>
        </Stack>
      </Container>

      {/* CTA Section */}
      <Box bg="gray.0" py={80}>
        <Container size="md">
          <Stack align="center" gap="xl" ta="center">
            <Title order={2} size={36} fw={800}>
              Ready to Get Started?
            </Title>
            <Text size="lg" c="dimmed" maw={500}>
              Join thousands of companies already transforming their business
              with our platform.
            </Text>
            <Group>
              <Button
                size="lg"
                radius="md"
                variant="gradient"
                gradient={{ from: 'blue', to: 'cyan' }}
                leftSection={<IconRocket size={20} />}
              >
                Start Free Trial
              </Button>
              <Button
                size="lg"
                radius="md"
                variant="default"
              >
                Contact Sales
              </Button>
            </Group>
          </Stack>
        </Container>
      </Box>
    </>
  );
}
