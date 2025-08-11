import { Component, type ReactNode, type ErrorInfo } from 'react';
import { Alert, Button, Stack, Text, Title } from '@mantine/core';
import { IconAlertTriangle, IconRefresh } from '@tabler/icons-react';
import { addComponentError } from '@/stores/error';
import { isDevelopment } from '@/utils/env';
import { useTranslation } from '@/hooks/useTranslation';

interface TimekeeperErrorBoundaryProps {
  readonly children: ReactNode;
  readonly componentName?: string;
}

interface TimekeeperErrorBoundaryState {
  hasError: boolean;
  error: Error | undefined;
}

// Wrapper component to inject translations
export function TimekeeperErrorBoundary({ children, componentName }: TimekeeperErrorBoundaryProps) {
  return (
    <TimekeeperErrorBoundaryInternal componentName={componentName}>
      {children}
    </TimekeeperErrorBoundaryInternal>
  );
}

// Internal class component
class TimekeeperErrorBoundaryInternal extends Component<
  TimekeeperErrorBoundaryProps & { readonly t?: (key: string) => string },
  TimekeeperErrorBoundaryState
> {
  static getDerivedStateFromError(error: Error): TimekeeperErrorBoundaryState {
    return { hasError: true, error };
  }

  state: TimekeeperErrorBoundaryState = { hasError: false, error: undefined };

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to console in development
    if (isDevelopment) {
      console.error('TimekeeperErrorBoundary caught error:', error, errorInfo);
    }

    // Add to error store
    addComponentError(
      `TimeKeeper component error${this.props.componentName ? ` in ${this.props.componentName}` : ''}: ${error.message}`,
      errorInfo.componentStack ?? '',
      error.cause as Error,
    );
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: undefined });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <ErrorFallback
          error={this.state.error}
          componentName={this.props.componentName}
          onReset={this.handleReset}
        />
      );
    }

    return this.props.children;
  }
}

// Error fallback component using hooks
interface ErrorFallbackProps {
  readonly error: Error | undefined;
  readonly componentName: string | undefined;
  readonly onReset: () => void;
}

function ErrorFallback({ error, componentName, onReset }: ErrorFallbackProps) {
  const { t } = useTranslation();

  return (
    <Alert
      icon={<IconAlertTriangle size={24} />}
      title={t('common.error')}
      color="red"
      variant="light"
      p="lg"
    >
      <Stack gap="md">
        <div>
          <Title order={4}>{componentName ? `Error in ${componentName}` : 'Component Error'}</Title>
          {isDevelopment && error ? (
            <Text size="sm" c="red.9" mt="xs">
              {error.message}
            </Text>
          ) : null}
          <Text size="sm" c="dimmed" mt="xs">
            An error occurred. Please refresh to try again.
          </Text>
        </div>
        <Button
          color="red"
          size="sm"
          variant="subtle"
          leftSection={<IconRefresh size={16} />}
          onClick={onReset}
        >
          Refresh
        </Button>
      </Stack>
    </Alert>
  );
}
