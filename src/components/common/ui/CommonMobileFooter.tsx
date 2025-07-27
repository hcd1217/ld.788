import {Group, Text, UnstyledButton, Stack} from '@mantine/core';
import {useNavigate} from 'react-router';
import {
  IconLayoutGrid,
  IconHome,
  IconDots,
  IconAddressBook,
} from '@tabler/icons-react';
import classes from './CommonMobileFooter.module.css';
import useTranslation from '@/hooks/useTranslation';

export function CommonMobileFooter() {
  const navigate = useNavigate();
  const {t} = useTranslation();
  const navigationItems = [
    {
      label: t('common.home'),
      icon: IconHome,
      path: '/home',
    },
    {
      label: t('common.employeeManagement'),
      icon: IconAddressBook,
      path: '/employee-management',
    },
    {
      label: t('common.explore'),
      icon: IconLayoutGrid,
      path: '/explore',
    },
    {
      label: t('common.more'),
      icon: IconDots,
      path: '/more',
    },
  ];

  return (
    <Group h="100%" px="xs" justify="space-around">
      {navigationItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;

        return (
          <UnstyledButton
            key={item.path}
            className={`${classes.navItem} ${isActive ? classes.navItemActive : ''}`}
            onClick={() => navigate(item.path)}
          >
            <Stack gap={4} align="center">
              <Icon
                size={24}
                stroke={isActive ? 2.5 : 1.5}
                className={classes.navIcon}
              />
              <Text size="xs" fw={isActive ? 600 : 400}>
                {item.label}
              </Text>
            </Stack>
          </UnstyledButton>
        );
      })}
    </Group>
  );
}
