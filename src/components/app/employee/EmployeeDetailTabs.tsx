import { Box, ScrollArea, Stack } from '@mantine/core';
import {
  IconClock,
  IconCurrencyDollar,
  IconInfoCircle,
  IconShoppingCart,
} from '@tabler/icons-react';

import { ComingSoonCard, Tabs } from '@/components/common';
import { useTranslation } from '@/hooks/useTranslation';
import type { Employee } from '@/services/hr/employee';

import { EmployeeBasicInfoCard } from './EmployeeBasicInfoCard';
import { EmployeeDangerZone } from './EmployeeDangerZone';

type EmployeeDetailTabsProps = {
  readonly employee: Employee;
  readonly canEdit: boolean;
  readonly canSetPassword?: boolean;
  readonly onEdit: () => void;
  readonly onActivate: () => void;
  readonly onDeactivate: () => void;
  readonly onSetPassword: () => void;
};

export function EmployeeDetailTabs({
  employee,
  canEdit,
  canSetPassword = false,
  onEdit,
  onActivate,
  onDeactivate,
  onSetPassword,
}: EmployeeDetailTabsProps) {
  const { t } = useTranslation();

  return (
    <Tabs defaultValue="info">
      <ScrollArea offsetScrollbars scrollbarSize={4}>
        <Tabs.List>
          <Tabs.Tab value="info" leftSection={<IconInfoCircle size={16} />}>
            {t('employee.basicInformation')}
          </Tabs.Tab>
          <Tabs.Tab value="timesheet" leftSection={<IconClock size={16} />}>
            {t('employee.timesheet')}
          </Tabs.Tab>
          <Tabs.Tab value="salary" leftSection={<IconCurrencyDollar size={16} />}>
            {t('employee.salaryConfig')}
          </Tabs.Tab>
          <Tabs.Tab value="purchasing" leftSection={<IconShoppingCart size={16} />}>
            {t('employee.purchasingOrder')}
          </Tabs.Tab>
        </Tabs.List>
      </ScrollArea>

      <Tabs.Panel value="info" pt="xl">
        <Box
          style={{
            display: 'flex',
            justifyContent: 'center',
            width: '100%',
          }}
        >
          <Box style={{ maxWidth: '800px', width: '100%' }}>
            <Stack gap="xl">
              <EmployeeBasicInfoCard employee={employee} canEdit={canEdit} onEdit={onEdit} />
              <EmployeeDangerZone
                employee={employee}
                canEdit={canEdit}
                canSetPassword={canSetPassword}
                onActivate={onActivate}
                onDeactivate={onDeactivate}
                onSetPassword={onSetPassword}
              />
            </Stack>
          </Box>
        </Box>
      </Tabs.Panel>

      <Tabs.Panel value="timesheet" pt="xl">
        <ComingSoonCard
          icon={<IconClock size={48} color="var(--mantine-color-gray-5)" />}
          title={t('employee.timesheet')}
        />
      </Tabs.Panel>

      <Tabs.Panel value="salary" pt="xl">
        <ComingSoonCard
          icon={<IconCurrencyDollar size={48} color="var(--mantine-color-gray-5)" />}
          title={t('employee.salaryConfig')}
        />
      </Tabs.Panel>

      <Tabs.Panel value="purchasing" pt="xl">
        <ComingSoonCard
          icon={<IconShoppingCart size={48} color="var(--mantine-color-gray-5)" />}
          title={t('employee.purchasingOrder')}
        />
      </Tabs.Panel>
    </Tabs>
  );
}
