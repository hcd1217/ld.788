import {Title, Text, Container, Card, Box, Stack} from '@mantine/core';

export function DashboardPage() {
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
                Welcome to the home
              </Text>
            </Card>
          </Box>
        </Box>
      </Stack>
    </Container>
  );
}
