import {useState, useRef} from 'react';
import * as XLSX from 'xlsx';
import {Navigate} from 'react-router';
import {
  Button,
  Paper,
  Group,
  Box,
  Stack,
  Transition,
  LoadingOverlay,
  Container,
  Title,
  Text,
  Card,
  Badge,
  Divider,
  Progress,
} from '@mantine/core';
import {notifications} from '@mantine/notifications';
import {
  IconAlertCircle,
  IconFileSpreadsheet,
  IconDownload,
  IconUpload,
  IconCheck,
  IconX,
  IconUsers,
} from '@tabler/icons-react';
import {GoBack} from '@/components/common';
import useTranslation from '@/hooks/useTranslation';
import {useAppStore} from '@/stores/useAppStore';
import {clientService} from '@/services/client';
import type {
  RegisterUserByRootUserRequest,
  RegisterBulkUsersByRootUserResponse,
} from '@/lib/api';

type ImportResult = {
  summary: {
    total: number;
    success: number;
    failed: number;
  };
  details?: RegisterBulkUsersByRootUserResponse;
};

export function ImportUsersPage() {
  const {user} = useAppStore();
  const {t, i18n} = useTranslation();

  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [file, setFile] = useState<File | undefined>(undefined);
  const [importResult, setImportResult] = useState<ImportResult | undefined>(
    undefined,
  );
  const [mounted, setMounted] = useState(true);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Prevent unused variable warning
  void setMounted;

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
    } else if (droppedFiles.length > 0) {
      notifications.show({
        title: t('auth.invalidFileType'),
        message: 'Please select a CSV or Excel file',
        color: 'red',
        icon: <IconX size={16} />,
      });
    }
  };

  const handleFileInputClick = () => {
    fileInputRef.current?.click();
  };

  // Generate sample Excel file
  const generateSampleExcel = () => {
    const isVietnamese = i18n.language === 'vi';
    // Cspell:disable
    const sampleData = isVietnamese
      ? [
          ['lastName', 'firstName', 'email', 'userName', 'password'],
          ['Nguyễn', 'An', 'an.nguyen@example.com', 'nguyen.an', 'MatKhau123!'],
          [
            'Trần',
            'Hương',
            'huong.tran@example.com',
            'tran.huong',
            'BaoMat456!',
          ],
          ['Lê', 'Minh', '', 'le.minh', 'PassCuaToi789!'],
          ['Phạm', 'Mai', 'mai.pham@example.com', '', 'PassManh012!'],
        ]
      : [
          ['firstName', 'lastName', 'email', 'userName', 'password'],
          ['John', 'Doe', 'john.doe@example.com', 'john.doe', 'Password123!'],
          [
            'Jane',
            'Smith',
            'jane.smith@example.com',
            'jane.smith',
            'SecurePass456!',
          ],
          ['Mike', 'Johnson', '', 'mike.johnson', 'MyPassword789!'],
          ['Sarah', 'Wilson', 'sarah.wilson@example.com', '', 'StrongPass012!'],
        ];
    // Cspell:enable

    // Create a new workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(sampleData);

    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');

    // Generate Excel file and download
    XLSX.writeFile(workbook, 'sample_users.xlsx');
  };

  const handleDownloadSample = async () => {
    try {
      setIsDownloading(true);

      notifications.show({
        title: t('auth.downloadingSample'),
        message: 'Creating sample file...',
        color: 'blue',
        icon: <IconDownload size={16} />,
      });

      // Simulate download delay
      await new Promise((resolve) => {
        setTimeout(resolve, 1000);
      });

      generateSampleExcel();

      notifications.show({
        title: 'Download Complete',
        message: 'Sample Excel file downloaded successfully',
        color: 'green',
        icon: <IconCheck size={16} />,
      });
    } catch {
      notifications.show({
        title: 'Download Failed',
        message: 'Failed to download sample file',
        color: 'red',
        icon: <IconX size={16} />,
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const parseExcelFile = async (
    file: File,
  ): Promise<RegisterUserByRootUserRequest[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.addEventListener('load', (event) => {
        try {
          const data = event.target?.result;
          if (!data) {
            reject(new Error('Failed to read file'));
            return;
          }

          // Parse the Excel file
          const workbook = XLSX.read(data, {type: 'array'});
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];

          // Convert sheet to array of arrays
          const sheetData = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
            defval: '',
          }) as string[][];

          if (sheetData.length < 2) {
            reject(
              new Error(
                'File must contain at least a header row and one data row',
              ),
            );
            return;
          }

          const headers = sheetData[0].map((h) =>
            String(h).trim().toLowerCase(),
          );
          const users: RegisterUserByRootUserRequest[] = [];

          for (let index = 1; index < sheetData.length; index++) {
            const values = sheetData[index].map((v) => String(v).trim());

            if (values.every((v) => !v)) continue;

            const user: RegisterUserByRootUserRequest = {
              firstName: '',
              lastName: '',
              password: '',
            };

            for (const [headerIndex, header] of headers.entries()) {
              const value = values[headerIndex];
              if (!value) continue;

              switch (header) {
                case 'firstname': {
                  user.firstName = value;
                  break;
                }

                case 'lastname': {
                  user.lastName = value;
                  break;
                }

                case 'email': {
                  user.email = value;
                  break;
                }

                case 'username': {
                  user.userName = value;
                  break;
                }

                case 'password': {
                  user.password = value;
                  break;
                }

                default: {
                  // Ignore unknown headers
                  break;
                }
              }
            }

            if (user.firstName && user.lastName && user.password) {
              users.push(user);
            }
          }

          resolve(users);
        } catch (error) {
          reject(
            new Error(
              `Failed to parse Excel file: ${
                error instanceof Error ? error.message : 'Unknown error'
              }`,
            ),
          );
        }
      });

      reader.addEventListener('error', () => {
        reject(new Error('Failed to read file'));
      });

      reader.readAsArrayBuffer(file);
    });
  };

  const handleFileUpload = async () => {
    if (!file) {
      notifications.show({
        title: t('auth.noFileSelected'),
        message: 'Please select a file first',
        color: 'red',
        icon: <IconX size={16} />,
      });
      return;
    }

    // Validate file type
    if (!validateFileType(file)) {
      notifications.show({
        title: t('auth.invalidFileType'),
        message: 'Please select a CSV or Excel file',
        color: 'red',
        icon: <IconX size={16} />,
      });
      return;
    }

    try {
      setIsLoading(true);
      setImportResult(undefined);

      // Parse the file
      const users = await parseExcelFile(file);

      if (users.length === 0) {
        throw new Error('No valid users found in the file');
      }

      // Import users using bulk API
      const result = await clientService.registerBulkUsersByRootUser(users);

      setImportResult({
        summary: result.summary,
        details: result,
      });

      notifications.show({
        title: t('auth.importSuccess'),
        message: `Imported ${result.summary.success} out of ${result.summary.total} users`,
        color: result.summary.failed > 0 ? 'yellow' : 'green',
        icon: <IconCheck size={16} />,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : t('auth.importFailed');

      notifications.show({
        title: t('auth.importFailed'),
        message: errorMessage,
        color: 'red',
        icon: <IconAlertCircle size={16} />,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user?.isRoot) {
    return <Navigate to="/home" />;
  }

  return (
    <Container size="sm" mt="xl">
      <Stack gap="xl">
        <Group>
          <GoBack />
        </Group>

        <Title order={1} ta="center">
          {t('auth.importUsersTitle')}
        </Title>

        <Transition
          mounted={mounted}
          transition="slide-up"
          duration={400}
          timingFunction="ease"
        >
          {(styles) => (
            <Stack gap="md" style={styles}>
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
                        {t('auth.sampleExcelTemplate')}
                      </Text>
                      <Text size="sm" c="dimmed">
                        {t('auth.sampleExcelDescription')}
                      </Text>
                    </div>
                  </Group>

                  <Button
                    leftSection={<IconDownload size={16} />}
                    variant="light"
                    loading={isDownloading}
                    onClick={handleDownloadSample}
                  >
                    {t('auth.downloadSample')}
                  </Button>
                </Stack>
              </Paper>

              {/* Upload Section */}
              <Paper
                withBorder
                shadow="sm"
                p="lg"
                radius="md"
                style={{position: 'relative'}}
              >
                <LoadingOverlay
                  visible={isLoading}
                  overlayProps={{blur: 2}}
                  transitionProps={{duration: 300}}
                />

                <Stack gap="md">
                  {/* Drag and Drop Zone */}
                  <Box
                    style={{
                      border: `2px dashed ${
                        isDragOver
                          ? 'var(--mantine-color-green-6)'
                          : 'var(--mantine-color-gray-4)'
                      }`,
                      borderRadius: 'var(--mantine-radius-md)',
                      padding: 'var(--mantine-spacing-xl)',
                      textAlign: 'center',
                      cursor: 'pointer',
                      backgroundColor: isDragOver
                        ? 'var(--mantine-color-green-0)'
                        : 'transparent',
                      transition: 'all 0.2s ease',
                    }}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={handleFileInputClick}
                  >
                    <Stack gap="md" align="center">
                      <IconUpload
                        size={48}
                        color={
                          isDragOver
                            ? 'var(--mantine-color-green-6)'
                            : 'var(--mantine-color-gray-6)'
                        }
                      />
                      <div>
                        <Text fw={500} size="lg">
                          {t('auth.importUsers')}
                        </Text>
                        <Text size="sm" c="dimmed" mt={4}>
                          {t('auth.uploadExcelDescription')}
                        </Text>
                        <Text size="xs" c="dimmed" mt={8}>
                          {t('auth.dragDropText')}
                        </Text>
                      </div>
                      {file ? (
                        <Group gap="xs">
                          <IconFileSpreadsheet size={16} />
                          <Text size="sm" fw={500}>
                            {file.name}
                          </Text>
                        </Group>
                      ) : null}
                    </Stack>
                  </Box>

                  {/* Hidden File Input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    style={{display: 'none'}}
                    onChange={(event) => {
                      const selectedFile = event.target.files?.[0];
                      if (selectedFile && validateFileType(selectedFile)) {
                        setFile(selectedFile);
                      } else if (selectedFile) {
                        notifications.show({
                          title: t('auth.invalidFileType'),
                          message: 'Please select a CSV or Excel file',
                          color: 'red',
                          icon: <IconX size={16} />,
                        });
                      }
                    }}
                  />

                  <Button
                    fullWidth
                    leftSection={<IconUsers size={16} />}
                    loading={isLoading}
                    disabled={!file}
                    size="md"
                    onClick={handleFileUpload}
                  >
                    {t('auth.uploadFile')}
                  </Button>
                </Stack>
              </Paper>

              {/* Import Results */}
              {importResult ? (
                <Paper withBorder shadow="sm" p="lg" radius="md">
                  <Stack gap="md">
                    <Group>
                      <IconCheck
                        size={24}
                        color="var(--mantine-color-green-6)"
                      />
                      <Text fw={500} size="lg">
                        {t('auth.importSummary')}
                      </Text>
                    </Group>

                    <Card withBorder>
                      <Stack gap="sm">
                        <Group justify="space-between">
                          <Text>{t('auth.totalUsers')}</Text>
                          <Badge variant="light" size="lg">
                            {importResult.summary.total}
                          </Badge>
                        </Group>

                        <Group justify="space-between">
                          <Text>{t('auth.successfulImports')}</Text>
                          <Badge color="green" variant="light" size="lg">
                            {importResult.summary.success}
                          </Badge>
                        </Group>

                        <Group justify="space-between">
                          <Text>{t('auth.failedImports')}</Text>
                          <Badge color="red" variant="light" size="lg">
                            {importResult.summary.failed}
                          </Badge>
                        </Group>

                        <Divider mt="sm" />

                        <Progress
                          value={
                            (importResult.summary.success /
                              importResult.summary.total) *
                            100
                          }
                          color={
                            importResult.summary.failed > 0 ? 'yellow' : 'green'
                          }
                          size="lg"
                          mt="sm"
                        />
                      </Stack>
                    </Card>

                    {importResult.summary.failed > 0 &&
                    importResult.details?.errors ? (
                      <Card withBorder>
                        <Text fw={500} mb="sm" c="red">
                          Failed Imports:
                        </Text>
                        <Stack gap="xs">
                          {importResult.details.errors
                            .slice(0, 5)
                            .map((error, index) => (
                              <Text
                                key={`error-${
                                  error.user.email ||
                                  error.user.userName ||
                                  index
                                }`}
                                size="sm"
                                c="dimmed"
                              >
                                {error.user.firstName} {error.user.lastName}:{' '}
                                {error.error}
                              </Text>
                            ))}
                          {importResult.details.errors.length > 5 && (
                            <Text size="sm" c="dimmed">
                              ... and {importResult.details.errors.length - 5}{' '}
                              more
                            </Text>
                          )}
                        </Stack>
                      </Card>
                    ) : null}
                  </Stack>
                </Paper>
              ) : null}
            </Stack>
          )}
        </Transition>
      </Stack>
    </Container>
  );
}
