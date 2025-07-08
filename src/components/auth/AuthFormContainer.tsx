import {type ReactNode} from 'react';
import {Paper, LoadingOverlay, Transition, Stack} from '@mantine/core';
import {useMediaQuery} from '@mantine/hooks';

type AuthFormContainerProps = {
  readonly children: ReactNode;
  readonly isLoading: boolean;
  readonly mounted: boolean;
};

export function AuthFormContainer({
  children,
  isLoading,
  mounted,
}: AuthFormContainerProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)');

  return (
    <Stack gap="xl">
      <Transition
        mounted={mounted}
        transition="slide-up"
        duration={400}
        timingFunction="ease"
      >
        {(styles) => (
          <Paper
            withBorder={isDesktop}
            shadow={isDesktop ? 'xl' : 'none'}
            p="lg"
            radius={isDesktop ? 'md' : 'none'}
            style={{
              ...styles,
              position: 'relative',
            }}
          >
            <LoadingOverlay
              visible={isLoading}
              overlayProps={{blur: 2}}
              transitionProps={{duration: 300}}
            />
            {children}
          </Paper>
        )}
      </Transition>
    </Stack>
  );
}
