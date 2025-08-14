import { Component, type ReactNode, type ErrorInfo } from 'react';
import { Alert, Button, Stack, Text, Title } from '@mantine/core';
import { IconAlertTriangle, IconRefresh } from '@tabler/icons-react';
import { addComponentError } from '@/stores/error';
import { isDevelopment } from '@/utils/env';
import { useTranslation } from '@/hooks/useTranslation';
import { logError } from '@/utils/logger';

interface TabErrorBoundaryProps {
  readonly children: ReactNode;
  readonly tabName?: string;
}

interface TabErrorBoundaryState {
  hasError: boolean;
  error: Error | undefined;
}

// Wrapper component to inject translations
export function TabErrorBoundary({ children, tabName }: TabErrorBoundaryProps) {
  return <TabErrorBoundaryInternal tabName={tabName}>{children}</TabErrorBoundaryInternal>;
}

// Internal class component
class TabErrorBoundaryInternal extends Component<
  TabErrorBoundaryProps & { readonly t?: (key: string) => string },
  TabErrorBoundaryState
> {
  static getDerivedStateFromError(error: Error): TabErrorBoundaryState {
    return { hasError: true, error };
  }

  state: TabErrorBoundaryState = { hasError: false, error: undefined };

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to console in development
    logError('TabErrorBoundary caught error:', error, {
      module: 'TabErrorBoundary',
      action: 'componentDidCatch',
    });

    // Add to error store
    addComponentError(
      `Tab error${this.props.tabName ? ` in ${this.props.tabName}` : ''}: ${error.message}`,
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
          tabName={this.props.tabName}
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
  readonly tabName: string | undefined;
  readonly onReset: () => void;
}

function ErrorFallback({ error, tabName, onReset }: ErrorFallbackProps) {
  const { t } = useTranslation();

  return (
    <Alert
      icon={<IconAlertTriangle size={24} />}
      title={t('admin.clients.tabError')}
      color="red"
      variant="light"
      p="lg"
    >
      <Stack gap="md">
        <div>
          <Title order={4}>
            {t('admin.clients.tabErrorTitle', {
              tab: tabName || t('admin.clients.thisTab'),
            })}
          </Title>
          {isDevelopment && error ? (
            <Text size="sm" c="red.9" mt="xs">
              {error.message}
            </Text>
          ) : null}
          <Text size="sm" c="dimmed" mt="xs">
            {t('admin.clients.tabErrorDescription')}
          </Text>
        </div>
        <Button
          color="red"
          size="sm"
          variant="subtle"
          leftSection={<IconRefresh size={16} />}
          onClick={onReset}
        >
          {t('admin.clients.tryAgain')}
        </Button>
      </Stack>
    </Alert>
  );
}
