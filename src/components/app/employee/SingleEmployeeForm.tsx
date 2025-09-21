import {
  Alert,
  Button,
  Card,
  Group,
  NumberInput,
  SegmentedControl,
  Select,
  Stack,
  Switch,
  Text,
  TextInput,
  Transition,
} from '@mantine/core';
import { type UseFormReturnType } from '@mantine/form';
import { IconAlertCircle, IconMail, IconPhone, IconUser } from '@tabler/icons-react';

import { DateInput } from '@/components/common';
import 'dayjs/locale/vi';
import 'dayjs/locale/en';
import { FirstNameAndLastNameInForm } from '@/components/form/FirstNameAndLastNameInForm';
import { useTranslation } from '@/hooks/useTranslation';
import { useDepartmentOptions } from '@/stores/useAppStore';

type SingleEmployeeFormValues = {
  firstName: string;
  lastName: string;
  departmentId?: string;
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
  readonly isLoading: boolean;
  readonly showAlert: boolean;
  readonly error?: string;
  readonly hasWorkType: boolean;
  readonly onSubmit: (values: SingleEmployeeFormValues) => void;
  readonly onCancel: () => void;
  readonly setShowAlert: (show: boolean) => void;
  readonly isEditMode?: boolean;
};

export function SingleEmployeeForm({
  form,
  isLoading,
  showAlert,
  error,
  hasWorkType,
  onSubmit,
  onCancel,
  setShowAlert,
  isEditMode = false,
}: SingleEmployeeFormProps) {
  const { t } = useTranslation();
  const departmentOptions = useDepartmentOptions();
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
            label={t('employee.department')}
            placeholder={t('employee.selectDepartment')}
            data={departmentOptions}
            {...form.getInputProps('departmentId')}
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

          {hasWorkType && (
            <>
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
            </>
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
