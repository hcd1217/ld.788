import { useEffect, useState } from 'react';
import {
  Stack,
  Group,
  TextInput,
  Text,
  Paper,
  Code,
  Image,
  CopyButton,
  Button,
  Alert,
  Divider,
} from '@mantine/core';
import {
  IconUser,
  IconMail,
  IconPhone,
  IconQrcode,
  IconCopy,
  IconCheck,
  IconInfoCircle,
} from '@tabler/icons-react';
import CryptoJS from 'crypto-js';
import QRCode from 'qrcode';
import type { UseFormReturnType } from '@mantine/form';
import { useTranslation } from '@/hooks/useTranslation';
import { useCurrentStore } from '@/stores/useStoreConfigStore';
import type { StaffFormData } from '@/lib/api/schemas/staff.schemas';
import { useIsDarkMode } from '@/hooks/useIsDarkMode';
import { logError } from '@/utils/logger';

export interface BasicInfoSectionProps {
  readonly form: UseFormReturnType<StaffFormData>;
}

export function BasicInfoSection({ form }: BasicInfoSectionProps) {
  const { t } = useTranslation();
  const [previewQrCode, setPreviewQrCode] = useState<string>('');
  const [isGeneratingQr, setIsGeneratingQr] = useState(false);
  const currentStore = useCurrentStore();
  const isDarkMode = useIsDarkMode();

  // Generate MD5 hash
  const generateMD5 = (text: string): string => CryptoJS.MD5(text).toString();

  // Generate preview clock-in URL
  const generatePreviewUrl = (fullName: string): string => {
    if (!currentStore || !fullName.trim()) return '';

    // Use full name as temporary ID for preview
    const tempStaffId = fullName.trim().toLowerCase().replaceAll(/\s+/g, '-');
    const storeHash = generateMD5(currentStore.id);
    const staffHash = generateMD5(tempStaffId);

    return `https://app.credo.com/clock-in/${storeHash}/${staffHash}`;
  };

  // Generate QR code for preview
  const generatePreviewQrCode = async (url: string): Promise<string> => {
    if (!url) return '';

    try {
      setIsGeneratingQr(true);
      return await QRCode.toDataURL(url, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });
    } catch (error) {
      logError('Error generating QR code:', error, {
        module: 'BasicInfoSection',
        action: 'staffHash',
      });
      return '';
    } finally {
      setIsGeneratingQr(false);
    }
  };

  const previewUrl = generatePreviewUrl(form.values.fullName);

  // Update QR code when name changes
  useEffect(() => {
    const generateQr = async () => {
      if (previewUrl) {
        const qrCode = await generatePreviewQrCode(previewUrl);
        setPreviewQrCode(qrCode);
      } else {
        setPreviewQrCode('');
      }
    };

    void generateQr();
  }, [previewUrl]);

  return (
    <Stack gap="lg">
      <div>
        <Text size="lg" fw={600} mb="md">
          {t('staff.basicInfo.title')}
        </Text>
        <Text size="sm" c="dimmed">
          {t('staff.basicInfo.description')}
        </Text>
      </div>

      <Stack gap="md">
        <TextInput
          required
          label={t('staff.basicInfo.fullName')}
          placeholder={t('staff.basicInfo.fullNamePlaceholder')}
          leftSection={<IconUser size={16} />}
          {...form.getInputProps('fullName')}
        />

        <Group grow>
          <TextInput
            label={t('staff.basicInfo.email')}
            placeholder={t('staff.basicInfo.emailPlaceholder')}
            leftSection={<IconMail size={16} />}
            type="email"
            {...form.getInputProps('email')}
          />

          <TextInput
            required
            label={t('staff.basicInfo.phone')}
            placeholder={t('staff.basicInfo.phonePlaceholder')}
            leftSection={<IconPhone size={16} />}
            {...form.getInputProps('phoneNumber')}
          />
        </Group>
      </Stack>

      {previewUrl ? (
        <>
          <Divider />

          <div>
            <Text size="md" fw={600} mb="sm">
              {t('staff.basicInfo.clockInPreview.title')}
            </Text>
            <Text size="sm" c="dimmed" mb="md">
              {t('staff.basicInfo.clockInPreview.description')}
            </Text>
          </div>

          <Paper
            withBorder
            p="md"
            radius="md"
            style={{
              backgroundColor: isDarkMode
                ? 'var(--mantine-color-dark-6)'
                : 'var(--mantine-color-gray-0)',
            }}
          >
            <Stack gap="md">
              <Alert icon={<IconInfoCircle size={16} />} color="blue" variant="light">
                {t('staff.basicInfo.clockInPreview.autoGenerateMessage')}
              </Alert>

              <div>
                <Text size="sm" fw={500} mb="xs">
                  {t('staff.basicInfo.clockInPreview.urlLabel')}
                </Text>
                <Code block>{previewUrl}</Code>

                <CopyButton value={previewUrl}>
                  {({ copied, copy }) => (
                    <Button
                      leftSection={copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                      color={copied ? 'green' : 'blue'}
                      variant="light"
                      size="xs"
                      mt="xs"
                      onClick={copy}
                    >
                      {copied
                        ? t('staff.basicInfo.clockInPreview.copied')
                        : t('staff.basicInfo.clockInPreview.copyButton')}
                    </Button>
                  )}
                </CopyButton>
              </div>

              {previewQrCode ? (
                <div>
                  <Text size="sm" fw={500} mb="xs">
                    {t('staff.basicInfo.clockInPreview.qrLabel')}
                  </Text>
                  <Group align="center">
                    <Image
                      src={previewQrCode}
                      alt={t('staff.basicInfo.clockInPreview.qrAlt')}
                      width={120}
                      height={120}
                      style={{ border: '1px solid var(--mantine-color-gray-3)' }}
                    />
                    <Stack gap="xs" style={{ flex: 1 }}>
                      <Text size="xs" c="dimmed">
                        {t('staff.basicInfo.clockInPreview.qrDescription1')}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {t('staff.basicInfo.clockInPreview.qrDescription2')}
                      </Text>
                    </Stack>
                  </Group>
                </div>
              ) : null}

              {isGeneratingQr ? (
                <Group gap="xs">
                  <IconQrcode size={16} />
                  <Text size="xs" c="dimmed">
                    {t('staff.basicInfo.clockInPreview.generatingQr')}
                  </Text>
                </Group>
              ) : null}
            </Stack>
          </Paper>
        </>
      ) : null}
    </Stack>
  );
}
