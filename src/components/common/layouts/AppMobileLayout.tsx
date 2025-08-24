import React from 'react';
import { AppShell, Container, Group, LoadingOverlay } from '@mantine/core';
import { CommonMobileHeader } from '../ui/CommonMobileHeader';
import { CommonMobileFooter } from '../ui';
import { CommonMobileFooterSkeleton } from '../ui/CommonMobileFooterSkeleton';
import { useAppStore } from '@/stores/useAppStore';
import { AppLogo, GoBack } from '../navigation';
import { ErrorAlert } from '../feedback';
import classes from './AppLayoutMobile.module.css';

type AppMobileLayoutProps = {
  readonly header?: React.ReactNode;
  readonly children: React.ReactNode;
  readonly isLoading?: boolean;
  readonly footer?: React.ReactNode;
  readonly showLogo?: boolean;
  readonly withGoBack?: boolean;
  readonly goBackRoute?: string;
  readonly noFooter?: boolean;
  readonly noHeader?: boolean;
  readonly error?: string;
  readonly scrollable?: boolean;
  readonly clearError?: () => void;
};
export function AppMobileLayout({
  children,
  header,
  footer,
  error,
  goBackRoute,
  withGoBack = false,
  isLoading = false,
  showLogo = false,
  noHeader = false,
  noFooter = false,
  scrollable = true,
  clearError,
}: AppMobileLayoutProps) {
  const isDefaultHeader = !header && !noHeader;

  // Check if user profile is loading
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const user = useAppStore((state) => state.user);
  const isProfileLoading = isAuthenticated && !user;
  return (
    <AppShell
      header={noHeader ? undefined : { height: 60, offset: false }}
      footer={noFooter ? undefined : { height: 60, offset: false }}
      padding={0}
      className={classes.mobileLayout}
    >
      {!noHeader && (
        <AppShell.Header className={classes.header}>
          {isDefaultHeader ? (
            <CommonMobileHeader />
          ) : (
            <Group my="auto" h="100%" px="xs">
              {withGoBack ? <GoBack variant="mobile-header" route={goBackRoute} /> : null}
              {showLogo ? <AppLogo noTitle /> : null}
              {header}
            </Group>
          )}
        </AppShell.Header>
      )}

      <AppShell.Main className={classes.main}>
        <LoadingOverlay
          visible={isLoading}
          overlayProps={{ blur: 2 }}
          transitionProps={{ duration: 300 }}
        />
        <ErrorAlert error={error} clearError={clearError} />
        <Container
          fluid
          w="100%"
          p={0}
          className={scrollable ? classes.content : classes.contentNoScroll}
          mt={noHeader ? undefined : 60}
          mb={noFooter ? undefined : 60}
        >
          {children}
        </Container>
      </AppShell.Main>
      {!noFooter && (
        <AppShell.Footer className={classes.footer}>
          {footer ?? (isProfileLoading ? <CommonMobileFooterSkeleton /> : <CommonMobileFooter />)}
        </AppShell.Footer>
      )}
    </AppShell>
  );
}
