import { useState, useEffect, useMemo } from 'react';
import {
  Modal,
  ScrollArea,
  Stack,
  Group,
  Text,
  Badge,
  Button,
  ActionIcon,
  Tooltip,
  Paper,
  Code,
  Divider,
  Title,
  Alert,
  TextInput,
  Select,
  Switch,
  Tabs,
  SimpleGrid,
  Card,
  RingProgress,
  type DefaultMantineColor,
} from '@mantine/core';
import {
  IconX,
  IconCopy,
  IconTrash,
  IconBug,
  IconAlertTriangle,
  IconCheck,
  IconSearch,
  IconFilter,
  IconDownload,
  IconChartBar,
  IconSettings,
  IconList,
} from '@tabler/icons-react';
import {
  showErrorNotification,
  showInfoNotification,
  showSuccessNotification,
} from '@/utils/notifications';
import {
  useErrorStore,
  type ErrorRecord,
  type ErrorSeverity,
  type ErrorType,
} from '@/stores/error';
import { isDevelopment, isProduction } from '@/utils/env';

type ErrorModalProps = {
  readonly isAutoOpen?: boolean;
  readonly autoCloseDelay?: number;
};

function getSeverityColor(severity: ErrorSeverity): DefaultMantineColor {
  switch (severity) {
    case 'critical': {
      return 'red';
    }

    case 'high': {
      return 'orange';
    }

    case 'medium': {
      return 'yellow';
    }

    case 'low': {
      return 'blue';
    }

    default: {
      return 'gray';
    }
  }
}

function getErrorTypeLabel(type: string): string {
  switch (type) {
    case 'error': {
      return 'Runtime Error';
    }

    case 'unhandledRejection': {
      return 'Promise Rejection';
    }

    case 'apiError': {
      return 'API Error';
    }

    case 'componentError': {
      return 'Component Error';
    }

    default: {
      return 'Unknown Error';
    }
  }
}

function formatTimestamp(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(date);
}

