import {useState, useRef, useEffect} from 'react';
import {useNavigate} from 'react-router';
import * as XLSX from 'xlsx';
import {
  Button,
  Select,
  Stack,
  Alert,
  Transition,
  Group,
  Card,
  Text,
  Paper,
  Progress,
  Badge,
  Divider,
  Container,
  rem,
} from '@mantine/core';
import {useForm} from '@mantine/form';
import {notifications} from '@mantine/notifications';
import {useDisclosure} from '@mantine/hooks';
import {
  IconAlertCircle,
  IconUser,
  IconFileSpreadsheet,
  IconDownload,
  IconUpload,
  IconCheck,
  IconX,
  IconUsers,
} from '@tabler/icons-react';
import useTranslation from '@/hooks/useTranslation';
import useIsDesktop from '@/hooks/useIsDesktop';
import {getFormValidators} from '@/utils/validation';
import {hrApi} from '@/lib/api';
import type {CreateEmployee} from '@/lib/api/schemas/hr.schemas';
import {
  AppPageTitle,
  AppMobileLayout,
  AppDesktopLayout,
  GoBack,
  Tabs,
} from '@/components/common';
import {FirstNameAndLastNameInForm} from '@/components/form/FirstNameAndLastNameInForm';
import {
  useHrActions,
  useDepartmentList,
  useHrLoading,
  useHrError,
} from '@/stores/useHrStore';
import {nameAndGender} from '@/utils/fake';

type SingleEmployeeFormValues = {
  firstName: string;
  lastName: string;
  departmentId?: string;
};

type ImportResult = {
  summary: {
    total: number;
    success: number;
    failed: number;
  };
  errors?: string[];
};

