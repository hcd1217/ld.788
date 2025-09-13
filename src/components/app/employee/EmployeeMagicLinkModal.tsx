import { useCallback, useState } from 'react';

import { Button, Code, CopyButton, Image, Modal, Stack, Text, Title } from '@mantine/core';
import { IconCheck, IconCopy, IconPhoto } from '@tabler/icons-react';

import { useTranslation } from '@/hooks/useTranslation';
import type { Employee } from '@/services/hr/employee';
import { logError } from '@/utils/logger';
import { showErrorNotification, showSuccessNotification } from '@/utils/notifications';
import { renderFullName } from '@/utils/string';

type EmployeeMagicLinkModalProps = {
  readonly opened: boolean;
  readonly onClose: () => void;
  readonly employee: Employee;
  readonly magicLink: string;
  readonly qrCodeData: string;
};

export function EmployeeMagicLinkModal({
  opened,
  onClose,
  employee,
  magicLink,
  qrCodeData,
}: EmployeeMagicLinkModalProps) {
  const { t } = useTranslation();
  const [copiedImage, setCopiedImage] = useState(false);

  const handleCopyQrCode = useCallback(async () => {
    try {
      // Convert data URL to blob
      const response = await fetch(qrCodeData);
      const blob = await response.blob();

      // Check if browser supports clipboard API for images
      if (!navigator.clipboard || !ClipboardItem) {
        showErrorNotification(
          t('common.errors.notificationTitle'),
          t('employee.copyQrCodeNotSupported'),
        );
        return;
      }

      // Create clipboard item with the image blob
      const clipboardItem = new ClipboardItem({
        [blob.type]: blob,
      });

      // Write to clipboard
      await navigator.clipboard.write([clipboardItem]);

      setCopiedImage(true);
      showSuccessNotification(t('common.success'), t('employee.qrCodeCopied'));

      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopiedImage(false);
      }, 2000);
    } catch (error) {
      logError('Failed to copy QR code:', error, {
        module: 'EmployeeMagicLinkModal',
        action: 'clipboardItem',
      });
      showErrorNotification(t('common.errors.notificationTitle'), t('employee.copyQrCodeFailed'));
    }
  }, [qrCodeData, t]);

  return (
    <Modal
      centered
      opened={opened}
      title={
        <Title order={3}>{t('employee.magicLinkTitle', { name: renderFullName(employee) })}</Title>
      }
      onClose={onClose}
    >
      <Stack gap="md" align="center">
        <Text size="sm" c="dimmed" ta="center">
          {t('employee.magicLinkDescription')}
        </Text>

        {qrCodeData ? (
          <Stack gap="xs" align="center" w="100%">
            <Image src={qrCodeData} alt={t('employee.magicLinkQrAlt')} />
            <Button
              fullWidth
              leftSection={copiedImage ? <IconCheck size={16} /> : <IconPhoto size={16} />}
              color={copiedImage ? 'green' : 'blue'}
              variant="light"
              onClick={handleCopyQrCode}
            >
              {copiedImage ? t('common.copied') : t('employee.copyQrCode')}
            </Button>
          </Stack>
        ) : null}

        <Stack gap="xs" w="100%">
          <Text size="xs" c="dimmed">
            {t('employee.magicLinkUrl')}
          </Text>
          <Code block>{magicLink}</Code>

          <CopyButton value={magicLink}>
            {({ copied, copy }) => (
              <Button
                fullWidth
                leftSection={copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                color={copied ? 'green' : 'blue'}
                variant="light"
                onClick={copy}
              >
                {copied ? t('common.copied') : t('employee.copyMagicLink')}
              </Button>
            )}
          </CopyButton>
        </Stack>
      </Stack>
    </Modal>
  );
}
