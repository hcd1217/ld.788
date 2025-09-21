import { useMemo } from 'react';

import { useForm } from '@mantine/form';

import { useTranslation } from '@/hooks/useTranslation';
import type { SingleEmployeeFormValues } from '@/utils/employee.utils';
import { isDevelopment } from '@/utils/env';
import { firstName, lastName } from '@/utils/fake';
import { getFormValidators } from '@/utils/validation';

type UseEmployeeFormProps = {
  readonly isEditMode: boolean;
};

export function useEmployeeForm({ isEditMode }: UseEmployeeFormProps) {
  const { t } = useTranslation();

  const getInitialValues = useMemo((): SingleEmployeeFormValues => {
    const emptyValues: SingleEmployeeFormValues = {
      firstName: '',
      lastName: '',
      departmentId: undefined,
      email: undefined,
      phone: undefined,
      workType: undefined,
      monthlySalary: undefined,
      hourlyRate: undefined,
      startDate: undefined,
      endDate: undefined,
      isEndDateEnabled: false,
    };

    if (isEditMode) {
      return emptyValues;
    }

    // Create mode with dev data
    if (isDevelopment) {
      const fName = firstName();
      const lName = lastName();
      return {
        firstName: fName,
        lastName: lName,
        departmentId: undefined,
        email: undefined,
        phone: `0901-${Math.floor(Math.random() * 1e3)}-${Math.floor(Math.random() * 1e3)}`,
        workType: Math.random() > 0.5 ? 'FULL_TIME' : 'PART_TIME',
        monthlySalary: 12000000,
        hourlyRate: 25000,
        startDate: new Date(),
      };
    }

    return emptyValues;
  }, [isEditMode]);

  const form = useForm<SingleEmployeeFormValues>({
    initialValues: getInitialValues,
    validate: {
      ...getFormValidators(t, ['firstName', 'lastName']),
      email: (value) =>
        value && !/^\S+@\S+\.\S+$/.test(value) ? t('validation.invalidEmail') : undefined,
      phone: (value) =>
        value && value.length < 10
          ? t('validation.tooShort', { field: t('common.phone'), length: 10 })
          : undefined,
      monthlySalary: (value, values) => {
        if (!isEditMode && values.workType === 'FULL_TIME' && !value) {
          return t('validation.fieldRequired');
        }
        return undefined;
      },
      hourlyRate: (value, values) => {
        if (!isEditMode && values.workType === 'PART_TIME' && !value) {
          return t('validation.fieldRequired');
        }
        return undefined;
      },
    },
  });

  return form;
}
