import {
  Group,
  Menu,
  Avatar,
  Text,
  rem,
  UnstyledButton,
  Switch,
  useMantineColorScheme,
  useComputedColorScheme,
} from '@mantine/core';
import {useNavigate} from 'react-router';
import {
  IconUser,
  IconSettings,
  IconLogout,
  IconSun,
  IconMoon,
} from '@tabler/icons-react';
import {VersionInformation} from '@/components/common';
import useTranslation from '@/hooks/useTranslation';
import {useAppStore} from '@/stores/useAppStore';
import {ROUTERS} from '@/config/routeConfig';

export function MobileUserMenu() {
  const navigate = useNavigate();
  const {user, logout} = useAppStore();
  const {t} = useTranslation();
  const {setColorScheme} = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme('light', {
    getInitialValueInEffect: true,
  });
  const userInitials = user
    ? `${(user.email || 'u').charAt(0).toUpperCase()}`
    : 'U';

  const handleLogout = () => {
    logout();
    navigate(ROUTERS.LOGIN);
  };

  return (
    <Menu
      shadow="md"
      width={200}
      position="bottom-end"
      transitionProps={{transition: 'pop-top-right'}}
    >
      <Menu.Target>
        <UnstyledButton>
          <Avatar radius="xl" size="md" color="brand">
            {userInitials}
          </Avatar>
        </UnstyledButton>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>{t('common.account')}</Menu.Label>
        <Menu.Item
          leftSection={<IconUser style={{width: rem(14), height: rem(14)}} />}
          onClick={() => navigate(ROUTERS.PROFILE)}
        >
          {t('common.profile')}
        </Menu.Item>
        <Menu.Item
          leftSection={
            <IconSettings style={{width: rem(14), height: rem(14)}} />
          }
          onClick={() => navigate(ROUTERS.SETTINGS)}
        >
          {t('common.settings')}
        </Menu.Item>

        <Menu.Divider />

        <Menu.Label>{t('common.preferences')}</Menu.Label>
        <Menu.Item closeMenuOnClick={false}>
          <Group justify="space-between">
            <Group gap="xs">
              {computedColorScheme === 'light' ? (
                <IconMoon style={{width: rem(14), height: rem(14)}} />
              ) : (
                <IconSun style={{width: rem(14), height: rem(14)}} />
              )}
              <Text size="sm">{t('common.darkMode')}</Text>
            </Group>
            <Switch
              size="xs"
              checked={computedColorScheme === 'dark'}
              onChange={() =>
                setColorScheme(
                  computedColorScheme === 'light' ? 'dark' : 'light',
                )
              }
            />
          </Group>
        </Menu.Item>

        <Menu.Divider />

        <Menu.Item
          color="red"
          leftSection={<IconLogout style={{width: rem(14), height: rem(14)}} />}
          onClick={handleLogout}
        >
          {t('common.logout')}
        </Menu.Item>
        <VersionInformation />
      </Menu.Dropdown>
    </Menu>
  );
}
