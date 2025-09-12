import { Box, Card, Stack, Text, Title } from '@mantine/core';

import { AppDesktopLayout, AppMobileLayout } from '@/components/common';
import { useDeviceType } from '@/hooks/useDeviceType';

export function HomePage() {
  const { isMobile } = useDeviceType();

  if (isMobile) {
    return (
      <AppMobileLayout>
        <Stack gap="xl">
          <Box
            style={{
              display: 'flex',
              justifyContent: 'center',
              width: '100%',
              padding: '0 16px',
            }}
          >
            <Box style={{ maxWidth: '600px', width: '100%' }}>
              <Card shadow="sm" padding="lg">
                <Title order={1}>Home</Title>
                <Text mt="md" size="lg">
                  Welcome to the home page This version of application is build at{' '}
                  {import.meta.env.VITE_APP_BUILD}
                </Text>
              </Card>
            </Box>
          </Box>
        </Stack>
      </AppMobileLayout>
    );
  }

  return (
    <AppDesktopLayout>
      <Stack gap="xl">
        <Box
          style={{
            display: 'flex',
            justifyContent: 'center',
            width: '100%',
            padding: '0 16px',
          }}
        >
          <Box style={{ maxWidth: '600px', width: '100%' }}>
            <Card shadow="sm" padding="lg">
              <Title order={1}>Home</Title>
              <Text mt="md" size="lg">
                Welcome to the home page
              </Text>
            </Card>
          </Box>
        </Box>
      </Stack>
    </AppDesktopLayout>
  );
}
