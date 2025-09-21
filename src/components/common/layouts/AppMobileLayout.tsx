import React from 'react';

import { useNavigate } from 'react-router';

import { ActionIcon, Affix, AppShell, Container, Group, LoadingOverlay } from '@mantine/core';
import { IconHome } from '@tabler/icons-react';

import { ROUTERS } from '@/config/routeConfig';
import { useAppStore } from '@/stores/useAppStore';

import { ErrorAlert } from '../feedback';
import { AppLogo, GoBack } from '../navigation';
import { CommonMobileFooter } from '../ui';
import { CommonMobileFooterSkeleton } from '../ui/CommonMobileFooterSkeleton';
import { CommonMobileHeader } from '../ui/CommonMobileHeader';

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
  const navigate = useNavigate();

  // Check if user profile is loading
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const user = useAppStore((state) => state.user);
  const isProfileLoading = isAuthenticated && !user;

  const handleHomeClick = () => {
    navigate(ROUTERS.HOME);
  };
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
      {noFooter ? (
        /* Floating Home Button - always visible on mobile layouts */
        <Affix>
          <ActionIcon
            onClick={handleHomeClick}
            size="lg"
            radius="xl"
            variant="filled"
            color="var(--mantine-color-primary-filled)"
            style={{
              position: 'fixed',
              bottom: 20,
              left: 10,
              zIndex: 100,
            }}
          >
            <IconHome size={20} />
          </ActionIcon>
        </Affix>
      ) : (
        <AppShell.Footer className={classes.footer}>
          {footer ?? (isProfileLoading ? <CommonMobileFooterSkeleton /> : <CommonMobileFooter />)}
        </AppShell.Footer>
      )}
    </AppShell>
  );
}
