import { Title, Text, Container, Card, Box, Stack } from '@mantine/core';
import { useTranslation } from '@/hooks/useTranslation';
import { GoBack } from '@/components/common';

export function BlankContainer() {
  const { t } = useTranslation();

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
          <Box style={{ maxWidth: '600px', width: '100%' }}>
            <GoBack />
            <Card shadow="sm" padding="lg" mt="lg">
              <Title order={1}>Blank Page</Title>
              <Text mt="md" size="lg">
                {t('common.pages.blank')}
              </Text>
            </Card>
          </Box>
        </Box>
      </Stack>
    </Container>
  );
}
