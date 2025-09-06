import { useMemo } from 'react';
import { useForm } from '@mantine/form';
import { useTranslation } from '@/hooks/useTranslation';
import { getFormValidators } from '@/utils/validation';
import { isDevelopment } from '@/utils/env';
import { firstName, lastName, randomElement } from '@/utils/fake';
import type { SingleEmployeeFormValues } from '@/utils/employee.utils';
import type { Unit } from '@/services/hr/employee';

type UseEmployeeFormProps = {
  readonly isEditMode: boolean;
  readonly units: Unit[];
};

export function useEmployeeForm({ isEditMode, units }: UseEmployeeFormProps) {
  const { t } = useTranslation();

  const getInitialValues = useMemo((): SingleEmployeeFormValues => {
    const emptyValues: SingleEmployeeFormValues = {
      firstName: '',
      lastName: '',
      unitId: undefined,
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
        unitId: randomElement(units)?.id,
        email: `${fName.toLowerCase()}.${lName.toLowerCase()}@example.com`,
        phone: `0901-${Math.floor(Math.random() * 1e3)}-${Math.floor(Math.random() * 1e3)}`,
        workType: Math.random() > 0.5 ? 'FULL_TIME' : 'PART_TIME',
        monthlySalary: 12000000,
        hourlyRate: 25000,
        startDate: new Date(),
      };
    }

    return emptyValues;
  }, [isEditMode, units]);

  const form = useForm<SingleEmployeeFormValues>({
    initialValues: getInitialValues,
    validate: {
      ...getFormValidators(t, ['firstName', 'lastName']),
      email: (value) =>
        value && !/^\S+@\S+\.\S+$/.test(value) ? t('validation.invalidEmail') : undefined,
      phone: (value) => (value && value.length < 10 ? t('validation.phoneTooShort') : undefined),
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
