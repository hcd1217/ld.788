import { ActionIcon, Anchor, Box, Center, rem } from '@mantine/core';
import { IconArrowLeft, IconChevronLeft } from '@tabler/icons-react';
import { useNavigate } from 'react-router';
import { useTranslation } from '@/hooks/useTranslation';

type GoBackProps = {
  readonly variant?: 'anchor' | 'mobile-header';
  readonly label?: string;
  readonly route?: string;
};
export function GoBack({ label, variant = 'anchor', route }: GoBackProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  if (variant === 'mobile-header') {
    const size = rem(40);
    return (
      <ActionIcon
        c="gray"
        size={size}
        variant="transparent"
        onClick={() => {
          route ? navigate(route) : navigate(-1);
        }}
      >
        <IconChevronLeft style={{ width: size, height: size }} stroke={1} />
      </ActionIcon>
    );
  }

  if (variant === 'anchor') {
    return (
      <Anchor
        component="button"
        type="button"
        size="sm"
        onClick={() => {
          route ? navigate(route) : navigate(-1);
        }}
      >
        <Center inline>
          <IconArrowLeft style={{ width: rem(12), height: rem(12) }} stroke={1.5} />
          <Box ml={5}>{label || t('common.backToPreviousPage')}</Box>
        </Center>
      </Anchor>
    );
  }

  return null;
}
