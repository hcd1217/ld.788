import {type ReactNode} from 'react';
import {
  Box,
  Center,
  Container,
  Group,
  Title,
  Text,
  Anchor,
  useMantineTheme,
  useMantineColorScheme,
} from '@mantine/core';
import {Navigate} from 'react-router';
import {LanguageSwitcher} from '@/components/common/LanguageSwitcher';
import {ColorSchemeToggle} from '@/components/common/ColorSchemeToggle';
import {useTranslation} from '@/hooks/useTranslation';
import {useAppStore} from '@/stores/useAppStore';

type GuestLayoutProps = {
  readonly children: ReactNode;
  readonly hasRegisterLink?: boolean;
  readonly title?: string;
};

export function GuestLayout({
  children,
  hasRegisterLink = true,
  title,
}: GuestLayoutProps) {
  const {t} = useTranslation();
  const theme = useMantineTheme();
  const {colorScheme} = useMantineColorScheme();
  const {isAuthenticated} = useAppStore();

  if (isAuthenticated) {
    return <Navigate replace to="/profile" />;
  }

  return (
    <Box
      style={{
        minHeight: '100vh',
        width: '100%',
        backgroundColor:
          colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0],
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Group
        style={{
          position: 'absolute',
          top: '1rem',
          right: '1rem',
          zIndex: 10,
        }}
        gap="sm"
      >
        <ColorSchemeToggle />
        <LanguageSwitcher />
      </Group>
      <Center
        style={{
          minHeight: '100vh',
          width: '100%',
          padding: '1rem',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Container size={420} style={{width: '100%'}}>
          <Group justify="center" gap="md" mb="xl">
            <img
              src="/logo.svg"
              alt="Credo Logo"
              style={{
                width: 48,
                height: 48,
              }}
            />
            <Title
              style={{
                fontWeight: 900,
              }}
              size="h2"
            >
              {title ?? t('auth.title')}
            </Title>
          </Group>
          {hasRegisterLink ? (
            <Text size="sm" ta="center" mb="xl" c="dimmed">
              {t('auth.noAccount')}{' '}
              <Anchor href="/register" size="sm">
                {t('auth.createAccount')}
              </Anchor>
            </Text>
          ) : null}
          {children}
        </Container>
      </Center>
    </Box>
  );
}
