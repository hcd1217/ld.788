import {useState, useEffect} from 'react';
import {useNavigate, useParams} from 'react-router';
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
import {useForm, type UseFormReturnType} from '@mantine/form';
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
import {useStaffActions} from '@/stores/useStaffStore';
import {useCurrentStore} from '@/stores/useStoreConfigStore';
import {GoBack} from '@/components/common/GoBack';
import {
  BasicInfoSection,
  WorkingPatternSection,
  LeaveManagementSection,
  AccessPermissionSection,
} from '@/components/staff/form';
import {
  VALIDATION_RULES,
  staffService,
  type UpdateStaffRequest,
  type CreateStaffRequest,
  type Staff,
} from '@/services/staff';

export function EditStaffPage() {
  const navigate = useNavigate();
  const {staffId} = useParams<{staffId: string}>();
  const [activeStep, setActiveStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [staff, setStaff] = useState<Staff | undefined>(undefined);
  const isDarkMode = useIsDarkMode();

  const currentStore = useCurrentStore();
  const {updateStaff} = useStaffActions();

  const form = useForm<UpdateStaffRequest>({
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
    },
    validate(values) {
      const errors: Record<string, string> = {};

      // Basic Info validation
      if (values.fullName && !values.fullName.trim()) {
        errors.fullName = 'Full name is required';
      } else if (values.fullName && values.fullName.trim().length < 2) {
        errors.fullName = 'Full name must be at least 2 characters';
      }

      if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
        errors.email = 'Invalid email format';
      }

      if (values.phoneNumber && values.phoneNumber.length < 10) {
        errors.phoneNumber = 'Phone number must be at least 10 digits';
      }

      // Working Pattern validation
      if (
        values.hourlyRate !== undefined &&
        (values.hourlyRate < VALIDATION_RULES.hourlyRate.min ||
          values.hourlyRate > VALIDATION_RULES.hourlyRate.max)
      ) {
        errors.hourlyRate = `Hourly rate must be between $${VALIDATION_RULES.hourlyRate.min} and $${VALIDATION_RULES.hourlyRate.max}`;
      }

      if (values.weeklyContractedHours !== undefined) {
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
        values.bookableLeaveDays !== undefined &&
        (values.bookableLeaveDays < 0 ||
          values.bookableLeaveDays > VALIDATION_RULES.leave.daysPerYear.max)
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

  // Load staff data
  useEffect(() => {
    const loadStaffData = async () => {
      if (!staffId) {
        navigate('/staff');
        return;
      }

      try {
        setIsLoading(true);
        const staffData = await staffService.getStaffById(staffId);

        if (!staffData) {
          notifications.show({
            title: 'Staff Not Found',
            message: 'The requested staff member could not be found.',
            color: 'red',
            icon: <IconAlertTriangle size={16} />,
          });
          navigate('/staff');
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
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to load staff data';

        notifications.show({
          title: 'Load Failed',
          message: errorMessage,
          color: 'red',
          icon: <IconAlertTriangle size={16} />,
        });

        navigate('/staff');
      } finally {
        setIsLoading(false);
      }
    };

    loadStaffData();
  }, [staffId, navigate, form]);

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

  const handleSubmit = async (values: UpdateStaffRequest) => {
    if (!staffId || !staff) {
      return;
    }

    setIsSubmitting(true);
    try {
      const updatedStaff = await updateStaff(staffId, values);

      notifications.show({
        title: 'Staff Updated',
        message: `${updatedStaff.fullName} has been updated successfully`,
        color: isDarkMode ? 'green.7' : 'green.9',
        icon: <IconCheck size={16} />,
      });

      navigate('/staff');
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to update staff member';

      notifications.show({
        title: 'Update Failed',
        message: errorMessage,
        color: 'red',
        icon: <IconAlertTriangle size={16} />,
      });
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
            Edit Staff Member
          </Title>

          <Alert
            icon={<IconAlertTriangle size={16} />}
            color="orange"
            variant="light"
          >
            Staff member not found or no store selected.
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
          Edit Staff Member - {staff.fullName}
        </Title>

        <Text ta="center" c="dimmed">
          Store: {currentStore.name}
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

              <div style={{position: 'relative', minHeight: '400px'}}>
                <LoadingOverlay
                  visible={isSubmitting}
                  overlayProps={{blur: 2}}
                  transitionProps={{duration: 300}}
                />

                {activeStep === 0 && <BasicInfoSection form={form as UseFormReturnType<CreateStaffRequest>} />}

                {activeStep === 1 && <WorkingPatternSection form={form as UseFormReturnType<CreateStaffRequest>} />}

                {activeStep === 2 && <LeaveManagementSection form={form as UseFormReturnType<CreateStaffRequest>} />}

                {activeStep === 3 && <AccessPermissionSection form={form as UseFormReturnType<CreateStaffRequest>} />}
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
                      Update Staff Member
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
