import {useState} from 'react';
import {useNavigate} from 'react-router';
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
import {useForm} from '@mantine/form';
import {notifications} from '@mantine/notifications';
import {
  IconCheck,
  IconAlertTriangle,
  IconUser,
  IconBriefcase,
  IconCalendar,
  IconShield,
} from '@tabler/icons-react';
import {useIsDarkMode} from '@/hooks/useIsDarkMode';
import {useTranslation} from '@/hooks/useTranslation';
import {useStaffActions} from '@/stores/useStaffStore';
import {useCurrentStore} from '@/stores/useStoreConfigStore';
import {GoBack} from '@/components/common/GoBack';
import {
  BasicInfoSection,
  WorkingPatternSection,
  LeaveManagementSection,
  AccessPermissionSection,
} from '@/components/staff/form';
import {VALIDATION_RULES, type CreateStaffRequest} from '@/services/staff';

export function AddStaffPage() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {t} = useTranslation();
  const isDarkMode = useIsDarkMode();

  const currentStore = useCurrentStore();
  const {createStaff} = useStaffActions();

  const form = useForm<CreateStaffRequest>({
    initialValues: {
      storeId: currentStore?.id || '',
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
    },
    validate(values) {
      const errors: Record<string, string> = {};

      // Basic Info validation
      if (!values.fullName.trim()) {
        errors.fullName = 'Full name is required';
      } else if (values.fullName.trim().length < 2) {
        errors.fullName = 'Full name must be at least 2 characters';
      }

      if (!values.email.trim()) {
        errors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
        errors.email = 'Invalid email format';
      }

      if (!values.phoneNumber.trim()) {
        errors.phoneNumber = 'Phone number is required';
      } else if (values.phoneNumber.length < 10) {
        errors.phoneNumber = 'Phone number must be at least 10 digits';
      }

      // Working Pattern validation
      if (
        values.hourlyRate < VALIDATION_RULES.hourlyRate.min ||
        values.hourlyRate > VALIDATION_RULES.hourlyRate.max
      ) {
        errors.hourlyRate = `Hourly rate must be between $${VALIDATION_RULES.hourlyRate.min} and $${VALIDATION_RULES.hourlyRate.max}`;
      }

      const maxHours =
        values.workingPattern === 'fulltime'
          ? VALIDATION_RULES.workingHours.fulltime.max
          : VALIDATION_RULES.workingHours.shift.max;

      if (
        values.weeklyContractedHours < 0 ||
        values.weeklyContractedHours > maxHours
      ) {
        errors.weeklyContractedHours = `Weekly hours must be between 0 and ${maxHours}`;
      }

      if (
        values.workingPattern === 'fulltime' &&
        values.defaultWeeklyHours &&
        (values.defaultWeeklyHours <
          VALIDATION_RULES.workingHours.fulltime.min ||
          values.defaultWeeklyHours >
            VALIDATION_RULES.workingHours.fulltime.max)
      ) {
        errors.defaultWeeklyHours = `Default weekly hours must be between ${VALIDATION_RULES.workingHours.fulltime.min} and ${VALIDATION_RULES.workingHours.fulltime.max}`;
      }

      // Leave Management validation
      if (
        values.bookableLeaveDays < 0 ||
        values.bookableLeaveDays > VALIDATION_RULES.leave.daysPerYear.max
      ) {
        errors.bookableLeaveDays = `Leave days must be between 0 and ${VALIDATION_RULES.leave.daysPerYear.max}`;
      }

      if (
        values.workingPattern === 'shift' &&
        values.leaveHoursEquivalent &&
        (values.leaveHoursEquivalent < VALIDATION_RULES.leave.hoursPerDay.min ||
          values.leaveHoursEquivalent > VALIDATION_RULES.leave.hoursPerDay.max)
      ) {
        errors.leaveHoursEquivalent = `Hours per day must be between ${VALIDATION_RULES.leave.hoursPerDay.min} and ${VALIDATION_RULES.leave.hoursPerDay.max}`;
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

  const validateCurrentStep = () => {
    const errors = form.validate();
    const stepFields = getStepFields(activeStep);
    const stepErrors = Object.keys(errors.errors).filter((field) =>
      stepFields.includes(field),
    );
    return stepErrors.length === 0;
  };

  const getStepFields = (step: number): string[] => {
    switch (step) {
      case 0: {
        return ['fullName', 'email', 'phoneNumber'];
      }

      case 1: {
        return [
          'workingPattern',
          'weeklyContractedHours',
          'defaultWeeklyHours',
          'hourlyRate',
        ];
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

  const handleSubmit = async (values: CreateStaffRequest) => {
    if (!currentStore) {
      notifications.show({
        title: 'Error',
        message: 'No store selected. Please select a store first.',
        color: 'red',
        icon: <IconAlertTriangle size={16} />,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Calculate automatic values
      const finalValues: CreateStaffRequest = {
        ...values,
        storeId: currentStore.id,
        // Calculate overtime and holiday rates if not set
        overtimeRate: values.overtimeRate || values.hourlyRate * 1.5,
        holidayRate: values.holidayRate || values.hourlyRate * 2,
      };

      const newStaff = await createStaff(finalValues);

      notifications.show({
        title: 'Staff Created',
        message: `${newStaff.fullName} has been added successfully`,
        color: isDarkMode ? 'green.7' : 'green.9',
        icon: <IconCheck size={16} />,
      });

      navigate('/staff');
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to create staff member';

      notifications.show({
        title: 'Creation Failed',
        message: errorMessage,
        color: 'red',
        icon: <IconAlertTriangle size={16} />,
      });
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
            Add Staff Member
          </Title>

          <Alert
            icon={<IconAlertTriangle size={16} />}
            color="orange"
            variant="light"
          >
            No store selected. Please select a store first to add staff members.
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
          Add Staff Member - {currentStore.name}
        </Title>

        <Paper shadow="sm" p="xl" radius="md">
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack gap="xl">
              <Stepper active={activeStep} onStepClick={setActiveStep}>
                {steps.map((step, index) => (
                  <Stepper.Step
                    key={step.label}
                    label={step.label}
                    description={step.description}
                    icon={<step.icon size={18} />}
                  />
                ))}
              </Stepper>

              <div style={{position: 'relative', minHeight: '400px'}}>
                <LoadingOverlay
                  visible={isSubmitting}
                  overlayProps={{blur: 2}}
                  transitionProps={{duration: 300}}
                />

                {activeStep === 0 && <BasicInfoSection form={form} />}

                {activeStep === 1 && <WorkingPatternSection form={form} />}

                {activeStep === 2 && <LeaveManagementSection form={form} />}

                {activeStep === 3 && <AccessPermissionSection form={form} />}
              </div>

              <Group justify="space-between" pt="md">
                <Button
                  variant="default"
                  disabled={activeStep === 0}
                  onClick={handleBack}
                >
                  Back
                </Button>

                <Group gap="sm">
                  {activeStep < 3 ? (
                    <Button onClick={handleNext}>Next</Button>
                  ) : (
                    <Button
                      type="submit"
                      loading={isSubmitting}
                      leftSection={<IconCheck size={16} />}
                    >
                      Create Staff Member
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
