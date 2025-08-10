import { Box, Container, Skeleton, Stack, SimpleGrid } from '@mantine/core';
import classes from './DashboardSkeleton.module.css';

export function DashboardSkeleton() {
  return (
    <Box className={classes.container}>
      {/* Header Skeleton */}
      <Box style={{ backgroundColor: 'var(--mantine-color-brand-7)', padding: '24px' }}>
        <Container>
          <Stack gap="md">
            <Skeleton height={56} width={56} radius="md" />
            <Skeleton height={24} width={200} />
            <Skeleton height={16} width={150} />
          </Stack>
        </Container>
      </Box>

      {/* Content Skeleton */}
      <Container className={classes.dashboardContent}>
        {/* Timesheet Card Skeleton */}
        <Box className={classes.overlappingTimesheet}>
          <Skeleton height={100} radius="md" />
        </Box>

        {/* Quick Actions Grid Skeleton */}
        <SimpleGrid cols={2} spacing="sm" mt="md">
          <Skeleton height={120} radius="md" />
          <Skeleton height={120} radius="md" />
          <Skeleton height={120} radius="md" />
          <Skeleton height={120} radius="md" />
        </SimpleGrid>

        {/* Resources Section Skeleton */}
        <Box mt="lg">
          <Stack gap="sm">
            <Skeleton height={80} radius="md" />
            <Skeleton height={80} radius="md" />
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}
