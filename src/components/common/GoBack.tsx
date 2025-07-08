import {Anchor, Box, Center, rem} from '@mantine/core';
import {IconArrowLeft} from '@tabler/icons-react';
import {useNavigate} from 'react-router';
import {useTranslation} from 'react-i18next';

export function GoBack({label}: {readonly label?: string}) {
  const navigate = useNavigate();
  const {t} = useTranslation();

  return (
    <Anchor
      component="button"
      type="button"
      size="sm"
      onClick={() => navigate(-1)}
    >
      <Center inline>
        <IconArrowLeft style={{width: rem(12), height: rem(12)}} stroke={1.5} />
        <Box ml={5}>{label || t('common.backToPreviousPage')}</Box>
      </Center>
    </Anchor>
  );
}