export function EmployeeCreatePage() {
  const navigate = useNavigate();
  const {t, i18n} = useTranslation();
  const isDesktop = useIsDesktop();
  const departments = useDepartmentList();
  const isLoading = useHrLoading();
  const error = useHrError();
  const {loadDepartments, clearError} = useHrActions();
  const [activeTab, setActiveTab] = useState<string | undefined>('single');

  // Single employee form state
  const [isSingleLoading, setIsSingleLoading] = useState(false);
  const [showSingleAlert, setShowSingleAlert] = useState(false);
  const [singleError, setSingleError] = useState<string | undefined>();

  // Bulk import state
  const [isBulkLoading, setIsBulkLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [file, setFile] = useState<File | undefined>(undefined);
  const [importResult, setImportResult] = useState<ImportResult | undefined>(
    undefined,
  );
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [bulkMounted] = useDisclosure(true);

  const form = useForm<SingleEmployeeFormValues>({
    initialValues: {
      firstName: '',
      lastName: '',
      departmentId: undefined,
    },
    validate: {
      ...getFormValidators(t, ['firstName', 'lastName']),
    },
  });

  // Load departments on mount
  useEffect(() => {
    void loadDepartments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Single employee handlers
  const handleSingleSubmit = async (values: SingleEmployeeFormValues) => {
    try {
      setIsSingleLoading(true);
      setSingleError(undefined);
      setShowSingleAlert(false);

      const employeeData: CreateEmployee = {
        firstName: values.firstName,
        lastName: values.lastName,
        departmentId: values.departmentId,
      };

      await hrApi.addEmployees([employeeData]);

      notifications.show({
        title: t('common.success'),
        message: t('employee.employeeAdded'),
        color: 'green',
        icon: <IconCheck size={16} />,
      });

      navigate('/employees');
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : t('employee.addEmployeeFailed');

      setSingleError(errorMessage);
      setShowSingleAlert(true);

      notifications.show({
        title: t('common.error'),
        message: errorMessage,
        color: 'red',
        icon: <IconAlertCircle size={16} />,
      });
    } finally {
      setIsSingleLoading(false);
    }
  };

  // Bulk import handlers
  const validateFileType = (file: File): boolean => {
    const allowedTypes = ['.csv', '.xlsx', '.xls'];
    const fileExtension = file.name
      .toLowerCase()
      .slice(Math.max(0, file.name.lastIndexOf('.')));
    return allowedTypes.includes(fileExtension);
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);

    const droppedFiles = [...event.dataTransfer.files];
    const excelFile = droppedFiles.find((file) => validateFileType(file));

    if (excelFile) {
      setFile(excelFile);
      setImportResult(undefined);
    } else if (droppedFiles.length > 0) {
      notifications.show({
        title: t('auth.invalidFileType'),
        message: t('employee.pleaseSelectExcelFile'),
        color: 'red',
        icon: <IconX size={16} />,
      });
    }
  };

  const handleFileInputClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (validateFileType(selectedFile)) {
        setFile(selectedFile);
        setImportResult(undefined);
      } else {
        notifications.show({
          title: t('auth.invalidFileType'),
          message: t('employee.pleaseSelectExcelFile'),
          color: 'red',
          icon: <IconX size={16} />,
        });
      }
    }
  };

  const keyMap = {
    firstName: t('common.firstName'),
    lastName: t('common.lastName'),
    department: t('employee.unit'),
    [t('common.firstName')]: 'firstName',
    [t('common.lastName')]: 'lastName',
    [t('employee.unit')]: 'department',
  };

  const generateSampleExcel = () => {
    const isVietnamese = i18n.language === 'vi';
    let sampleData: Array<[string, string, string]> = [
      [keyMap.firstName, keyMap.lastName, keyMap.department],
      ['John', 'Doe', departmentOptions[0]?.label ?? ''],
      ['Jane', 'Smith', departmentOptions[1]?.label ?? ''],
      ['Mike', 'Johnson', departmentOptions[1]?.label ?? ''],
      ['Sarah', 'Wilson', ''],
    ];
    if (isVietnamese) {
      sampleData = departmentOptions.map((option) => {
        const {firstName, lastName} = nameAndGender();
        return [lastName, firstName, option.label];
      });
      const {firstName, lastName} = nameAndGender();
      sampleData.unshift([lastName, firstName, '']);
      // Cspell:disable
      sampleData.unshift(['Họ', 'Tên', 'Bộ phận']);
    } else {
      sampleData = [
        [keyMap.firstName, keyMap.lastName, keyMap.department],
        ['John', 'Doe', departmentOptions[0]?.label ?? ''],
        ['Jane', 'Smith', departmentOptions[1]?.label ?? ''],
        ['Mike', 'Johnson', departmentOptions[1]?.label ?? ''],
        ['Sarah', 'Wilson', ''],
      ];
    }

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(sampleData);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Employees');
    XLSX.writeFile(workbook, 'Danh_sách_mẫu.xlsx');
    // Cspell:enable
  };

  const handleDownloadSample = async () => {
    try {
      setIsDownloading(true);

      notifications.show({
        title: t('common.downloading'),
        message: t('employee.creatingSampleFile'),
        color: 'blue',
        icon: <IconDownload size={16} />,
      });

      await new Promise((resolve) => {
        setTimeout(resolve, 1000);
      });

      generateSampleExcel();

      notifications.show({
        title: t('common.downloadComplete'),
        message: t('employee.sampleFileDownloaded'),
        color: 'green',
        icon: <IconCheck size={16} />,
      });
    } catch {
      notifications.show({
        title: t('common.downloadFailed'),
        message: t('employee.failedToDownloadSample'),
        color: 'red',
        icon: <IconX size={16} />,
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const parseExcelFile = async (file: File): Promise<CreateEmployee[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.addEventListener('load', (event) => {
        try {
          const data = event.target?.result;
          if (!data) {
            reject(new Error(t('common.failedToReadFile')));
            return;
          }

          const workbook = XLSX.read(data, {type: 'array'});
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];

          const sheetData = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
            defval: '',
          }) as string[][];

          if (sheetData.length < 2) {
            reject(new Error(t('employee.fileRequiresHeaderAndData')));
            return;
          }

          const headers = sheetData[0].map((h) =>
            String(h).trim().toLowerCase(),
          );
          const employees: CreateEmployee[] = [];

          for (let index = 1; index < sheetData.length; index++) {
            const values = sheetData[index].map((v) => String(v).trim());

            if (values.every((v) => !v)) continue;

            const employee: CreateEmployee = {
              firstName: '',
              lastName: '',
            };
            const departmentMap = new Map(
              departments.map((el) => [el.name, el.id]),
            );
            for (const [headerIndex, header] of headers.entries()) {
              const value = values[headerIndex];
              if (!value) continue;
              switch (keyMap[header]) {
                case 'firstName': {
                  employee.firstName = value;
                  break;
                }

                case 'lastName': {
                  employee.lastName = value;
                  break;
                }

                case 'department': {
                  employee.departmentId = departmentMap.get(value) ?? undefined;
                  break;
                }

                default: {
                  // Ignore unknown headers
                  break;
                }
              }
            }

            if (employee.firstName && employee.lastName) {
              employees.push(employee);
            }
          }

          resolve(employees);
        } catch (error) {
          reject(
            new Error(
              `${t('common.failedToParseExcel')}: ${
                error instanceof Error
                  ? error.message
                  : t('common.unknownError')
              }`,
            ),
          );
        }
      });

      reader.addEventListener('error', () => {
        reject(new Error(t('common.failedToReadFile')));
      });

      reader.readAsArrayBuffer(file);
    });
  };

  const handleBulkUpload = async () => {
    if (!file) {
      notifications.show({
        title: t('auth.noFileSelected'),
        message: t('employee.pleaseSelectFileFirst'),
        color: 'red',
        icon: <IconX size={16} />,
      });
      return;
    }

    try {
      setIsBulkLoading(true);
      setImportResult(undefined);

      const employees = await parseExcelFile(file);

      if (employees.length === 0) {
        throw new Error(t('employee.noValidEmployeesFound'));
      }

      // Use bulk API for multiple employees
      await hrApi.addBulkEmployees([employees]);

      const result: ImportResult = {
        summary: {
          total: employees.length,
          success: employees.length,
          failed: 0,
        },
      };

      setImportResult(result);

      notifications.show({
        title: t('auth.importSuccess'),
        message: t('employee.importedEmployees', {
          success: result.summary.success,
          total: result.summary.total,
        }),
        color: 'green',
        icon: <IconCheck size={16} />,
      });

      // Navigate back after successful import
      setTimeout(() => {
        navigate('/employees');
      }, 2000);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : t('auth.importFailed');

      const result: ImportResult = {
        summary: {
          total: 0,
          success: 0,
          failed: 0,
        },
        errors: [String(errorMessage)],
      };

      setImportResult(result);

      notifications.show({
        title: t('auth.importFailed'),
        message: String(errorMessage),
        color: 'red',
        icon: <IconAlertCircle size={16} />,
      });
    } finally {
      setIsBulkLoading(false);
    }
  };

  const departmentOptions = departments.map((dept) => ({
    value: dept.id,
    label: dept.name,
  }));

  const renderSingleEmployeeForm = () => (
    <Card withBorder radius="md" p="xl">
      <form onSubmit={form.onSubmit(handleSingleSubmit)}>
        <Stack gap="lg">
          <Transition mounted={showSingleAlert} transition="fade">
            {(styles) => (
              <Alert
                withCloseButton
                style={styles}
                icon={<IconAlertCircle size={16} />}
                color="red"
                variant="light"
                onClose={() => {
                  setShowSingleAlert(false);
                }}
              >
                {singleError || t('common.checkFormErrors')}
              </Alert>
            )}
          </Transition>

          <FirstNameAndLastNameInForm
            form={form}
            isLoading={isSingleLoading}
            setShowAlert={setShowSingleAlert}
          />

          <Select
            searchable
            clearable
            label={t('employee.department')}
            placeholder={t('employee.selectDepartment')}
            data={departmentOptions}
            {...form.getInputProps('departmentId')}
          />

          <Group justify="flex-end">
            <Button
              variant="light"
              disabled={isSingleLoading}
              onClick={() => navigate('/employees')}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              loading={isSingleLoading}
              leftSection={<IconUser size={16} />}
            >
              {t('employee.addEmployee')}
            </Button>
          </Group>
        </Stack>
      </form>
    </Card>
  );

  const renderBulkImportForm = () => (
    <Stack gap="md">
      {/* Download Sample Section */}
      <Paper withBorder shadow="sm" p="lg" radius="md">
        <Stack gap="md">
          <Group>
            <IconFileSpreadsheet
              size={24}
              color="var(--mantine-color-blue-6)"
            />
            <div>
              <Text fw={500} size="lg">
                {t('employee.sampleExcelTemplate')}
              </Text>
              <Text size="sm" c="dimmed">
                {t('employee.sampleExcelDescription')}
              </Text>
            </div>
          </Group>
          <Button
            variant="light"
            color="blue"
            leftSection={<IconDownload size={16} />}
            loading={isDownloading}
            fullWidth={!isDesktop}
            onClick={handleDownloadSample}
          >
            {t('employee.downloadSampleExcel')}
          </Button>
        </Stack>
      </Paper>

      {/* Upload Section */}
      <Paper withBorder shadow="sm" p="lg" radius="md">
        <Stack gap="md">
          <Group>
            <IconUpload size={24} color="var(--mantine-color-green-6)" />
            <div>
              <Text fw={500} size="lg">
                {t('employee.uploadEmployeeFile')}
              </Text>
              <Text size="sm" c="dimmed">
                {t('employee.supportedFormats')}
              </Text>
            </div>
          </Group>

          <Transition mounted={bulkMounted} transition="fade">
            {(styles) => (
              <div style={styles}>
                <Paper
                  withBorder
                  p="xl"
                  radius="md"
                  style={{
                    backgroundColor: isDragOver
                      ? 'var(--mantine-color-gray-0)'
                      : undefined,
                    border: isDragOver
                      ? '2px dashed var(--mantine-color-blue-5)'
                      : '2px dashed var(--mantine-color-gray-3)',
                    cursor: 'pointer',
                    transition: 'all 200ms ease',
                  }}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={handleFileInputClick}
                >
                  <Stack align="center" gap="md">
                    <IconFileSpreadsheet
                      size={48}
                      color="var(--mantine-color-gray-5)"
                    />
                    <div style={{textAlign: 'center'}}>
                      <Text size="lg" fw={500}>
                        {t('common.dragAndDropFile')}
                      </Text>
                      <Text size="sm" c="dimmed">
                        {t('common.orClickToSelect')}
                      </Text>
                    </div>
                  </Stack>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    style={{display: 'none'}}
                    onChange={handleFileInputChange}
                  />
                </Paper>
              </div>
            )}
          </Transition>

          {file ? (
            <Group justify="space-between">
              <Group gap="xs">
                <IconFileSpreadsheet size={20} />
                <Text size="sm">{file.name}</Text>
                <Badge color="green" variant="light">
                  {(file.size / 1024).toFixed(2)} KB
                </Badge>
              </Group>
              <Button
                variant="subtle"
                color="red"
                size="xs"
                onClick={() => {
                  setFile(undefined);
                  setImportResult(undefined);
                }}
              >
                {t('common.remove')}
              </Button>
            </Group>
          ) : null}

          {importResult ? (
            <>
              <Divider />
              <Stack gap="sm">
                <Text fw={500} size="lg">
                  {t('common.importResults')}
                </Text>
                <Progress
                  value={
                    (importResult.summary.success /
                      importResult.summary.total) *
                    100
                  }
                  color={importResult.summary.failed > 0 ? 'yellow' : 'green'}
                  size="xl"
                  radius="md"
                />
                <Group justify="space-between">
                  <Badge
                    color="blue"
                    variant="light"
                    leftSection={<IconUsers size={14} />}
                  >
                    {t('common.total')}: {importResult.summary.total}
                  </Badge>
                  <Badge
                    color="green"
                    variant="light"
                    leftSection={<IconCheck size={14} />}
                  >
                    {t('common.success')}: {importResult.summary.success}
                  </Badge>
                  <Badge
                    color="red"
                    variant="light"
                    leftSection={<IconX size={14} />}
                  >
                    {t('common.failed')}: {importResult.summary.failed}
                  </Badge>
                </Group>
                {importResult.errors && importResult.errors.length > 0 ? (
                  <Alert
                    icon={<IconAlertCircle size={16} />}
                    color="red"
                    variant="light"
                  >
                    {importResult.errors.join(', ')}
                  </Alert>
                ) : null}
              </Stack>
            </>
          ) : null}

          <Group justify="flex-end">
            <Button
              variant="light"
              disabled={isBulkLoading}
              onClick={() => navigate('/employees')}
            >
              {t('common.cancel')}
            </Button>
            <Button
              loading={isBulkLoading}
              disabled={!file}
              leftSection={<IconUpload size={16} />}
              onClick={handleBulkUpload}
            >
              {t('employee.importEmployees')}
            </Button>
          </Group>
        </Stack>
      </Paper>
    </Stack>
  );

  const iconStyle = {width: rem(12), height: rem(12)};

  if (!isDesktop) {
    return (
      <AppMobileLayout
        withLogo
        withGoBack
        isLoading={isLoading}
        error={error}
        clearError={clearError}
        header={<AppPageTitle title={t('employee.addEmployee')} />}
      >
        {renderSingleEmployeeForm()}
      </AppMobileLayout>
    );
  }

  return (
    <AppDesktopLayout
      isLoading={isLoading}
      error={error}
      clearError={clearError}
    >
      <Group justify="space-between" mb="md">
        <GoBack />
      </Group>
      <AppPageTitle title={t('employee.addEmployee')} />

      <Container fluid w="100%">
        <Tabs
          value={activeTab}
          onChange={(value) => {
            if (value) {
              setActiveTab(value);
            }
          }}
        >
          <Tabs.List>
            <Tabs.Tab
              value="single"
              leftSection={<IconUser style={iconStyle} />}
            >
              {t('employee.addSingleEmployee')}
            </Tabs.Tab>
            <Tabs.Tab
              value="bulk"
              leftSection={<IconFileSpreadsheet style={iconStyle} />}
            >
              {t('employee.bulkImportEmployees')}
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="single" pt="xl">
            {renderSingleEmployeeForm()}
          </Tabs.Panel>

          <Tabs.Panel value="bulk" pt="xl">
            {renderBulkImportForm()}
          </Tabs.Panel>
        </Tabs>
      </Container>
    </AppDesktopLayout>
  );
}
