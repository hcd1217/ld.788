import { Box, Loader } from '@mantine/core';

export function CommonMobileFooterSkeleton() {
  return (
    <Box
      style={{
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      aria-busy="true"
    >
      <Loader size="xs" color="dimmed" />
    </Box>
  );
}
