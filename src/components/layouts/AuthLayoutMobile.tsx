import { AppShell } from '@mantine/core';
import { Outlet } from 'react-router';
import classes from './AuthLayoutMobile.module.css';
import { CommonMobileFooter, CommonMobileHeader } from '@/components/common';

// @deprecated: This method should not be used any more
export function AuthLayoutMobile() {
  return (
    <AppShell
      header={{ height: 60 }}
      footer={{ height: 60 }}
      padding={0}
      className={classes.mobileLayout}
    >
      <AppShell.Header className={classes.header}>
        <CommonMobileHeader />
      </AppShell.Header>

      <AppShell.Main className={classes.main} my="sm">
        <Outlet />
      </AppShell.Main>

      <AppShell.Footer className={classes.footer}>
        <CommonMobileFooter />
      </AppShell.Footer>
    </AppShell>
  );
}
