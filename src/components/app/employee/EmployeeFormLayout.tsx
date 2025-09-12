import { type ReactNode } from 'react';

import { Container, Group } from '@mantine/core';

import { AppDesktopLayout, AppMobileLayout, AppPageTitle, GoBack } from '@/components/common';
import { ROUTERS } from '@/config/routeConfig';

type EmployeeFormLayoutProps = {
  readonly isLoading: boolean;
  readonly error?: string;
  readonly clearError: () => void;
  readonly pageTitle: string;
  readonly isEditMode: boolean;
  readonly isMobile: boolean;
  readonly children: ReactNode;
};

export function EmployeeFormLayout({
  isLoading,
  error,
  clearError,
  pageTitle,
  isEditMode,
  isMobile,
  children,
}: EmployeeFormLayoutProps) {
  if (isMobile) {
    return (
      <AppMobileLayout
        showLogo={!isEditMode}
        withGoBack
        goBackRoute={ROUTERS.EMPLOYEE_MANAGEMENT}
        isLoading={isLoading}
        error={error}
        clearError={clearError}
        noFooter
        header={<AppPageTitle fz={isEditMode ? 'h4' : undefined} title={pageTitle} />}
      >
        {children}
      </AppMobileLayout>
    );
  }

  return (
    <AppDesktopLayout isLoading={isLoading} error={error} clearError={clearError}>
      <Group justify="space-between" mb="md">
        <GoBack />
      </Group>
      <AppPageTitle title={pageTitle} />
      <Container fluid w="100%">
        {children}
      </Container>
    </AppDesktopLayout>
  );
}
