import {useTranslation} from 'react-i18next';
import {Button, Container, Group, Text, Title} from '@mantine/core';
import {useNavigate} from 'react-router';

export function NotFound() {
  const {t} = useTranslation();
  const navigate = useNavigate();
  return (
    <Container size="sm" mt="xl">
      <Title order={1}>{t('errors.notFound')}</Title>
      <Text mt="md" size="lg">
        {t('errors.notFoundDescription')}
      </Text>
      <Group mt="md">
        <Button onClick={() => navigate(-1)}>
          {t('errors.backToPreviousPage')}
        </Button>
        <Button onClick={() => navigate('/')}>
          {t('errors.backToHomePage')}
        </Button>
      </Group>
    </Container>
  );
}
