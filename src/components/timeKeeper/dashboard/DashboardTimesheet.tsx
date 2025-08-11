import { memo } from 'react';
import { Card, Group, Box, Title, Text } from '@mantine/core';
import { IconClockHour3 } from '@tabler/icons-react';
import { useNavigate } from 'react-router';
import { useTranslation } from '@/hooks/useTranslation';
import { ROUTERS } from '@/config/routeConfig';
import classes from './DashboardTimesheet.module.css';

export const DashboardTimesheet = memo(function DashboardTimesheet() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <Card
      className={classes.primaryCard}
      shadow="md"
      radius="md"
      onClick={() => {
        navigate(ROUTERS.TIME_KEEPER_MY_TIMESHEET);
      }}
      style={{ cursor: 'pointer' }}
    >
      <Group gap="md" wrap="nowrap">
        <IconClockHour3
          color="var(--mantine-color-gray-7)"
          size={46}
          aria-hidden="true"
          stroke={1.5}
        />
        <Box style={{ flex: 1 }}>
          <Group justify="space-between" align="center">
            <Box>
              <Title order={3} size="h3">
                {t('timekeeper.myTimesheet.title')}
              </Title>
              <Text size="sm" c="dimmed" mt={4}>
                {t('timekeeper.myTimesheet.description')}
              </Text>
            </Box>
          </Group>
        </Box>
      </Group>
    </Card>
  );
});
