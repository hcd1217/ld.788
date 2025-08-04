import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Container,
  Title,
  Stack,
  Group,
  Button,
  LoadingOverlay,
  Alert,
  Stepper,
  Paper,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import {
  IconCheck,
  IconAlertTriangle,
  IconUser,
  IconBriefcase,
  IconCalendar,
  IconShield,
} from '@tabler/icons-react';
import { useTranslation } from '@/hooks/useTranslation';
import { showErrorNotification, showSuccessNotification } from '@/utils/notifications';
import { useStaffActions } from '@/stores/useStaffStore';
import { useCurrentStore } from '@/stores/useStoreConfigStore';
import { GoBack } from '@/components/common';
import {
  BasicInfoSection,
  WorkingPatternSection,
  LeaveManagementSection,
  AccessPermissionSection,
} from '@/components/staff/form';
import { VALIDATION_RULES } from '@/services/staff';
import { ROUTERS } from '@/config/routeConfig';
import type { StaffFormData } from '@/lib/api/schemas/staff.schemas';

export function AddStaffPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [activeStep, setActiveStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentStore = useCurrentStore();
  const { createStaff } = useStaffActions();

  const form = useForm<StaffFormData>({
    initialValues: {
      fullName: 'Nguyễn Văn An',
      email: `an.${Date.now()}@example.com`,
      phoneNumber: '0901-123-456',
      workingPattern: 'shift',
      weeklyContractedHours: 32,
      defaultWeeklyHours: 40,
      hourlyRate: VALIDATION_RULES.hourlyRate.min,
      overtimeRate: 0,
      holidayRate: 0,
      bookableLeaveDays: 20,
      leaveHoursEquivalent: 8,
      leaveBalance: {
        vacation: 0,
        sick: 0,
        other: 0,
      },
      carryOverDays: 0,
      role: 'member',
      // Additional fields required by StaffFormData
      status: 'active',
      clockInUrl: '',
      clockInQrCode: '',
      accessPermissions: [],
      isActive: true,
    },
    validate(values) {
      const errors: Record<string, string> = {};

      // Basic Info validation
      if (!values.fullName.trim()) {
        errors.fullName = t('validation.fullNameRequired');
      } else if (values.fullName.trim().length < 2) {
        errors.fullName = t('validation.fullNameTooShort');
      }

      if (!values.email.trim()) {
        errors.email = t('validation.emailRequired');
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
        errors.email = t('validation.invalidEmail');
      }

      if (!values.phoneNumber.trim()) {
        errors.phoneNumber = t('validation.phoneRequired');
      } else if (values.phoneNumber.length < 10) {
        errors.phoneNumber = t('validation.phoneTooShort');
      }

      // Working Pattern validation
      if (
        values.hourlyRate < VALIDATION_RULES.hourlyRate.min ||
        values.hourlyRate > VALIDATION_RULES.hourlyRate.max
      ) {
        errors.hourlyRate = t('validation.hourlyRateRange', {
          min: VALIDATION_RULES.hourlyRate.min,
          max: VALIDATION_RULES.hourlyRate.max,
        });
      }

      const maxHours =
        values.workingPattern === 'fulltime'
          ? VALIDATION_RULES.workingHours.fulltime.max
          : VALIDATION_RULES.workingHours.shift.max;

      if (values.weeklyContractedHours < 0 || values.weeklyContractedHours > maxHours) {
        errors.weeklyContractedHours = t('validation.weeklyHoursRange', {
          min: 0,
          max: maxHours,
        });
      }

      if (
        values.workingPattern === 'fulltime' &&
        values.defaultWeeklyHours &&
        (values.defaultWeeklyHours < VALIDATION_RULES.workingHours.fulltime.min ||
          values.defaultWeeklyHours > VALIDATION_RULES.workingHours.fulltime.max)
      ) {
        errors.defaultWeeklyHours = t('validation.defaultWeeklyHoursRange', {
          min: VALIDATION_RULES.workingHours.fulltime.min,
          max: VALIDATION_RULES.workingHours.fulltime.max,
        });
      }

      // Leave Management validation
      if (
        values.bookableLeaveDays < 0 ||
        values.bookableLeaveDays > VALIDATION_RULES.leave.daysPerYear.max
      ) {
        errors.bookableLeaveDays = t('validation.leaveDaysRange', {
          min: 0,
          max: VALIDATION_RULES.leave.daysPerYear.max,
        });
      }

      if (
        values.workingPattern === 'shift' &&
        values.leaveHoursEquivalent &&
        (values.leaveHoursEquivalent < VALIDATION_RULES.leave.hoursPerDay.min ||
          values.leaveHoursEquivalent > VALIDATION_RULES.leave.hoursPerDay.max)
      ) {
        errors.leaveHoursEquivalent = t('validation.hoursPerDayRange', {
          min: VALIDATION_RULES.leave.hoursPerDay.min,
          max: VALIDATION_RULES.leave.hoursPerDay.max,
        });
      }

      return errors;
    },
  });

  const steps = [
    {
      label: t('staff.steps.basicInfo.label'),
      description: t('staff.steps.basicInfo.description'),
      icon: IconUser,
    },
    {
      label: t('staff.steps.workingPattern.label'),
      description: t('staff.steps.workingPattern.description'),
      icon: IconBriefcase,
    },
    {
      label: t('staff.steps.leaveManagement.label'),
      description: t('staff.steps.leaveManagement.description'),
      icon: IconCalendar,
    },
    {
      label: t('staff.steps.accessPermissions.label'),
      description: t('staff.steps.accessPermissions.description'),
      icon: IconShield,
    },
  ];

  const validateCurrentStep = () => {
    const errors = form.validate();
    const stepFields = getStepFields(activeStep);
    const stepErrors = Object.keys(errors.errors).filter((field) => stepFields.includes(field));
    return stepErrors.length === 0;
  };

  const getStepFields = (step: number): string[] => {
    switch (step) {
      case 0: {
        return ['fullName', 'email', 'phoneNumber'];
      }

      case 1: {
        return ['workingPattern', 'weeklyContractedHours', 'defaultWeeklyHours', 'hourlyRate'];
      }

      case 2: {
        return ['bookableLeaveDays', 'leaveHoursEquivalent', 'carryOverDays'];
      }

      case 3: {
        return ['role'];
      }

      default: {
        return [];
      }
    }
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setActiveStep((current) => (current < 3 ? current + 1 : current));
    }
  };

  const handleBack = () => {
    setActiveStep((current) => (current > 0 ? current - 1 : current));
  };

  const handleSubmit = async (values: StaffFormData) => {
    if (!currentStore) {
      showErrorNotification(t('common.error'), t('staff.noStoreSelectedError'));
      return;
    }

    setIsSubmitting(true);
    try {
      // Calculate automatic values
      const finalValues: StaffFormData = {
        ...values,
        // Calculate overtime and holiday rates if not set
        overtimeRate: values.overtimeRate || values.hourlyRate * 1.5,
        holidayRate: values.holidayRate || values.hourlyRate * 2,
      };

      const newStaff = await createStaff(currentStore.id, finalValues);

      showSuccessNotification(
        t('staff.createSuccess'),
        t('staff.createSuccessMessage', { name: newStaff.fullName }),
      );

      navigate(ROUTERS.STAFF);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t('staff.createFailedDefault');

      showErrorNotification(t('staff.createFailed'), errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentStore) {
    return (
      <Container size="lg" mt="xl">
        <Stack gap="xl">
          <GoBack />
          <Title order={1} ta="center">
            {t('staff.addTitle')}
          </Title>

          <Alert icon={<IconAlertTriangle size={16} />} color="orange" variant="light">
            {t('staff.noStoreSelectedAddError')}
          </Alert>
        </Stack>
      </Container>
    );
  }

  return (
    <Container fluid mt="xl">
      <Stack gap="xl">
        <Group justify="space-between">
          <GoBack />
        </Group>

        <Title order={1} ta="center">
          {t('staff.addTitleWithStore', { storeName: currentStore.name })}
        </Title>

        <Paper shadow="sm" p="xl" radius="md">
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack gap="xl">
              <Stepper active={activeStep} onStepClick={setActiveStep}>
                {steps.map((step) => (
                  <Stepper.Step
                    key={step.label}
                    label={step.label}
                    description={step.description}
                    icon={<step.icon size={18} />}
                  />
                ))}
              </Stepper>

              <div style={{ position: 'relative', minHeight: '400px' }}>
                <LoadingOverlay
                  visible={isSubmitting}
                  overlayProps={{ blur: 2 }}
                  transitionProps={{ duration: 300 }}
                />

                {activeStep === 0 && <BasicInfoSection form={form} />}

                {activeStep === 1 && <WorkingPatternSection form={form} />}

                {activeStep === 2 && <LeaveManagementSection form={form} />}

                {activeStep === 3 && <AccessPermissionSection form={form} />}
              </div>

              <Group justify="space-between" pt="md">
                <Button variant="default" disabled={activeStep === 0} onClick={handleBack}>
                  {t('common.back')}
                </Button>

                <Group gap="sm">
                  {activeStep < 3 ? (
                    <Button onClick={handleNext}>{t('common.next')}</Button>
                  ) : (
                    <Button
                      type="submit"
                      loading={isSubmitting}
                      leftSection={<IconCheck size={16} />}
                    >
                      {t('staff.createButton')}
                    </Button>
                  )}
                </Group>
              </Group>
            </Stack>
          </form>
        </Paper>
      </Stack>
    </Container>
  );
}
