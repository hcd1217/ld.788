import {
  Stack,
  Group,
  Text,
  SegmentedControl,
  NumberInput,
  Alert,
  Paper,
  Divider,
} from '@mantine/core';
import {
  IconBriefcase,
  IconClock,
  IconCurrencyDollar,
  IconInfoCircle,
  IconCalculator,
} from '@tabler/icons-react';
import type {UseFormReturnType} from '@mantine/form';
import {VALIDATION_RULES, type CreateStaffRequest} from '@/services/staff';

export interface WorkingPatternSectionProps {
  readonly form: UseFormReturnType<CreateStaffRequest>;
}

export function WorkingPatternSection({form}: WorkingPatternSectionProps) {
  const isFulltime = form.values.workingPattern === 'fulltime';

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const calculateOvertimeRate = () => {
    const overtimeRate = form.values.hourlyRate * 1.5;
    form.setFieldValue('overtimeRate', overtimeRate);
  };

  const calculateHolidayRate = () => {
    const holidayRate = form.values.hourlyRate * 2;
    form.setFieldValue('holidayRate', holidayRate);
  };

  const handlePatternChange = (value: string) => {
    form.setFieldValue('workingPattern', value as 'fulltime' | 'shift');

    // Set default values based on pattern
    if (value === 'fulltime') {
      form.setFieldValue(
        'weeklyContractedHours',
        VALIDATION_RULES.workingHours.fulltime.default,
      );
      form.setFieldValue(
        'defaultWeeklyHours',
        VALIDATION_RULES.workingHours.fulltime.default,
      );
    } else {
      form.setFieldValue('weeklyContractedHours', 32);
      form.setFieldValue('defaultWeeklyHours', undefined);
    }
  };

  return (
    <Stack gap="lg">
      <div>
        <Text size="lg" fw={600} mb="md">
          Working Pattern & Rates
        </Text>
        <Text size="sm" c="dimmed">
          Configure the staff member&apos;s working hours, schedule type, and
          compensation rates.
        </Text>
      </div>

      <div>
        <Text size="sm" fw={500} mb="xs">
          Working Pattern
        </Text>
        <SegmentedControl
          fullWidth
          value={form.values.workingPattern}
          data={[
            {
              label: 'Full-time',
              value: 'fulltime',
            },
            {
              label: 'Shift Worker',
              value: 'shift',
            },
          ]}
          onChange={handlePatternChange}
        />
      </div>

      <Paper withBorder p="md" radius="md">
        <Stack gap="md">
          <Group gap="xs">
            <IconClock size={16} />
            <Text size="sm" fw={500}>
              Working Hours
            </Text>
          </Group>

          {isFulltime ? (
            <>
              <Alert
                icon={<IconInfoCircle size={16} />}
                color="blue"
                variant="light"
              >
                Full-time staff typically work a consistent schedule with
                standard weekly hours.
              </Alert>

              <Group grow>
                <NumberInput
                  required
                  label="Weekly Contracted Hours"
                  placeholder="40"
                  min={VALIDATION_RULES.workingHours.fulltime.min}
                  max={VALIDATION_RULES.workingHours.fulltime.max}
                  {...form.getInputProps('weeklyContractedHours')}
                />

                <NumberInput
                  label="Default Weekly Hours"
                  placeholder="40"
                  min={VALIDATION_RULES.workingHours.fulltime.min}
                  max={VALIDATION_RULES.workingHours.fulltime.max}
                  description="Standard hours for scheduling"
                  {...form.getInputProps('defaultWeeklyHours')}
                />
              </Group>
            </>
          ) : (
            <>
              <Alert
                icon={<IconInfoCircle size={16} />}
                color="green"
                variant="light"
              >
                Shift workers have flexible schedules with variable weekly
                hours.
              </Alert>

              <NumberInput
                required
                label="Weekly Contracted Hours"
                placeholder="32"
                min={VALIDATION_RULES.workingHours.shift.min}
                max={VALIDATION_RULES.workingHours.shift.max}
                description="Maximum contracted hours per week"
                {...form.getInputProps('weeklyContractedHours')}
              />
            </>
          )}
        </Stack>
      </Paper>

      <Paper withBorder p="md" radius="md">
        <Stack gap="md">
          <Group gap="xs">
            <IconCurrencyDollar size={16} />
            <Text size="sm" fw={500}>
              Hourly Rates
            </Text>
          </Group>

          <NumberInput
            fixedDecimalScale
            required
            label="Base Hourly Rate"
            placeholder="15.00"
            min={VALIDATION_RULES.hourlyRate.min}
            max={VALIDATION_RULES.hourlyRate.max}
            decimalScale={2}
            leftSection="$"
            description={`Minimum: ${formatCurrency(VALIDATION_RULES.hourlyRate.min)} | Maximum: ${formatCurrency(VALIDATION_RULES.hourlyRate.max)}`}
            {...form.getInputProps('hourlyRate')}
          />

          <Divider />

          <div>
            <Text size="sm" fw={500} mb="sm">
              Additional Rates (Optional)
            </Text>
            <Text size="xs" c="dimmed" mb="md">
              These rates will be calculated automatically if left empty. You
              can override them with custom values.
            </Text>

            <Group grow>
              <div>
                <NumberInput
                  fixedDecimalScale
                  label="Overtime Rate"
                  placeholder="Auto-calculated"
                  min={0}
                  max={VALIDATION_RULES.hourlyRate.max * 3}
                  decimalScale={2}
                  leftSection="$"
                  description="1.5x base rate"
                  {...form.getInputProps('overtimeRate')}
                />
                <Group gap="xs" mt="xs">
                  <IconCalculator size={14} />
                  <Text
                    size="xs"
                    c="blue"
                    style={{cursor: 'pointer'}}
                    onClick={calculateOvertimeRate}
                  >
                    Auto-calculate (1.5x base)
                  </Text>
                </Group>
              </div>

              <div>
                <NumberInput
                  fixedDecimalScale
                  label="Holiday Rate"
                  placeholder="Auto-calculated"
                  min={0}
                  max={VALIDATION_RULES.hourlyRate.max * 3}
                  decimalScale={2}
                  leftSection="$"
                  description="2.0x base rate"
                  {...form.getInputProps('holidayRate')}
                />
                <Group gap="xs" mt="xs">
                  <IconCalculator size={14} />
                  <Text
                    size="xs"
                    c="blue"
                    style={{cursor: 'pointer'}}
                    onClick={calculateHolidayRate}
                  >
                    Auto-calculate (2.0x base)
                  </Text>
                </Group>
              </div>
            </Group>
          </div>
        </Stack>
      </Paper>

      {form.values.hourlyRate > 0 && (
        <Paper
          withBorder
          p="md"
          radius="md"
          bg="blue.0"
          style={{backgroundColor: 'var(--mantine-color-blue-0)'}}
        >
          <Stack gap="xs">
            <Text size="sm" fw={500}>
              Rate Summary
            </Text>
            <Group justify="space-between">
              <Text size="sm">Base Rate:</Text>
              <Text size="sm" fw={600}>
                {formatCurrency(form.values.hourlyRate)}/hour
              </Text>
            </Group>
            <Group justify="space-between">
              <Text size="sm">Overtime Rate:</Text>
              <Text size="sm" fw={600}>
                {formatCurrency(
                  form.values.overtimeRate || form.values.hourlyRate * 1.5,
                )}
                /hour
              </Text>
            </Group>
            <Group justify="space-between">
              <Text size="sm">Holiday Rate:</Text>
              <Text size="sm" fw={600}>
                {formatCurrency(
                  form.values.holidayRate || form.values.hourlyRate * 2,
                )}
                /hour
              </Text>
            </Group>

            {isFulltime && form.values.defaultWeeklyHours ? (
              <Group
                justify="space-between"
                pt="xs"
                style={{borderTop: '1px solid var(--mantine-color-blue-2)'}}
              >
                <Text size="sm">Weekly Estimate:</Text>
                <Text size="sm" fw={600}>
                  {formatCurrency(
                    form.values.hourlyRate * form.values.defaultWeeklyHours,
                  )}
                  /week
                </Text>
              </Group>
            ) : null}
          </Stack>
        </Paper>
      )}
    </Stack>
  );
}
