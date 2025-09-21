import { useNavigate } from 'react-router';

import { Group, Stack, Text } from '@mantine/core';

import { SelectableCard } from '@/components/common';
import { ActiveBadge, ContactInfo } from '@/components/common/ui';
import { getEmployeeDetailRoute } from '@/config/routeConfig';
import { useTranslation } from '@/hooks/useTranslation';
import type { Employee } from '@/services/hr/employee';
import { useClientConfig } from '@/stores/useAppStore';
import { formatDate } from '@/utils/string';
import { getEndDateHighlightStyles } from '@/utils/time';

import { WorkTypeBadge } from './WorkTypeBadge';

type EmployeeGridCardProps = {
  readonly employee: Employee;
};

export function EmployeeGridCard({ employee }: EmployeeGridCardProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const clientConfig = useClientConfig();

  const highlightStyles = getEndDateHighlightStyles(employee.endDate, employee.isActive);

  return (
    <SelectableCard
      withBorder
      shadow="sm"
      padding="lg"
      radius="md"
      onClick={() => navigate(getEmployeeDetailRoute(employee.id))}
      style={{
        cursor: 'pointer',
        position: 'relative',
        ...highlightStyles,
      }}
    >
      {/* Status Badge - Absolute positioned */}
      <div
        style={{
          position: 'absolute',
          top: 12,
          right: 12,
          zIndex: 1,
        }}
      >
        <ActiveBadge isActive={employee.isActive} />
      </div>

      <Stack gap="xs">
        {/* Header with name and position */}
        <Group gap="xs" wrap="nowrap">
          <Text fw={500} truncate>
            {employee.fullName}
          </Text>
          {employee?.position ? (
            <Text c="dimmed" size="sm">
              ({employee?.position})
            </Text>
          ) : null}
        </Group>

        {/* Department */}
        {employee.department ? (
          <Text size="sm" c="dimmed">
            {t('employee.department')}: {employee.department}
          </Text>
        ) : null}

        {/* Contact Info */}
        <Group wrap="nowrap">
          <Text size="xs" c="dimmed" fw={500} mb={4}>
            {t('common.contact')}:
          </Text>
          <ContactInfo email={employee.email} phoneNumber={employee.phone} />
        </Group>
        {clientConfig.features?.employee?.workType ? (
          <>
            {/* Work Type */}
            <Group wrap="nowrap">
              <Text size="xs" c="dimmed" fw={500} mb={4}>
                {t('employee.workType')}:
              </Text>
              <WorkTypeBadge workType={employee.workType} />
            </Group>

            {/* Dates Row */}
            <Group gap="md" wrap="wrap">
              {/* Start Date */}
              {employee.startDate ? (
                <div>
                  <Text size="xs" c="dimmed" fw={500} mb={4}>
                    {t('employee.startDate')}:
                  </Text>
                  <Text size="sm">{formatDate(employee.startDate)}</Text>
                </div>
              ) : null}

              {/* End Date */}
              {employee.endDate ? (
                <div>
                  <Text size="xs" c="dimmed" fw={500} mb={4}>
                    {t('employee.endDate')}:
                  </Text>
                  <Text size="sm" c="red.6">
                    {formatDate(employee.endDate)}
                  </Text>
                </div>
              ) : null}
            </Group>
          </>
        ) : null}
      </Stack>
    </SelectableCard>
  );
}
