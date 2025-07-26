import {Title, Text, Container, Card, Box, Stack} from '@mantine/core';

export function EditEmployeePage() {
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
              <Title order={1}>Blank Page</Title>
              <Text mt="md" size="lg">
                This page is blank place holder page, if you see this page, it
                means that the route in under construction, please just ignore
                this
              </Text>
            </Card>
          </Box>
        </Box>
      </Stack>
    </Container>
  );
}
