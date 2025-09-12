import { useCallback } from 'react';

import { useLocation, useNavigate } from 'react-router';

import { ActionIcon, Anchor, Box, Center, rem } from '@mantine/core';
import { IconArrowLeft, IconChevronLeft } from '@tabler/icons-react';

import { ROUTERS } from '@/config/routeConfig';
import { useTranslation } from '@/hooks/useTranslation';

type GoBackProps = {
  readonly variant?: 'anchor' | 'mobile-header' | 'icon';
  readonly label?: string;
  readonly route?: string;
};
export function GoBack({ label, variant = 'anchor', route }: GoBackProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const location = useLocation();
  const goBack = useCallback(() => {
    if (location.key === 'default') {
      route ? navigate(route) : navigate(ROUTERS.HOME);
    } else {
      navigate(-1);
    }
  }, [location.key, navigate, route]);
  if (variant === 'mobile-header' || variant === 'icon') {
    const size = rem(40);
    return (
      <ActionIcon c="gray" size={size} variant="transparent" onClick={goBack}>
        <IconChevronLeft style={{ width: size, height: size }} stroke={1} />
      </ActionIcon>
    );
  }

  if (variant === 'anchor') {
    return (
      <Anchor component="button" type="button" size="sm" onClick={goBack}>
        <Center inline>
          <IconArrowLeft style={{ width: rem(12), height: rem(12) }} stroke={1.5} />
          <Box ml={5}>{label || t('common.backToPreviousPage')}</Box>
        </Center>
      </Anchor>
    );
  }

  return null;
}
