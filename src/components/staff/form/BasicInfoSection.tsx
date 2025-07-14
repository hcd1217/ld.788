import {useEffect, useState} from 'react';
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
import type {UseFormReturnType} from '@mantine/form';
import {useCurrentStore} from '@/stores/useStoreConfigStore';
import type {CreateStaffRequest} from '@/services/staff';

export interface BasicInfoSectionProps {
  readonly form: UseFormReturnType<CreateStaffRequest>;
}

export function BasicInfoSection({form}: BasicInfoSectionProps) {
  const [previewQrCode, setPreviewQrCode] = useState<string>('');
  const [isGeneratingQr, setIsGeneratingQr] = useState(false);
  const currentStore = useCurrentStore();

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
      console.error('Error generating QR code:', error);
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
          Basic Information
        </Text>
        <Text size="sm" c="dimmed">
          Enter the staff member&apos;s personal and contact information.
        </Text>
      </div>

      <Stack gap="md">
        <TextInput
          required
          label="Full Name"
          placeholder="Enter full name"
          leftSection={<IconUser size={16} />}
          {...form.getInputProps('fullName')}
        />

        <Group grow>
          <TextInput
            required
            label="Email Address"
            placeholder="Enter email address"
            leftSection={<IconMail size={16} />}
            type="email"
            {...form.getInputProps('email')}
          />

          <TextInput
            required
            label="Phone Number"
            placeholder="Enter phone number"
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
              Clock-in Access (Preview)
            </Text>
            <Text size="sm" c="dimmed" mb="md">
              This is a preview of what will be generated for the staff member.
              The actual URL will be created when you save the staff member.
            </Text>
          </div>

          <Paper
            withBorder
            p="md"
            radius="md"
            bg="gray.0"
            style={{backgroundColor: 'var(--mantine-color-gray-0)'}}
          >
            <Stack gap="md">
              <Alert
                icon={<IconInfoCircle size={16} />}
                color="blue"
                variant="light"
              >
                The clock-in URL and QR code will be automatically generated
                when you create the staff member.
              </Alert>

              <div>
                <Text size="sm" fw={500} mb="xs">
                  Clock-in URL Preview:
                </Text>
                <Code block>{previewUrl}</Code>

                <CopyButton value={previewUrl}>
                  {({copied, copy}) => (
                    <Button
                      leftSection={
                        copied ? (
                          <IconCheck size={16} />
                        ) : (
                          <IconCopy size={16} />
                        )
                      }
                      color={copied ? 'green' : 'blue'}
                      variant="light"
                      size="xs"
                      mt="xs"
                      onClick={copy}
                    >
                      {copied ? 'Copied!' : 'Copy Preview URL'}
                    </Button>
                  )}
                </CopyButton>
              </div>

              {previewQrCode ? (
                <div>
                  <Text size="sm" fw={500} mb="xs">
                    QR Code Preview:
                  </Text>
                  <Group align="center">
                    <Image
                      src={previewQrCode}
                      alt="Preview QR Code"
                      width={120}
                      height={120}
                      style={{border: '1px solid var(--mantine-color-gray-3)'}}
                    />
                    <Stack gap="xs" style={{flex: 1}}>
                      <Text size="xs" c="dimmed">
                        Staff members can scan this QR code to quickly access
                        their clock-in page.
                      </Text>
                      <Text size="xs" c="dimmed">
                        The QR code can be printed or shared digitally.
                      </Text>
                    </Stack>
                  </Group>
                </div>
              ) : null}

              {isGeneratingQr ? (
                <Group gap="xs">
                  <IconQrcode size={16} />
                  <Text size="xs" c="dimmed">
                    Generating QR code preview...
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
