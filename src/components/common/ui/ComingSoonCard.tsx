import {Card, Stack, Title, Text} from '@mantine/core';
import useTranslation from '@/hooks/useTranslation';

type ComingSoonCardProps = {
  readonly icon: React.ReactNode;
  readonly title: string;
};

export function ComingSoonCard({icon, title}: ComingSoonCardProps) {
  const {t} = useTranslation();

  return (
    <Card shadow="sm" padding="xl" radius="md">
      <Stack gap="md" align="center">
        {icon}
        <Title order={3} ta="center" c="dimmed">
          {title}
        </Title>
        <Text ta="center" c="dimmed">
          {t('common.comingSoon')}
        </Text>
      </Stack>
    </Card>
  );
}
