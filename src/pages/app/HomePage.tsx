import {Title, Text, Container, Card, Box, Stack} from '@mantine/core';
import {useIsDesktop} from '@/hooks/useIsDesktop';
import { AppPageTitle } from '@/components/common/ui/AppPageTitle';
import { AppMobileLayout } from '@/components/common';
import { useTranslation } from 'react-i18next';

export function HomePage() {
  const isDesktop = useIsDesktop();
  const { t } = useTranslation();

  if (!isDesktop) {
    return <AppMobileLayout
      showLogo
      header={<AppPageTitle title={t('common.home')} />}
    >
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
    </AppMobileLayout>
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
            <Card shadow="sm" padding="lg">
              <Title order={1}>Home</Title>
              <Text mt="md" size="lg">
                Welcome to the home page
              </Text>
            </Card>
          </Box>
        </Box>
      </Stack>
    </Container>
  );
}
