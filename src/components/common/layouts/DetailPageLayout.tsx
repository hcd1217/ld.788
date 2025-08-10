import type { ReactNode } from 'react';
import { Container, Stack, Group, Title, LoadingOverlay, type MantineSize } from '@mantine/core';
import { useDeviceType } from '@/hooks/useDeviceType';
import { GoBack } from '@/components/common';

interface DetailPageLayoutProps {
  readonly title: string;
  readonly children?: ReactNode;
  readonly isLoading?: boolean;
  readonly containerFluid?: boolean;
  readonly containerSize?: MantineSize;
  readonly titleAlign?: 'left' | 'center' | 'right';
  readonly withGoBack?: boolean;
}

export function DetailPageLayout({
  title,
  children,
  isLoading = false,
  containerFluid = true,
  containerSize,
  titleAlign = 'center',
  withGoBack = true,
}: DetailPageLayoutProps) {
  const { isDesktop } = useDeviceType();

  const containerProps = containerFluid
    ? { fluid: true, px: isDesktop ? 'xl' : 'md' }
    : { size: containerSize || 'md' };

  return (
    <Container {...containerProps} p={isDesktop ? undefined : 0}>
      <Stack gap="xl" p={isDesktop ? undefined : 0}>
        {withGoBack ? (
          <Group justify="left">
            <GoBack />
          </Group>
        ) : null}

        <Title order={1} ta={titleAlign}>
          {title}
        </Title>

        <LoadingOverlay
          visible={isLoading}
          overlayProps={{ blur: 2 }}
          transitionProps={{ duration: 300 }}
        />

        {children}
      </Stack>
    </Container>
  );
}
