import { Accordion, Box, Stack, Text } from '@mantine/core';
import {
  IconClock,
  IconCurrencyDollar,
  IconInfoCircle,
  IconShoppingCart,
} from '@tabler/icons-react';

import { ComingSoonCard } from '@/components/common/ui/ComingSoonCard';
import { useTranslation } from '@/hooks/useTranslation';
import type { Employee } from '@/services/hr/employee';

import { EmployeeBasicInfoCard } from './EmployeeBasicInfoCard';
import { EmployeeDangerZone } from './EmployeeDangerZone';

type EmployeeDetailAccordionProps = {
  readonly employee: Employee;
  readonly canEdit: boolean;
  readonly canSetPassword?: boolean;
  readonly onActivate: () => void;
  readonly onDeactivate: () => void;
  readonly onEdit: () => void;
  readonly onSetPassword: () => void;
};

export function EmployeeDetailAccordion({
  employee,
  canEdit,
  canSetPassword = false,
  onActivate,
  onDeactivate,
  onEdit,
  onSetPassword,
}: EmployeeDetailAccordionProps) {
  const { t } = useTranslation();

  return (
    <Accordion defaultValue="info" chevronPosition="right" p={0}>
      <Accordion.Item value="info">
        <Accordion.Control icon={<IconInfoCircle size={20} />}>
          <Text fw={600}>{t('employee.basicInformation')}</Text>
        </Accordion.Control>
        <Accordion.Panel>
          <Stack gap="xl" pt="md">
            <EmployeeBasicInfoCard employee={employee} canEdit={canEdit} onEdit={onEdit} />
          </Stack>
        </Accordion.Panel>
      </Accordion.Item>

      <Accordion.Item value="timesheet">
        <Accordion.Control icon={<IconClock size={20} />}>
          <Text fw={600}>{t('employee.timesheet')}</Text>
        </Accordion.Control>
        <Accordion.Panel>
          <Box pt="md">
            <ComingSoonCard
              icon={<IconClock size={48} color="var(--mantine-color-gray-5)" />}
              title={t('employee.timesheet')}
            />
          </Box>
        </Accordion.Panel>
      </Accordion.Item>

      <Accordion.Item value="salary">
        <Accordion.Control icon={<IconCurrencyDollar size={20} />}>
          <Text fw={600}>{t('employee.salaryConfig')}</Text>
        </Accordion.Control>
        <Accordion.Panel>
          <Box pt="md">
            <ComingSoonCard
              icon={<IconCurrencyDollar size={48} color="var(--mantine-color-gray-5)" />}
              title={t('employee.salaryConfig')}
            />
          </Box>
        </Accordion.Panel>
      </Accordion.Item>

      <Accordion.Item value="purchasing">
        <Accordion.Control icon={<IconShoppingCart size={20} />}>
          <Text fw={600}>{t('employee.purchasingOrder')}</Text>
        </Accordion.Control>
        <Accordion.Panel>
          <Box pt="md">
            <ComingSoonCard
              icon={<IconShoppingCart size={48} color="var(--mantine-color-gray-5)" />}
              title={t('employee.purchasingOrder')}
            />
          </Box>
        </Accordion.Panel>
      </Accordion.Item>

      <Accordion.Item value="danger-zone">
        <Accordion.Control icon={<IconInfoCircle size={20} />}>
          <Text fw={600}>{t('common.dangerZone')}</Text>
        </Accordion.Control>
        <Accordion.Panel>
          <Stack gap="xl" pt="md">
            <EmployeeDangerZone
              canEdit={canEdit}
              canSetPassword={canSetPassword}
              employee={employee}
              onActivate={onActivate}
              onDeactivate={onDeactivate}
              onSetPassword={onSetPassword}
            />
          </Stack>
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  );
}
