import {AppShell, Group, LoadingOverlay} from '@mantine/core';
import {CommonMobileHeader, CommonMobileFooter} from '../ui';
import {AppLogo} from '../navigation';
import classes from './AppLayoutMobile.module.css';

type AppMobileLayoutProps = {
  readonly header?: React.ReactNode;
  readonly children: React.ReactNode;
  readonly isLoading?: boolean;
  readonly footer?: React.ReactNode;
  readonly withLogo?: boolean;
  readonly noFooter?: boolean;
  readonly noHeader?: boolean;
};
export function AppMobileLayout({
  children,
  header,
  footer,
  isLoading = false,
  withLogo = false,
  noHeader = false,
  noFooter = false,
}: AppMobileLayoutProps) {
  return (
    <AppShell
      header={{height: 60}}
      footer={{height: 60}}
      padding={0}
      className={classes.mobileLayout}
    >
      {noHeader ? null : (
        <AppShell.Header className={classes.header}>
          <Group my="auto" h="100%" px="sm">
            {withLogo ? <AppLogo noTitle /> : null}
            {header ?? <CommonMobileHeader />}
          </Group>
        </AppShell.Header>
      )}

      <AppShell.Main className={classes.main} my="sm">
        <LoadingOverlay
          visible={isLoading}
          overlayProps={{blur: 2}}
          transitionProps={{duration: 300}}
        />
        {children}
      </AppShell.Main>
      {noFooter ? null : (
        <AppShell.Footer className={classes.footer}>
          {footer ?? <CommonMobileFooter />}
        </AppShell.Footer>
      )}
    </AppShell>
  );
}
