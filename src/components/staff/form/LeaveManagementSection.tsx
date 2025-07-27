import {
  Stack,
  Group,
  Text,
  NumberInput,
  Alert,
  Paper,
  Divider,
  SimpleGrid,
} from '@mantine/core';
import {
  IconCalendar,
  IconBeach,
  IconMedicalCross,
  IconCalendarStats,
  IconInfoCircle,
  IconCalculator,
} from '@tabler/icons-react';
import type {UseFormReturnType} from '@mantine/form';
import useTranslation from '@/hooks/useTranslation';
import {VALIDATION_RULES} from '@/services/staff';
import type {StaffFormData} from '@/lib/api/schemas/staff.schemas';
import useIsDarkMode from '@/hooks/useIsDarkMode';

export interface LeaveManagementSectionProps {
  readonly form: UseFormReturnType<StaffFormData>;
}

export function LeaveManagementSection({form}: LeaveManagementSectionProps) {
  const {t} = useTranslation();
  const isDarkMode = useIsDarkMode();
  const isShiftWorker = form.values.workingPattern === 'shift';

  const calculateTotalLeaveBalance = () => {
    return (
      form.values.leaveBalance.vacation +
      form.values.leaveBalance.sick +
      form.values.leaveBalance.other
    );
  };

  const calculateLeaveHours = () => {
    if (!isShiftWorker) return 0;

    const totalDays = calculateTotalLeaveBalance();
    const hoursPerDay =
      form.values.leaveHoursEquivalent ||
      VALIDATION_RULES.leave.hoursPerDay.default;
    return totalDays * hoursPerDay;
  };

  const setDefaultLeaveBalances = () => {
    const bookableDays = form.values.bookableLeaveDays;
    form.setFieldValue('leaveBalance.vacation', Math.floor(bookableDays * 0.8)); // 80% vacation
    form.setFieldValue('leaveBalance.sick', Math.floor(bookableDays * 0.15)); // 15% sick
    form.setFieldValue('leaveBalance.other', Math.floor(bookableDays * 0.05)); // 5% other
  };

  return (
    <Stack gap="lg">
      <div>
        <Text size="lg" fw={600} mb="md">
          {t('staff.leaveManagement.title')}
        </Text>
        <Text size="sm" c="dimmed">
          {t('staff.leaveManagement.description')}
        </Text>
      </div>

      <Paper withBorder p="md" radius="md">
        <Stack gap="md">
          <Group gap="xs">
            <IconCalendarStats size={16} />
            <Text size="sm" fw={500}>
              {t('staff.leaveManagement.annualEntitlement')}
            </Text>
          </Group>

          <NumberInput
            required
            label={t('staff.leaveManagement.bookableLeaveDays')}
            placeholder="20"
            min={VALIDATION_RULES.leave.daysPerYear.min}
            max={VALIDATION_RULES.leave.daysPerYear.max}
            description={t(
              'staff.leaveManagement.bookableLeaveDaysDescription',
            )}
            {...form.getInputProps('bookableLeaveDays')}
          />

          {isShiftWorker ? (
            <>
              <NumberInput
                label={t('staff.leaveManagement.hoursPerDay')}
                placeholder="8"
                min={VALIDATION_RULES.leave.hoursPerDay.min}
                max={VALIDATION_RULES.leave.hoursPerDay.max}
                description={t('staff.leaveManagement.hoursPerDayDescription')}
                {...form.getInputProps('leaveHoursEquivalent')}
              />

              <Alert
                icon={<IconInfoCircle size={16} />}
                color="blue"
                variant="light"
              >
                {t('staff.leaveManagement.shiftWorkerAlert', {
                  hours: form.values.leaveHoursEquivalent || 8,
                })}
              </Alert>
            </>
          ) : null}

          <NumberInput
            label={t('staff.leaveManagement.carryOverDays')}
            placeholder="0"
            min={0}
            max={form.values.bookableLeaveDays}
            description={t('staff.leaveManagement.carryOverDaysDescription')}
            {...form.getInputProps('carryOverDays')}
          />
        </Stack>
      </Paper>

      <Paper withBorder p="md" radius="md">
        <Stack gap="md">
          <Group justify="space-between" align="center">
            <Group gap="xs">
              <IconCalendar size={16} />
              <Text size="sm" fw={500}>
                {t('staff.leaveManagement.currentBalances')}
              </Text>
            </Group>

            <Text
              size="xs"
              c="blue"
              style={{cursor: 'pointer'}}
              onClick={setDefaultLeaveBalances}
            >
              <Group gap={4}>
                <IconCalculator size={12} />
                {t('staff.leaveManagement.setDefaults')}
              </Group>
            </Text>
          </Group>

          <Text size="xs" c="dimmed">
            {t('staff.leaveManagement.balancesDescription')}
          </Text>

          <SimpleGrid cols={3} spacing="md">
            <div>
              <NumberInput
                label={t('staff.leaveManagement.vacationDays')}
                placeholder="0"
                min={0}
                max={form.values.bookableLeaveDays}
                leftSection={<IconBeach size={16} />}
                {...form.getInputProps('leaveBalance.vacation')}
              />
            </div>

            <div>
              <NumberInput
                label={t('staff.leaveManagement.sickDays')}
                placeholder="0"
                min={0}
                max={form.values.bookableLeaveDays}
                leftSection={<IconMedicalCross size={16} />}
                {...form.getInputProps('leaveBalance.sick')}
              />
            </div>

            <div>
              <NumberInput
                label={t('staff.leaveManagement.otherLeave')}
                placeholder="0"
                min={0}
                max={form.values.bookableLeaveDays}
                leftSection={<IconCalendar size={16} />}
                {...form.getInputProps('leaveBalance.other')}
              />
            </div>
          </SimpleGrid>

          <Divider />

          <Group justify="space-between">
            <Text size="sm">{t('staff.leaveManagement.totalBalance')}</Text>
            <Text size="sm" fw={600}>
              {calculateTotalLeaveBalance()} {t('staff.leaveManagement.days')}
              {isShiftWorker
                ? ` (${calculateLeaveHours()} ${t('staff.leaveManagement.hours')})`
                : null}
            </Text>
          </Group>

          <Group justify="space-between">
            <Text size="sm">
              {t('staff.leaveManagement.remainingAllocation')}
            </Text>
            <Text
              size="sm"
              fw={600}
              c={
                form.values.bookableLeaveDays - calculateTotalLeaveBalance() >=
                0
                  ? 'green'
                  : 'red'
              }
            >
              {form.values.bookableLeaveDays - calculateTotalLeaveBalance()}{' '}
              {t('staff.leaveManagement.days')}
            </Text>
          </Group>

          {calculateTotalLeaveBalance() > form.values.bookableLeaveDays && (
            <Alert
              icon={<IconInfoCircle size={16} />}
              color="orange"
              variant="light"
            >
              {t('staff.leaveManagement.balanceExceedsWarning')}
            </Alert>
          )}
        </Stack>
      </Paper>
      <Paper
        withBorder
        p="md"
        radius="md"
        style={{
          backgroundColor: isDarkMode
            ? 'var(--mantine-color-dark-6)'
            : 'var(--mantine-color-green-0)',
        }}
      >
        <Stack gap="xs">
          <Text size="sm" fw={500}>
            {t('staff.leaveManagement.leaveSummary')}
          </Text>

          <Group justify="space-between">
            <Text size="sm">
              {t('staff.leaveManagement.annualEntitlementLabel')}
            </Text>
            <Text size="sm" fw={600}>
              {form.values.bookableLeaveDays} {t('staff.leaveManagement.days')}
            </Text>
          </Group>

          <Group justify="space-between">
            <Text size="sm">
              {t('staff.leaveManagement.currentBalanceLabel')}
            </Text>
            <Text size="sm" fw={600}>
              {calculateTotalLeaveBalance()} {t('staff.leaveManagement.days')}
            </Text>
          </Group>

          {isShiftWorker ? (
            <Group justify="space-between">
              <Text size="sm">{t('staff.leaveManagement.balanceInHours')}</Text>
              <Text size="sm" fw={600}>
                {calculateLeaveHours()} {t('staff.leaveManagement.hours')}
              </Text>
            </Group>
          ) : null}

          <Group justify="space-between">
            <Text size="sm">{t('staff.leaveManagement.carryOverLimit')}</Text>
            <Text size="sm" fw={600}>
              {form.values.carryOverDays} {t('staff.leaveManagement.days')}
            </Text>
          </Group>

          <Group
            justify="space-between"
            pt="xs"
            style={{borderTop: '1px solid var(--mantine-color-green-2)'}}
          >
            <Text size="sm">{t('staff.leaveManagement.availableToTake')}</Text>
            <Text size="sm" fw={600}>
              {Math.max(0, calculateTotalLeaveBalance())}{' '}
              {t('staff.leaveManagement.days')}
            </Text>
          </Group>
        </Stack>
      </Paper>
    </Stack>
  );
}
