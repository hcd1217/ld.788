import { Component, type ReactNode, type ErrorInfo } from 'react';
import { Alert, Button, Stack, Text, Title } from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';
import { addComponentError } from '@/stores/error';
import { isDevelopment } from '@/utils/env';
import { logError } from '@/utils/logger';

type Props = {
  readonly children: ReactNode;
  readonly fallback?: ReactNode;
};

type State = {
  hasError: boolean;
  error: Error | undefined;
};

export class ErrorBoundary extends Component<Props, State> {
  static defaultProps = {
    fallback: undefined,
  };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  state: State = { hasError: false, error: undefined };

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to console in development
    logError('ErrorBoundary caught error:', error, {
      module: 'ErrorBoundary',
      action: 'componentDidCatch',
    });

    // Add to error store
    addComponentError(error.message, errorInfo.componentStack ?? '', error.cause as Error);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: undefined });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <Alert
          icon={<IconAlertTriangle size={24} />}
          title="Something went wrong"
          color="red"
          variant="filled"
          p="lg"
          m="md"
        >
          <Stack gap="md">
            <div>
              <Title order={4} c="white">
                An error occurred in this component
              </Title>
              {isDevelopment && this.state.error ? (
                <Text size="sm" c="red.1" mt="xs">
                  {this.state.error.message}
                </Text>
              ) : null}
            </div>
            <Button color="red" size="sm" variant="white" onClick={this.handleReset}>
              Try Again
            </Button>
          </Stack>
        </Alert>
      );
    }

    return this.props.children;
  }
}
