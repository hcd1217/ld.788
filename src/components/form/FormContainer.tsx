import { type ReactNode } from 'react';

import { LoadingOverlay, Paper, Stack, Transition } from '@mantine/core';

import { useDeviceType } from '@/hooks/useDeviceType';

type FormContainerProps = {
  readonly children: ReactNode;
  readonly isLoading?: boolean;
  readonly mounted?: boolean;
};

export function FormContainer({ children, isLoading = false, mounted = true }: FormContainerProps) {
  const { isDesktop } = useDeviceType();

  return (
    <Stack gap="xl">
      <Transition mounted={mounted} transition="slide-up" duration={400} timingFunction="ease">
        {(styles) => (
          <Paper
            withBorder={isDesktop}
            shadow={isDesktop ? 'xl' : 'none'}
            p={isDesktop ? 'xl' : 'none'}
            radius={isDesktop ? 'md' : 'none'}
            style={{
              ...styles,
              position: 'relative',
              width: isDesktop ? '120%' : '110%',
              maxWidth: isDesktop ? '504px' : '100%',
            }}
          >
            <LoadingOverlay
              visible={isLoading}
              overlayProps={{ blur: 2 }}
              transitionProps={{ duration: 300 }}
            />
            {children}
          </Paper>
        )}
      </Transition>
    </Stack>
  );
}