function ErrorDetails({ error }: { readonly error: ErrorRecord }) {
  const [copied, setCopied] = useState(false);

  const copyErrorDetails = async () => {
    const details = {
      message: error.message,
      type: error.type,
      severity: error.severity,
      timestamp: error.timestamp,
      source: error.source,
      stack: error.stack,
      context: error.context,
    };

    try {
      await navigator.clipboard.writeText(JSON.stringify(details, null, 2));
      setCopied(true);
      showSuccessNotification('Success', 'Error details copied to clipboard');
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      showErrorNotification('Error', 'Failed to copy error details');
    }
  };

  return (
    <Paper withBorder p="md">
      <Group justify="space-between" mb="xs">
        <Group gap="xs">
          <Badge color={getSeverityColor(error.severity)} size="sm">
            {error.severity}
          </Badge>
          <Badge variant="light" size="sm">
            {getErrorTypeLabel(error.type)}
          </Badge>
          {error.count > 1 && (
            <Badge color="gray" variant="filled" size="sm">
              ×{error.count}
            </Badge>
          )}
        </Group>
        <Group gap="xs">
          <Text size="xs" c="dimmed">
            {formatTimestamp(new Date(error.timestamp))}
          </Text>
          <Tooltip label={copied ? 'Copied!' : 'Copy error details'}>
            <ActionIcon
              variant="subtle"
              size="sm"
              color={copied ? 'green' : 'gray'}
              onClick={copyErrorDetails}
            >
              {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>

      <Text fw={500} mb="xs">
        {error.message}
      </Text>

      {error.source ? (
        <Text size="sm" c="dimmed" mb="xs">
          Source: <Code>{error.source}</Code>
        </Text>
      ) : null}

      {error.stack ? (
        <>
          <Text size="sm" c="dimmed" mb="xs">
            Stack Trace:
          </Text>
          <ScrollArea offsetScrollbars h={100}>
            <Code block style={{ fontSize: '11px' }}>
              {error.stack}
            </Code>
          </ScrollArea>
        </>
      ) : null}

      {error.context && Object.keys(error.context).length > 0 ? (
        <>
          <Text size="sm" c="dimmed" mt="xs" mb="xs">
            Context:
          </Text>
          <Code block style={{ fontSize: '11px' }}>
            {JSON.stringify(error.context as Record<string, unknown>, null, 2)}
          </Code>
        </>
      ) : null}
    </Paper>
  );
}

export function ErrorModal({ isAutoOpen = true, autoCloseDelay }: ErrorModalProps) {
  const [opened, setOpened] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<ErrorType | 'all'>('all');
  const [filterSeverity, setFilterSeverity] = useState<ErrorSeverity | 'all'>('all');
  const [autoOpen, setAutoOpen] = useState(isAutoOpen);
  const [activeTab, setActiveTab] = useState<string | undefined>('errors');

  const { errors, clearErrors, clearError, getErrorCount } = useErrorStore();
  const errorCount = getErrorCount();

  // Filter errors based on search and filters
  const filteredErrors = useMemo(() => {
    return errors.filter((error) => {
      const matchesSearch =
        !searchQuery ||
        error.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (error.source?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);

      const matchesType = filterType === 'all' || error.type === filterType;
      const matchesSeverity = filterSeverity === 'all' || error.severity === filterSeverity;

      return matchesSearch && matchesType && matchesSeverity;
    });
  }, [errors, searchQuery, filterType, filterSeverity]);

  // Calculate statistics
  const errorStats = useMemo(() => {
    const typeCount = {
      error: 0,
      unhandledRejection: 0,
      apiError: 0,
      componentError: 0,
    };

    const severityCount = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
    };

    for (const error of errors) {
      switch (error.type) {
        case 'error': {
          typeCount.error += error.count;
          break;
        }

        case 'unhandledRejection': {
          typeCount.unhandledRejection += error.count;
          break;
        }

        case 'apiError': {
          typeCount.apiError += error.count;
          break;
        }

        case 'componentError': {
          typeCount.componentError += error.count;
          break;
        }

        default: {
          // Exhaustive check
          break;
        }
      }

      switch (error.severity) {
        case 'critical': {
          severityCount.critical += error.count;
          break;
        }

        case 'high': {
          severityCount.high += error.count;
          break;
        }

        case 'medium': {
          severityCount.medium += error.count;
          break;
        }

        case 'low': {
          severityCount.low += error.count;
          break;
        }

        default: {
          // Exhaustive check
          break;
        }
      }
    }

    return { typeCount, severityCount };
  }, [errors]);

  // Auto-open modal when new errors arrive in development
  useEffect(() => {
    if (isDevelopment && autoOpen && errors.length > 0) {
      setOpened(true);

      // Auto-close after delay if specified
      if (autoCloseDelay) {
        const timer = setTimeout(() => {
          setOpened(false);
        }, autoCloseDelay);
        return () => {
          clearTimeout(timer);
        };
      }
    }
  }, [errors.length, autoOpen, autoCloseDelay]);

  // Don't render in production
  if (isProduction) {
    return null;
  }

  const handleClearAll = () => {
    clearErrors();
    showInfoNotification('Info', 'All errors cleared');
    setOpened(false);
  };

  const handleClearError = (id: string) => {
    clearError(id);
    if (errors.length === 1) {
      setOpened(false);
    }
  };

  const handleExportErrors = () => {
    const exportData = {
      timestamp: new Date().toISOString(),
      totalErrors: errorCount,
      errors: errors.map((error) => ({
        ...error,
        timestamp: error.timestamp.toString(),
      })),
      stats: errorStats,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `error-log-${Date.now()}.json`;

    // Add defensive check before DOM manipulation
    if (document.body) {
      document.body.append(link);
      link.click();
      // Use defensive removal with parentNode check
      if (link.parentNode) {
        link.remove();
      }
    }

    URL.revokeObjectURL(url);

    showSuccessNotification('Success', 'Error log exported successfully');
  };

  const handleCopyErrors = async () => {
    const exportData = {
      timestamp: new Date().toISOString(),
      totalErrors: errorCount,
      errors: errors.map((error) => ({
        ...error,
        timestamp: error.timestamp.toString(),
      })),
      stats: errorStats,
    };

    try {
      await navigator.clipboard.writeText(JSON.stringify(exportData, null, 2));
      showSuccessNotification('Success', 'Error log copied to clipboard');
    } catch {
      showErrorNotification('Error', 'Failed to copy error log');
    }
  };

  return (
    <>
      {/* Floating error indicator */}
      {errors.length > 0 && !opened && (
        <Tooltip label={`${errorCount} error${errorCount === 1 ? '' : 's'}`}>
          <ActionIcon
            pos="fixed"
            bottom={20}
            right={20}
            size="xl"
            radius="xl"
            color="red"
            variant="filled"
            style={{ zIndex: 1000 }}
            onClick={() => {
              setOpened(true);
            }}
          >
            <Stack gap={0} align="center">
              <IconBug size={20} />
              {errorCount > 1 && (
                <Text size="xs" fw={700}>
                  {errorCount}
                </Text>
              )}
            </Stack>
          </ActionIcon>
        </Tooltip>
      )}

      <Modal
        opened={opened}
        title={
          <Group>
            <IconAlertTriangle size={24} color="red" />
            <Title order={4}>Development Error Log</Title>
          </Group>
        }
        size="xl"
        padding="md"
        overlayProps={{
          backgroundOpacity: 0.55,
          blur: 3,
        }}
        onClose={() => {
          setOpened(false);
        }}
      >
        <Tabs
          value={activeTab}
          onChange={(value) => {
            setActiveTab(value ?? 'errors');
          }}
        >
          <Tabs.List>
            <Tabs.Tab value="errors" leftSection={<IconList size={16} />}>
              Errors ({filteredErrors.length})
            </Tabs.Tab>
            <Tabs.Tab value="stats" leftSection={<IconChartBar size={16} />}>
              Statistics
            </Tabs.Tab>
            <Tabs.Tab value="settings" leftSection={<IconSettings size={16} />}>
              Settings
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="errors" pt="xs">
            <Stack>
              {errors.length === 0 ? (
                <Alert icon={<IconCheck size={16} />} title="No errors" color="green">
                  All errors have been cleared.
                </Alert>
              ) : (
                <>
                  {/* Controls */}
                  <Group justify="space-between">
                    <Group>
                      <TextInput
                        placeholder="Search errors..."
                        leftSection={<IconSearch size={16} />}
                        value={searchQuery}
                        size="sm"
                        w={200}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                        }}
                      />
                      <Select
                        placeholder="Filter by type"
                        leftSection={<IconFilter size={16} />}
                        data={[
                          { value: 'all', label: 'All Types' },
                          { value: 'error', label: 'Runtime Error' },
                          {
                            value: 'unhandledRejection',
                            label: 'Promise Rejection',
                          },
                          { value: 'apiError', label: 'API Error' },
                          { value: 'componentError', label: 'Component Error' },
                        ]}
                        value={filterType}
                        size="sm"
                        w={180}
                        onChange={(value) => {
                          setFilterType(value as ErrorType | 'all');
                        }}
                      />
                      <Select
                        placeholder="Filter by severity"
                        data={[
                          { value: 'all', label: 'All Severities' },
                          { value: 'critical', label: 'Critical' },
                          { value: 'high', label: 'High' },
                          { value: 'medium', label: 'Medium' },
                          { value: 'low', label: 'Low' },
                        ]}
                        value={filterSeverity}
                        size="sm"
                        w={150}
                        onChange={(value) => {
                          setFilterSeverity(value as ErrorSeverity | 'all');
                        }}
                      />
                    </Group>
                    <Group>
                      <Button
                        leftSection={<IconDownload size={16} />}
                        size="xs"
                        variant="light"
                        visibleFrom="md"
                        onClick={handleExportErrors}
                      >
                        Export
                      </Button>
                      <Button
                        leftSection={<IconCopy size={16} />}
                        size="xs"
                        variant="light"
                        onClick={handleCopyErrors}
                      >
                        Copy
                      </Button>
                      <Button
                        leftSection={<IconTrash size={16} />}
                        size="xs"
                        color="red"
                        variant="light"
                        onClick={handleClearAll}
                      >
                        Clear All
                      </Button>
                    </Group>
                  </Group>

                  <Divider />

                  <Text size="sm" c="dimmed">
                    Showing {filteredErrors.length} of {errors.length} errors
                  </Text>

                  <ScrollArea offsetScrollbars p="lg" h={400}>
                    <Stack
                      gap="md"
                      p="md"
                      w={{
                        base: '80vw',
                        md: '45vw',
                      }}
                    >
                      {filteredErrors.map((error) => (
                        <div key={error.id} style={{ position: 'relative' }}>
                          <ActionIcon
                            pos="absolute"
                            top={8}
                            right={8}
                            size="sm"
                            variant="subtle"
                            color="gray"
                            onClick={() => {
                              handleClearError(error.id);
                            }}
                          >
                            <IconX size={16} />
                          </ActionIcon>
                          <ErrorDetails error={error} />
                        </div>
                      ))}
                    </Stack>
                  </ScrollArea>
                </>
              )}
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="stats" pt="xs">
            <Stack>
              <SimpleGrid cols={2}>
                <Card withBorder>
                  <Title order={6} mb="md">
                    Errors by Type
                  </Title>
                  <Stack gap="xs">
                    {Object.entries(errorStats.typeCount).map(([type, count]) => (
                      <Group key={type} justify="space-between">
                        <Text size="sm">{getErrorTypeLabel(type)}</Text>
                        <Badge>{count}</Badge>
                      </Group>
                    ))}
                  </Stack>
                </Card>

                <Card withBorder>
                  <Title order={6} mb="md">
                    Errors by Severity
                  </Title>
                  <Stack gap="xs">
                    {Object.entries(errorStats.severityCount).map(([severity, count]) => (
                      <Group key={severity} justify="space-between">
                        <Badge color={getSeverityColor(severity as ErrorSeverity)}>
                          {severity}
                        </Badge>
                        <Badge variant="light">{count}</Badge>
                      </Group>
                    ))}
                  </Stack>
                </Card>
              </SimpleGrid>

              <Card withBorder>
                <Title order={6} mb="md">
                  Error Distribution
                </Title>
                <Group justify="center">
                  <RingProgress
                    size={160}
                    thickness={16}
                    sections={[
                      {
                        value: (errorStats.severityCount.critical / errorCount) * 100,
                        color: 'red',
                      },
                      {
                        value: (errorStats.severityCount.high / errorCount) * 100,
                        color: 'orange',
                      },
                      {
                        value: (errorStats.severityCount.medium / errorCount) * 100,
                        color: 'yellow',
                      },
                      {
                        value: (errorStats.severityCount.low / errorCount) * 100,
                        color: 'blue',
                      },
                    ]}
                  />
                </Group>
              </Card>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="settings" pt="xs">
            <Stack>
              <Switch
                label="Auto-open on new errors"
                checked={autoOpen}
                onChange={(e) => {
                  setAutoOpen(e.currentTarget.checked);
                }}
              />
              <Text size="sm" c="dimmed">
                Automatically open this modal when new errors are detected
              </Text>
            </Stack>
          </Tabs.Panel>
        </Tabs>
      </Modal>
    </>
  );
}
