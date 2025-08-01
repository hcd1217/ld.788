import {
  Button,
  Select,
  Stack,
  Alert,
  Transition,
  Group,
  Card,
} from '@mantine/core';
import type {UseFormReturnType} from '@mantine/form';
import {IconAlertCircle, IconUser} from '@tabler/icons-react';
import {useTranslation} from '@/hooks/useTranslation';
import {FirstNameAndLastNameInForm} from '@/components/form/FirstNameAndLastNameInForm';
import type {Unit} from '@/services/hr/unit';

type SingleEmployeeFormValues = {
  firstName: string;
  lastName: string;
  unitId?: string;
};

type SingleEmployeeFormProps = {
  readonly form: UseFormReturnType<SingleEmployeeFormValues>;
  readonly units: Unit[];
  readonly isLoading: boolean;
  readonly showAlert: boolean;
  readonly error?: string;
  readonly onSubmit: (values: SingleEmployeeFormValues) => void;
  readonly onCancel: () => void;
  readonly setShowAlert: (show: boolean) => void;
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
}: SingleEmployeeFormProps) {
  const {t} = useTranslation();

  const unitOptions = units.map((unit) => ({
    value: unit.id,
    label: unit.name,
  }));

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

          <Group justify="flex-end">
            <Button variant="light" disabled={isLoading} onClick={onCancel}>
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              loading={isLoading}
              leftSection={<IconUser size={16} />}
            >
              {t('employee.addEmployee')}
            </Button>
          </Group>
        </Stack>
      </form>
    </Card>
  );
}
