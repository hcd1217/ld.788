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
import { IconClock, IconCash, IconInfoCircle, IconCalculator } from '@tabler/icons-react';
import type { UseFormReturnType } from '@mantine/form';
import { useTranslation } from '@/hooks/useTranslation';
import { VALIDATION_RULES } from '@/services/staff';
import type { StaffFormData } from '@/lib/api/schemas/staff.schemas';
import { useIsDarkMode } from '@/hooks/useIsDarkMode';

export interface WorkingPatternSectionProps {
  readonly form: UseFormReturnType<StaffFormData>;
}

export function WorkingPatternSection({ form }: WorkingPatternSectionProps) {
  const { t } = useTranslation();
  const isDarkMode = useIsDarkMode();
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
      form.setFieldValue('weeklyContractedHours', VALIDATION_RULES.workingHours.fulltime.default);
      form.setFieldValue('defaultWeeklyHours', VALIDATION_RULES.workingHours.fulltime.default);
    } else {
      form.setFieldValue('weeklyContractedHours', 32);
      form.setFieldValue('defaultWeeklyHours', undefined);
    }
  };

  return (
    <Stack gap="lg">
      <div>
        <Text size="lg" fw={600} mb="md">
          {t('staff.workingPattern.title')}
        </Text>
        <Text size="sm" c="dimmed">
          {t('staff.workingPattern.description')}
        </Text>
      </div>

      <div>
        <Text size="sm" fw={500} mb="xs">
          {t('staff.workingPattern.patternLabel')}
        </Text>
        <SegmentedControl
          fullWidth
          value={form.values.workingPattern}
          data={[
            {
              label: t('staff.workingPattern.fulltime'),
              value: 'fulltime',
            },
            {
              label: t('staff.workingPattern.shiftWorker'),
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
              {t('staff.workingPattern.workingHours')}
            </Text>
          </Group>

          {isFulltime ? (
            <>
              <Alert icon={<IconInfoCircle size={16} />} color="blue" variant="light">
                {t('staff.workingPattern.fulltimeDescription')}
              </Alert>

              <Group grow>
                <NumberInput
                  required
                  label={t('staff.workingPattern.weeklyContractedHours')}
                  placeholder="40"
                  min={VALIDATION_RULES.workingHours.fulltime.min}
                  max={VALIDATION_RULES.workingHours.fulltime.max}
                  {...form.getInputProps('weeklyContractedHours')}
                />

                <NumberInput
                  label={t('staff.workingPattern.defaultWeeklyHours')}
                  placeholder="40"
                  min={VALIDATION_RULES.workingHours.fulltime.min}
                  max={VALIDATION_RULES.workingHours.fulltime.max}
                  description={t('staff.workingPattern.standardHoursDescription')}
                  {...form.getInputProps('defaultWeeklyHours')}
                />
              </Group>
            </>
          ) : (
            <>
              <Alert icon={<IconInfoCircle size={16} />} color="green" variant="light">
                {t('staff.workingPattern.shiftDescription')}
              </Alert>

              <NumberInput
                required
                label={t('staff.workingPattern.weeklyContractedHours')}
                placeholder="32"
                min={VALIDATION_RULES.workingHours.shift.min}
                max={VALIDATION_RULES.workingHours.shift.max}
                description={t('staff.workingPattern.maxContractedHoursDescription')}
                {...form.getInputProps('weeklyContractedHours')}
              />
            </>
          )}
        </Stack>
      </Paper>

      <Paper withBorder p="md" radius="md">
        <Stack gap="md">
          <Group gap="xs">
            <IconCash size={16} />
            <Text size="sm" fw={500}>
              {t('staff.workingPattern.hourlyRates')}
            </Text>
          </Group>

          <NumberInput
            fixedDecimalScale
            required
            label={t('staff.workingPattern.baseHourlyRate')}
            placeholder="15.00"
            min={VALIDATION_RULES.hourlyRate.min}
            max={VALIDATION_RULES.hourlyRate.max}
            decimalScale={2}
            leftSection="đ"
            description={t('staff.workingPattern.rateRange', {
              min: formatCurrency(VALIDATION_RULES.hourlyRate.min),
              max: formatCurrency(VALIDATION_RULES.hourlyRate.max),
            })}
            {...form.getInputProps('hourlyRate')}
          />

          <Divider />

          <div>
            <Text size="sm" fw={500} mb="sm">
              {t('staff.workingPattern.additionalRates')}
            </Text>
            <Text size="xs" c="dimmed" mb="md">
              {t('staff.workingPattern.additionalRatesDescription')}
            </Text>

            <Group grow>
              <div>
                <NumberInput
                  fixedDecimalScale
                  label={t('staff.workingPattern.overtimeRate')}
                  placeholder={t('staff.workingPattern.autoCalculated')}
                  min={0}
                  max={VALIDATION_RULES.hourlyRate.max * 3}
                  decimalScale={2}
                  leftSection="đ"
                  description={t('staff.workingPattern.overtimeDescription')}
                  {...form.getInputProps('overtimeRate')}
                />
                <Group gap="xs" mt="xs">
                  <IconCalculator size={14} />
                  <Text
                    size="xs"
                    c="blue"
                    style={{ cursor: 'pointer' }}
                    onClick={calculateOvertimeRate}
                  >
                    {t('staff.workingPattern.autoCalculateOvertime')}
                  </Text>
                </Group>
              </div>

              <div>
                <NumberInput
                  fixedDecimalScale
                  label={t('staff.workingPattern.holidayRate')}
                  placeholder={t('staff.workingPattern.autoCalculated')}
                  min={0}
                  max={VALIDATION_RULES.hourlyRate.max * 3}
                  decimalScale={2}
                  leftSection="đ"
                  description={t('staff.workingPattern.holidayDescription')}
                  {...form.getInputProps('holidayRate')}
                />
                <Group gap="xs" mt="xs">
                  <IconCalculator size={14} />
                  <Text
                    size="xs"
                    c="blue"
                    style={{ cursor: 'pointer' }}
                    onClick={calculateHolidayRate}
                  >
                    {t('staff.workingPattern.autoCalculateHoliday')}
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
          style={{
            backgroundColor: isDarkMode
              ? 'var(--mantine-color-dark-6)'
              : 'var(--mantine-color-blue-0)',
          }}
        >
          <Stack gap="xs">
            <Text size="sm" fw={500}>
              {t('staff.workingPattern.rateSummary')}
            </Text>
            <Group justify="space-between">
              <Text size="sm">{t('staff.workingPattern.baseRateLabel')}</Text>
              <Text size="sm" fw={600}>
                {formatCurrency(form.values.hourlyRate)}
                {t('staff.workingPattern.perHour')}
              </Text>
            </Group>
            <Group justify="space-between">
              <Text size="sm">{t('staff.workingPattern.overtimeRateLabel')}</Text>
              <Text size="sm" fw={600}>
                {formatCurrency(form.values.overtimeRate || form.values.hourlyRate * 1.5)}
                {t('staff.workingPattern.perHour')}
              </Text>
            </Group>
            <Group justify="space-between">
              <Text size="sm">{t('staff.workingPattern.holidayRateLabel')}</Text>
              <Text size="sm" fw={600}>
                {formatCurrency(form.values.holidayRate || form.values.hourlyRate * 2)}
                {t('staff.workingPattern.perHour')}
              </Text>
            </Group>

            {isFulltime && form.values.defaultWeeklyHours ? (
              <Group
                justify="space-between"
                pt="xs"
                style={{ borderTop: '1px solid var(--mantine-color-blue-2)' }}
              >
                <Text size="sm">{t('staff.workingPattern.weeklyEstimateLabel')}</Text>
                <Text size="sm" fw={600}>
                  {formatCurrency(form.values.hourlyRate * form.values.defaultWeeklyHours)}
                  {t('staff.workingPattern.perWeek')}
                </Text>
              </Group>
            ) : null}
          </Stack>
        </Paper>
      )}
    </Stack>
  );
}
