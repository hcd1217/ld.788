import {Title, Button, Container, Stack, Paper} from '@mantine/core';
// Temporary imports for testing - REMOVE AFTER TESTING
import {
  throwTestError,
  throwAsyncError,
  throwUnhandledRejection,
} from '@/test-error';
import {addApiError} from '@/stores/error';
import {TestApiClient} from '@/lib/api/test';

export function ErrorsPage() {
  return (
    <Container size="md" mt="xl">
      <Title order={1}>Welcome to Credo Errors Page</Title>
      {/* TEMPORARY: Error testing buttons - REMOVE AFTER TESTING */}
      {import.meta.env.DEV ? (
        <Paper withBorder p="md" mt="xl">
          <Title order={3} mb="md">
            Error Handling Test (Dev Only)
          </Title>
          <Stack gap="sm">
            <Button color="red" onClick={() => throwTestError()}>
              Throw Sync Error
            </Button>
            <Button color="orange" onClick={() => throwAsyncError()}>
              Throw Async Error (1s delay)
            </Button>
            <Button color="yellow" onClick={() => throwUnhandledRejection()}>
              Throw Unhandled Rejection
            </Button>
            <Button
              color="blue"
              onClick={() => {
                // Test API error
                addApiError('API endpoint not found', 404, '/api/test');
              }}
            >
              Simulate API Error
            </Button>
            <Button
              color="grape"
              onClick={() => {
                // Test component error - this will be caught by ErrorBoundary
                throw new Error('Test component error: Button click error!');
              }}
            >
              Throw Component Error
            </Button>
            <Button
              color="red"
              onClick={async () => {
                const testApi = new TestApiClient();
                try {
                  await testApi.getInvalidResource();
                } catch {
                  // Error will be logged automatically
                }
              }}
            >
              Test 404 API Error
            </Button>
            <Button
              color="orange"
              onClick={async () => {
                const testApi = new TestApiClient();
                try {
                  await testApi.getUserWithBadSchema(1);
                } catch {
                  // Validation error will be logged automatically
                }
              }}
            >
              Test Validation Error
            </Button>
            <Button
              color="pink"
              onClick={async () => {
                const testApi = new TestApiClient();
                try {
                  await testApi.getWithTimeout();
                } catch {
                  // Timeout error will be logged automatically
                }
              }}
            >
              Test Timeout Error
            </Button>
          </Stack>
        </Paper>
      ) : null}
    </Container>
  );
}
