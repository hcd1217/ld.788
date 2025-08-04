import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
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
  Text,
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
import { showErrorNotification, showSuccessNotification } from '@/utils/notifications';
import { useTranslation } from '@/hooks/useTranslation';
import { useStaffActions, useStaffStore } from '@/stores/useStaffStore';
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
import type { Staff, StaffFormData } from '@/lib/api/schemas/staff.schemas';

export function EditStaffPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { staffId } = useParams<{ staffId: string }>();
  const [activeStep, setActiveStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [staff, setStaff] = useState<Staff | undefined>(undefined);

  const currentStore = useCurrentStore();
  const { updateStaff, loadStaff } = useStaffActions();
  const staffList = useStaffStore((state) => state.staffs);

  const form = useForm<StaffFormData>({
    initialValues: {
      fullName: '',
      email: '',
      phoneNumber: '',
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
      if (values.fullName && !values.fullName.trim()) {
        errors.fullName = t('validation.fullNameRequired');
      } else if (values.fullName && values.fullName.trim().length < 2) {
        errors.fullName = t('validation.fullNameTooShort');
      }

      if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
        errors.email = t('validation.invalidEmail');
      }

      if (values.phoneNumber && values.phoneNumber.length < 10) {
        errors.phoneNumber = t('validation.phoneTooShort');
      }

      // Working Pattern validation
      if (
        values.hourlyRate !== undefined &&
        (values.hourlyRate < VALIDATION_RULES.hourlyRate.min ||
          values.hourlyRate > VALIDATION_RULES.hourlyRate.max)
      ) {
        errors.hourlyRate = t('validation.hourlyRateRange', {
          min: VALIDATION_RULES.hourlyRate.min,
          max: VALIDATION_RULES.hourlyRate.max,
        });
      }

      if (values.weeklyContractedHours !== undefined) {
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
        values.bookableLeaveDays !== undefined &&
        (values.bookableLeaveDays < 0 ||
          values.bookableLeaveDays > VALIDATION_RULES.leave.daysPerYear.max)
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
      label: 'Basic Information',
      description: 'Name, email, and contact details',
      icon: IconUser,
    },
    {
      label: 'Working Pattern',
      description: 'Hours, rates, and schedule type',
      icon: IconBriefcase,
    },
    {
      label: 'Leave Management',
      description: 'Leave entitlements and balances',
      icon: IconCalendar,
    },
    {
      label: 'Access & Permissions',
      description: 'Role and system permissions',
      icon: IconShield,
    },
  ];

  // Load staff data
  useEffect(() => {
    const loadStaffData = async () => {
      if (!staffId) {
        navigate(ROUTERS.STAFF);
        return;
      }

      try {
        setIsLoading(true);
        // Load staff if not already loaded
        if (currentStore && staffList.length === 0) {
          await loadStaff(currentStore.id);
        }

        const staffData = staffList.find((s) => s.id === staffId);

        if (!staffData) {
          showErrorNotification(
            'Staff Not Found',
            'The requested staff member could not be found.',
          );
          navigate(ROUTERS.STAFF);
          return;
        }

        setStaff(staffData);

        // Populate form with staff data
        form.setValues({
          fullName: staffData.fullName,
          email: staffData.email,
          phoneNumber: staffData.phoneNumber,
          workingPattern: staffData.workingPattern,
          weeklyContractedHours: staffData.weeklyContractedHours,
          defaultWeeklyHours: staffData.defaultWeeklyHours,
          hourlyRate: staffData.hourlyRate,
          overtimeRate: staffData.overtimeRate,
          holidayRate: staffData.holidayRate,
          bookableLeaveDays: staffData.bookableLeaveDays,
          leaveHoursEquivalent: staffData.leaveHoursEquivalent,
          leaveBalance: staffData.leaveBalance,
          carryOverDays: staffData.carryOverDays,
          role: staffData.role,
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : t('staff.loadFailed');

        showErrorNotification('Load Failed', errorMessage);

        navigate(ROUTERS.STAFF);
      } finally {
        setIsLoading(false);
      }
    };

    loadStaffData();
  }, [staffId, navigate, form, currentStore, staffList, loadStaff, t]);

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
    if (!staffId || !staff) {
      return;
    }

    setIsSubmitting(true);
    try {
      if (!currentStore) throw new Error('No store selected');
      const updatedStaff = await updateStaff(currentStore.id, staffId, values);

      showSuccessNotification(
        'Staff Updated',
        `${updatedStaff.fullName} has been updated successfully`,
      );

      navigate(ROUTERS.STAFF);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update staff member';

      showErrorNotification('Update Failed', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Container size="md" mt="xl">
        <LoadingOverlay visible />
      </Container>
    );
  }

  if (!staff || !currentStore) {
    return (
      <Container size="lg" mt="xl">
        <Stack gap="xl">
          <GoBack />
          <Title order={1} ta="center">
            {t('staff.editTitle')}
          </Title>

          <Alert icon={<IconAlertTriangle size={16} />} color="orange" variant="light">
            {t('staff.notFoundOrNoStore')}
          </Alert>
        </Stack>
      </Container>
    );
  }

  return (
    <Container size="md" mt="xl">
      <Stack gap="xl">
        <Group justify="space-between">
          <GoBack />
        </Group>

        <Title order={1} ta="center">
          {t('staff.editTitleWithName', { name: staff.fullName })}
        </Title>

        <Text ta="center" c="dimmed">
          {t('staff.storeName', { name: currentStore.name })}
        </Text>

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
                      {t('staff.updateButton')}
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
