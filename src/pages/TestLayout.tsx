import { AppMobileLayout } from '@/components/common';
import { Box } from '@mantine/core';

export function TestLayout() {
  return (
    <AppMobileLayout scrollable={false}>
      <Box
        style={{
          height: '100%',
          backgroundColor: 'red',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        TEST CONTENT - Should not scroll
      </Box>
    </AppMobileLayout>
  );
}
