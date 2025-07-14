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
import {VALIDATION_RULES, type CreateStaffRequest} from '@/services/staff';

export interface LeaveManagementSectionProps {
  readonly form: UseFormReturnType<CreateStaffRequest>;
}

export function LeaveManagementSection({form}: LeaveManagementSectionProps) {
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
          Leave Management
        </Text>
        <Text size="sm" c="dimmed">
          Configure leave entitlements, balances, and calculation rules for the
          staff member.
        </Text>
      </div>

      <Paper withBorder p="md" radius="md">
        <Stack gap="md">
          <Group gap="xs">
            <IconCalendarStats size={16} />
            <Text size="sm" fw={500}>
              Annual Leave Entitlement
            </Text>
          </Group>

          <NumberInput
            required
            label="Bookable Leave Days per Year"
            placeholder="20"
            min={VALIDATION_RULES.leave.daysPerYear.min}
            max={VALIDATION_RULES.leave.daysPerYear.max}
            description="Total number of leave days the staff member is entitled to annually"
            {...form.getInputProps('bookableLeaveDays')}
          />

          {isShiftWorker ? (
            <>
              <NumberInput
                label="Hours per Leave Day"
                placeholder="8"
                min={VALIDATION_RULES.leave.hoursPerDay.min}
                max={VALIDATION_RULES.leave.hoursPerDay.max}
                description="Number of working hours equivalent to one leave day"
                {...form.getInputProps('leaveHoursEquivalent')}
              />

              <Alert
                icon={<IconInfoCircle size={16} />}
                color="blue"
                variant="light"
              >
                For shift workers, leave is calculated in hours. Each leave day
                equals {form.values.leaveHoursEquivalent || 8} working hours.
              </Alert>
            </>
          ) : null}

          <NumberInput
            label="Carry-over Days"
            placeholder="0"
            min={0}
            max={form.values.bookableLeaveDays}
            description="Maximum days that can be carried over to the next year"
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
                Current Leave Balances
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
                Set defaults
              </Group>
            </Text>
          </Group>

          <Text size="xs" c="dimmed">
            Enter the current leave balances for this staff member. These will
            be updated as leave is taken.
          </Text>

          <SimpleGrid cols={3} spacing="md">
            <div>
              <NumberInput
                label="Vacation Days"
                placeholder="0"
                min={0}
                max={form.values.bookableLeaveDays}
                leftSection={<IconBeach size={16} />}
                {...form.getInputProps('leaveBalance.vacation')}
              />
            </div>

            <div>
              <NumberInput
                label="Sick Days"
                placeholder="0"
                min={0}
                max={form.values.bookableLeaveDays}
                leftSection={<IconMedicalCross size={16} />}
                {...form.getInputProps('leaveBalance.sick')}
              />
            </div>

            <div>
              <NumberInput
                label="Other Leave"
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
            <Text size="sm">Total Leave Balance:</Text>
            <Text size="sm" fw={600}>
              {calculateTotalLeaveBalance()} days
              {isShiftWorker ? ` (${calculateLeaveHours()} hours)` : null}
            </Text>
          </Group>

          <Group justify="space-between">
            <Text size="sm">Remaining Allocation:</Text>
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
              days
            </Text>
          </Group>

          {calculateTotalLeaveBalance() > form.values.bookableLeaveDays && (
            <Alert
              icon={<IconInfoCircle size={16} />}
              color="orange"
              variant="light"
            >
              Warning: Total leave balance exceeds annual entitlement. Please
              adjust the balances.
            </Alert>
          )}
        </Stack>
      </Paper>

      <Paper
        withBorder
        p="md"
        radius="md"
        bg="green.0"
        style={{backgroundColor: 'var(--mantine-color-green-0)'}}
      >
        <Stack gap="xs">
          <Text size="sm" fw={500}>
            Leave Summary
          </Text>

          <Group justify="space-between">
            <Text size="sm">Annual Entitlement:</Text>
            <Text size="sm" fw={600}>
              {form.values.bookableLeaveDays} days
            </Text>
          </Group>

          <Group justify="space-between">
            <Text size="sm">Current Balance:</Text>
            <Text size="sm" fw={600}>
              {calculateTotalLeaveBalance()} days
            </Text>
          </Group>

          {isShiftWorker ? (
            <Group justify="space-between">
              <Text size="sm">Balance in Hours:</Text>
              <Text size="sm" fw={600}>
                {calculateLeaveHours()} hours
              </Text>
            </Group>
          ) : null}

          <Group justify="space-between">
            <Text size="sm">Carry-over Limit:</Text>
            <Text size="sm" fw={600}>
              {form.values.carryOverDays} days
            </Text>
          </Group>

          <Group
            justify="space-between"
            pt="xs"
            style={{borderTop: '1px solid var(--mantine-color-green-2)'}}
          >
            <Text size="sm">Available to Take:</Text>
            <Text size="sm" fw={600}>
              {Math.max(0, calculateTotalLeaveBalance())} days
            </Text>
          </Group>
        </Stack>
      </Paper>
    </Stack>
  );
}
