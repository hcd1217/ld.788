import { Modal, Text, Button, Group, Stack, Paper, Code, ThemeIcon, ActionIcon, Tooltip, Divider, Box, Collapse } from '@mantine/core';
import { IconAlertCircle, IconCopy, IconCode, IconMessage, IconBug, IconChevronDown, IconChevronUp } from '@tabler/icons-react';
import { useErrorStore } from '@/stores/error-store.ts';
import { notifications } from '@mantine/notifications';
import { useState } from 'react';

export default function ErrorPopup() {
  const { error, clearError } = useErrorStore();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    code: false,
    message: true,
    stack: false,
  });

  if (!error) return null;

  const errorCode = error.errorDetail.code;
  const errorMessage = error.errorDetail.message;
  const errorStack = error.errorDetail.error?.stack;

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleCopyError = () => {
    const errorDetails = [
      'Error Details:',
      '---------------',
      `Error Code: ${errorCode}`,
      `Message: ${errorMessage}`,
      errorStack ? `\nStack Trace:\n${errorStack}` : '',
    ].join('\n');

    navigator.clipboard.writeText(errorDetails).then(() => {
      notifications.show({
        title: 'Copied!',
        message: 'Error details have been copied to clipboard',
        color: 'green',
      });
    });
  };

  return (
    <Modal
      centered
      opened={Boolean(error)}
      title={
        <Group gap="xs" justify="space-between" w="100%">
          <Group gap="xs">
            <ThemeIcon color="red" variant="light" size="lg">
              <IconAlertCircle size={20} />
            </ThemeIcon>
            <Text fw={600} size="lg">Something went wrong</Text>
          </Group>
          <Tooltip label="Copy Error Details">
            <ActionIcon
              variant="light"
              color="blue"
              onClick={handleCopyError}
              aria-label="Copy error details"
            >
              <IconCopy size={18} />
            </ActionIcon>
          </Tooltip>
        </Group>
      }
      size="lg"
      onClose={clearError}
    >
      <Stack gap="md">
        <Paper withBorder p="md" radius="md" bg="gray.0">
          <Group gap="sm" mb="xs" style={{ cursor: 'pointer' }} onClick={() => toggleSection('code')}>
            <ThemeIcon color="blue" variant="light" size="md">
              <IconCode size={16} />
            </ThemeIcon>
            <Text size="sm" fw={500} c="blue.7">Error Code</Text>
            <ActionIcon variant="subtle" color="blue" ml="auto">
              {expandedSections.code ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
            </ActionIcon>
          </Group>
          <Divider mb="xs" />
          <Collapse in={expandedSections.code}>
            <Code block style={{
              backgroundColor: 'var(--mantine-color-blue-0)',
              border: '1px solid var(--mantine-color-blue-1)',
              borderRadius: '4px',
              padding: '12px'
            }}>
              {errorCode}
            </Code>
          </Collapse>
        </Paper>

        <Paper withBorder p="md" radius="md" bg="gray.0">
          <Group gap="sm" mb="xs" style={{ cursor: 'pointer' }} onClick={() => toggleSection('message')}>
            <ThemeIcon color="grape" variant="light" size="md">
              <IconMessage size={16} />
            </ThemeIcon>
            <Text size="sm" fw={500} c="grape.7">Error Message</Text>
            <ActionIcon variant="subtle" color="grape" ml="auto">
              {expandedSections.message ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
            </ActionIcon>
          </Group>
          <Divider mb="xs" />
          <Collapse in={expandedSections.message}>
            <Box p="xs" style={{
              backgroundColor: 'var(--mantine-color-grape-0)',
              border: '1px solid var(--mantine-color-grape-1)',
              borderRadius: '4px'
            }}>
              <Text>{errorMessage}</Text>
            </Box>
          </Collapse>
        </Paper>

        {errorStack && (
          <Paper withBorder p="md" radius="md" bg="gray.0">
            <Group gap="sm" mb="xs" style={{ cursor: 'pointer' }} onClick={() => toggleSection('stack')}>
              <ThemeIcon color="red" variant="light" size="md">
                <IconBug size={16} />
              </ThemeIcon>
              <Text size="sm" fw={500} c="red.7">Stack Trace</Text>
            </Group>
            <Divider mb="xs" />
            <Collapse in={expandedSections.stack}>
              <Code block style={{
                backgroundColor: 'var(--mantine-color-red-0)',
                border: '1px solid var(--mantine-color-red-1)',
                borderRadius: '4px',
                padding: '12px',
                maxHeight: '200px',
                overflow: 'auto',
                fontSize: '13px',
                lineHeight: '1.5'
              }}>
                {errorStack}
              </Code>
            </Collapse>
          </Paper>
        )}

        <Group justify="flex-end" mt="md">
          <Button variant="light" color="red" onClick={clearError}>
            Close
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
