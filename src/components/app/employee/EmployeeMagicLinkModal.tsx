import {
  Stack,
  Text,
  Image,
  Code,
  Button,
  Title,
  Modal,
  CopyButton,
} from '@mantine/core';
import {IconCopy, IconCheck} from '@tabler/icons-react';
import {useTranslation} from '@/hooks/useTranslation';
import type {Employee} from '@/services/hr/employee';
import {renderFullName} from '@/utils/string';

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
  const {t} = useTranslation();

  return (
    <Modal
      centered
      opened={opened}
      title={
        <Title order={3}>
          {t('employee.magicLinkTitle', {name: renderFullName(employee)})}
        </Title>
      }
      onClose={onClose}
    >
      <Stack gap="md" align="center">
        <Text size="sm" c="dimmed" ta="center">
          {t('employee.magicLinkDescription')}
        </Text>

        {qrCodeData ? (
          <Image src={qrCodeData} alt={t('employee.magicLinkQrAlt')} />
        ) : null}

        <Stack gap="xs" w="100%">
          <Text size="xs" c="dimmed">
            {t('employee.magicLinkUrl')}
          </Text>
          <Code block>{magicLink}</Code>

          <CopyButton value={magicLink}>
            {({copied, copy}) => (
              <Button
                fullWidth
                leftSection={
                  copied ? <IconCheck size={16} /> : <IconCopy size={16} />
                }
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
