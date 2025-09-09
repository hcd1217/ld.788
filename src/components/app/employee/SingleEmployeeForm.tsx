import {
  Button,
  Select,
  Stack,
  Alert,
  Transition,
  Group,
  Card,
  TextInput,
  SegmentedControl,
  NumberInput,
  Text,
  Switch,
} from '@mantine/core';
import type { UseFormReturnType } from '@mantine/form';
import { IconAlertCircle, IconUser, IconMail, IconPhone } from '@tabler/icons-react';
import { DateInput } from '@/components/common';
import { useMemo } from 'react';
import 'dayjs/locale/vi';
import 'dayjs/locale/en';
import { useTranslation } from '@/hooks/useTranslation';
import { FirstNameAndLastNameInForm } from '@/components/form/FirstNameAndLastNameInForm';
import type { Unit } from '@/services/hr/employee';

type SingleEmployeeFormValues = {
  firstName: string;
  lastName: string;
  unitId?: string;
  email?: string;
  phone?: string;
  workType?: 'FULL_TIME' | 'PART_TIME';
  monthlySalary?: number;
  hourlyRate?: number;
  startDate?: Date;
  endDate?: Date;
  isEndDateEnabled?: boolean;
};

type SingleEmployeeFormProps = {
  readonly form: UseFormReturnType<SingleEmployeeFormValues>;
  readonly units: readonly Unit[];
  readonly isLoading: boolean;
  readonly showAlert: boolean;
  readonly error?: string;
  readonly onSubmit: (values: SingleEmployeeFormValues) => void;
  readonly onCancel: () => void;
  readonly setShowAlert: (show: boolean) => void;
  readonly isEditMode?: boolean;
};

export function SingleEmployeeForm({
  form,
  units,
  isLoading,
  showAlert,
  error,
  onSubmit,
  onCancel,
  setShowAlert,
  isEditMode = false,
}: SingleEmployeeFormProps) {
  const { t } = useTranslation();

  const unitOptions = useMemo(
    () =>
      units.map((unit) => ({
        value: unit.id,
        label: unit.name,
      })),
    [units],
  );
  return (
    <Card withBorder radius="md" p="xl">
      <form onSubmit={form.onSubmit(onSubmit)}>
        <Stack gap="lg">
          <Transition mounted={showAlert} transition="fade">
            {(styles) => (
              <Alert
                withCloseButton
                style={styles}
                icon={<IconAlertCircle size={16} />}
                color="red"
                variant="light"
                onClose={() => {
                  setShowAlert(false);
                }}
              >
                {error || t('common.checkFormErrors')}
              </Alert>
            )}
          </Transition>
          <FirstNameAndLastNameInForm
            form={form}
            isLoading={isLoading}
            setShowAlert={setShowAlert}
          />
          <Select
            searchable
            clearable
            label={t('employee.unit')}
            placeholder={t('employee.selectUnit')}
            data={unitOptions}
            {...form.getInputProps('unitId')}
          />
          <TextInput
            label={t('common.form.email')}
            placeholder="an@company.com"
            leftSection={<IconMail size={16} />}
            {...form.getInputProps('email')}
          />
          <TextInput
            label={t('employee.phone')}
            placeholder="0901-234-567"
            leftSection={<IconPhone size={16} />}
            {...form.getInputProps('phone')}
          />
          <Stack gap="xs">
            <Text size="sm" fw={500}>
              {t('employee.workType')}
            </Text>
            <SegmentedControl
              data={[
                { label: t('employee.fullTime'), value: 'FULL_TIME' },
                { label: t('employee.partTime'), value: 'PART_TIME' },
              ]}
              {...form.getInputProps('workType')}
            />
          </Stack>

          {form.values.workType === 'FULL_TIME' && (
            <NumberInput
              label={t('employee.monthlySalary')}
              placeholder="12,000,000"
              min={0}
              step={1000000}
              thousandSeparator=","
              leftSection="₫"
              {...form.getInputProps('monthlySalary')}
            />
          )}
          {form.values.workType === 'PART_TIME' && (
            <NumberInput
              label={t('employee.hourlyRate')}
              placeholder="25,000"
              min={0}
              step={1000}
              thousandSeparator=","
              leftSection="₫"
              {...form.getInputProps('hourlyRate')}
            />
          )}
          <DateInput
            label={t('employee.startDate')}
            placeholder={t('employee.startDatePlaceholder')}
            clearable
            {...form.getInputProps('startDate')}
          />
          {isEditMode && (
            <Switch
              label={t('employee.updateEndDate')}
              description={t('employee.updateEndDateDescription')}
              {...form.getInputProps('isEndDateEnabled', { type: 'checkbox' })}
            />
          )}
          {isEditMode && form.values.isEndDateEnabled && (
            <DateInput
              label={t('employee.endDate')}
              placeholder={t('employee.endDatePlaceholder')}
              clearable
              {...form.getInputProps('endDate')}
            />
          )}
          <Group justify="flex-end">
            <Button variant="light" disabled={isLoading} onClick={onCancel}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" loading={isLoading} leftSection={<IconUser size={16} />}>
              {isEditMode ? t('employee.updateEmployee') : t('employee.addEmployee')}
            </Button>
          </Group>
        </Stack>
      </form>
    </Card>
  );
}
