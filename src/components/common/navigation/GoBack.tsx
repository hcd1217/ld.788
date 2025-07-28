import {ActionIcon, Anchor, Box, Center, rem} from '@mantine/core';
import {IconArrowLeft, IconChevronLeft} from '@tabler/icons-react';
import {useNavigate} from 'react-router';
import {useTranslation} from 'react-i18next';

type GoBackProps = {
  readonly variant?: 'anchor' | 'mobile-header';
  readonly label?: string;
};
export function GoBack({label, variant = 'anchor'}: GoBackProps) {
  const navigate = useNavigate();
  const {t} = useTranslation();

  if (variant === 'mobile-header') {
    const size = rem(50);
    return (
      <ActionIcon
        size={size}
        variant="transparent"
        onClick={() => navigate(-1)}
      >
        <IconChevronLeft style={{width: size, height: size}} stroke={2} />
      </ActionIcon>
    );
  }

  if (variant === 'anchor') {
    return (
      <Anchor
        component="button"
        type="button"
        size="sm"
        onClick={() => navigate(-1)}
      >
        <Center inline>
          <IconArrowLeft
            style={{width: rem(12), height: rem(12)}}
            stroke={1.5}
          />
          <Box ml={5}>{label || t('common.backToPreviousPage')}</Box>
        </Center>
      </Anchor>
    );
  }

  return null;
}
