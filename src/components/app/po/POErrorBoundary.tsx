import { Component, type ErrorInfo, type ReactNode } from 'react';

import { Alert, Button, Stack, Text, Title } from '@mantine/core';
import { IconAlertTriangle, IconRefresh } from '@tabler/icons-react';

import { useTranslation } from '@/hooks/useTranslation';
import { addComponentError } from '@/stores/error';
import { isDevelopment } from '@/utils/env';
import { logError } from '@/utils/logger';

interface POErrorBoundaryProps {
  readonly children: ReactNode;
  readonly componentName?: string;
}

interface POErrorBoundaryState {
  hasError: boolean;
  error: Error | undefined;
}

// Wrapper component to inject translations
export function POErrorBoundary({ children, componentName }: POErrorBoundaryProps) {
  return (
    <POErrorBoundaryInternal componentName={componentName}>{children}</POErrorBoundaryInternal>
  );
}

// Internal class component
class POErrorBoundaryInternal extends Component<
  POErrorBoundaryProps & { readonly t?: (key: string) => string },
  POErrorBoundaryState
> {
  static getDerivedStateFromError(error: Error): POErrorBoundaryState {
    return { hasError: true, error };
  }

  state: POErrorBoundaryState = { hasError: false, error: undefined };

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to console in development
    logError('POErrorBoundary caught error:', error, {
      module: 'POErrorBoundary',
      action: 'componentDidCatch',
    });

    // Add to error store
    addComponentError(
      `PO component error${this.props.componentName ? ` in ${this.props.componentName}` : ''}: ${error.message}`,
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
      title={t('po.componentError')}
      color="red"
      variant="light"
      p="lg"
    >
      <Stack gap="md">
        <div>
          <Title order={4}>
            {t('po.componentErrorTitle', {
              component: componentName || t('po.thisComponent'),
            })}
          </Title>
          {isDevelopment && error ? (
            <Text size="sm" c="red.9" mt="xs">
              {error.message}
            </Text>
          ) : null}
          <Text size="sm" c="dimmed" mt="xs">
            {t('po.componentErrorDescription')}
          </Text>
        </div>
        <Button
          color="red"
          size="sm"
          variant="subtle"
          leftSection={<IconRefresh size={16} />}
          onClick={onReset}
        >
          {t('common.tryAgain')}
        </Button>
      </Stack>
    </Alert>
  );
}
