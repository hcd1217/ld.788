import {Alert, Text, List} from '@mantine/core';
import {IconInfoCircle} from '@tabler/icons-react';
import {usePWA} from '@/hooks/usePWA';

export function SafariUpdateGuide() {
  const {isSafari, isStandalone, needRefresh} = usePWA();
  
  // Only show for Safari in standalone mode when update is needed
  if (!isSafari || !isStandalone || !needRefresh) {
    return null;
  }
  
  return (
    <Alert icon={<IconInfoCircle />} title="How to Update" color="blue">
      <Text size="sm" mb="xs">
        To update the app on Safari:
      </Text>
      <List size="sm">
        <List.Item>Swipe up from the bottom of the screen</List.Item>
        <List.Item>Swipe the app preview up to close it</List.Item>
        <List.Item>Tap the app icon to reopen with the latest version</List.Item>
      </List>
    </Alert>
  );
}