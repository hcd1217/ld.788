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
    <Alert icon={<IconInfoCircle />} title="How to Update Safari PWA" color="blue">
      <Text size="sm" mb="xs">
        To update the app on Safari, you must completely close the app:
      </Text>
      <List size="sm">
        <List.Item>Double-tap home button or swipe up from bottom</List.Item>
        <List.Item>Find this app and swipe UP to close completely</List.Item>
        <List.Item>Wait 2-3 seconds for Safari to fully close</List.Item>
        <List.Item>Tap the app icon on home screen to reopen</List.Item>
      </List>
      <Text size="xs" c="dimmed" mt="xs">
        Note: Simply switching between apps won't update Safari PWAs. A complete restart is required.
      </Text>
    </Alert>
  );
}