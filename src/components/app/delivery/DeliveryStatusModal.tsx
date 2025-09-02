import {
  Modal,
  Drawer,
  ScrollArea,
  Text,
  Group,
  Button,
  Stack,
  Alert,
  Textarea,
  TextInput,
} from '@mantine/core';
import { IconAlertTriangle, IconCheck, IconTruck } from '@tabler/icons-react';
import { useState, useMemo } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useDeviceType } from '@/hooks/useDeviceType';
import type { DeliveryRequestDetail } from '@/services/sales/deliveryRequest';
import { formatDate } from '@/utils/time';
import { DRAWER_BODY_PADDING_BOTTOM, DRAWER_HEADER_PADDING } from '@/constants/po.constants';

export type DeliveryModalMode = 'start_transit' | 'complete';

type DeliveryStatusModalProps = {
  readonly opened: boolean;
  readonly mode: DeliveryModalMode;
  readonly deliveryRequest?: DeliveryRequestDetail;
  readonly onClose: () => void;
  readonly onConfirm: (data?: any) => Promise<void>;
};

// Modal configuration based on mode
const getModalConfig = (mode: DeliveryModalMode, t: any) => {
  const configs = {
    start_transit: {
      title: t('delivery.actions.startTransit'),
      description: t('delivery.actions.startTransitDescription'),
      buttonText: t('delivery.actions.startTransit'),
      buttonColor: 'orange',
      icon: <IconTruck size={16} />,
      alertColor: 'orange',
      requiresNotes: false,
    },
    complete: {
      title: t('delivery.completeDelivery'),
      description: t('delivery.completeDeliveryDescription'),
      buttonText: t('delivery.markAsCompleted'),
      buttonColor: 'green',
      icon: <IconCheck size={16} />,
      alertColor: 'green',
      requiresNotes: true,
      notesLabel: t('delivery.completionNotes'),
      notesPlaceholder: t('delivery.enterCompletionNotes'),
    },
  };

  return configs[mode];
};

export function DeliveryStatusModal({
  opened,
  mode,
  deliveryRequest,
  onClose,
  onConfirm,
}: DeliveryStatusModalProps) {
  const { t } = useTranslation();
  const { isMobile } = useDeviceType();
  const [notes, setNotes] = useState('');
  const [recipient, setRecipient] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');

  // Get modal configuration - memoized
  const config = useMemo(() => getModalConfig(mode, t), [mode, t]);

  if (!deliveryRequest) return null;

  const handleConfirm = async () => {
    let data: any = undefined;

    if (mode === 'start_transit') {
      data = {
        transitNotes: notes.trim(),
        startedAt: new Date().toISOString(),
      };
    } else if (mode === 'complete') {
      data = {
        completionNotes: notes.trim(),
        recipient: recipient.trim(),
        deliveredAt: deliveryTime || new Date().toISOString(),
      };
    }

    await onConfirm(data);
    handleClose();
  };

  const handleClose = () => {
    setNotes('');
    setRecipient('');
    setDeliveryTime('');
    onClose();
  };

  // Check if confirm button should be disabled
  const isConfirmDisabled = () => {
    if (mode === 'complete') {
      return !notes.trim() || !recipient.trim();
    }
    return false;
  };

  // Content to be rendered in both Modal and Drawer
  const content = (
    <Stack gap="md">
      <Alert icon={<IconAlertTriangle size={16} />} color={config.alertColor} variant="light">
        {config.description}
      </Alert>

      <div>
        <Text fw={500} mb="xs">
          {t('delivery.deliveryDetails')}
        </Text>
        <Text size="sm" c="dimmed">
          {t('delivery.deliveryId')}: DR-{deliveryRequest.id.slice(-6)}
        </Text>
        <Text size="sm" c="dimmed">
          {t('delivery.fields.poNumber')}: {deliveryRequest.purchaseOrder?.poNumber}
        </Text>
        <Text size="sm" c="dimmed">
          {t('delivery.customerName')}: {deliveryRequest.purchaseOrder?.customer?.name}
        </Text>
        <Text size="sm" c="dimmed">
          {t('delivery.currentStatus')}:{' '}
          {t(`delivery.status.${deliveryRequest.status.toLowerCase()}` as any)}
        </Text>
        {deliveryRequest.scheduledDate && (
          <Text size="sm" c="dimmed">
            {t('delivery.fields.scheduledDate')}: {formatDate(deliveryRequest.scheduledDate)}
          </Text>
        )}
        {/* {deliveryRequest.assignedName && (
          <Text size="sm" c="dimmed">
            {t('delivery.fields.assignedTo')}: {deliveryRequest.assignedName}
          </Text>
        )} */}
      </div>

      {mode === 'start_transit' && (
        <Textarea
          label={t('delivery.transitNotes')}
          placeholder={t('delivery.enterTransitNotes')}
          value={notes}
          onChange={(event) => setNotes(event.currentTarget.value)}
          rows={3}
          description={t('delivery.transitNotesDescription')}
        />
      )}

      {mode === 'complete' && (
        <>
          <TextInput
            label={t('delivery.recipient')}
            placeholder={t('delivery.enterRecipientName')}
            value={recipient}
            onChange={(event) => setRecipient(event.currentTarget.value)}
            required
            description={t('delivery.recipientDescription')}
          />
          <Textarea
            label={t('delivery.completionNotes')}
            placeholder={t('delivery.enterCompletionNotes')}
            value={notes}
            onChange={(event) => setNotes(event.currentTarget.value)}
            rows={3}
            required
            description={t('delivery.completionNotesDescription')}
          />
        </>
      )}

      <Group justify="flex-end">
        <Button variant="outline" onClick={handleClose}>
          {t('common.cancel')}
        </Button>
        <Button
          color={config.buttonColor}
          leftSection={config.icon}
          onClick={handleConfirm}
          disabled={isConfirmDisabled()}
        >
          {config.buttonText}
        </Button>
      </Group>
    </Stack>
  );

  // Use Drawer for mobile, Modal for desktop
  if (isMobile) {
    return (
      <Drawer
        opened={opened}
        onClose={handleClose}
        title={config.title}
        position="bottom"
        size="90%"
        trapFocus
        returnFocus
        styles={{
          body: { paddingBottom: DRAWER_BODY_PADDING_BOTTOM },
          header: { padding: DRAWER_HEADER_PADDING },
        }}
      >
        <ScrollArea h="calc(90% - 80px)" type="never">
          {content}
        </ScrollArea>
      </Drawer>
    );
  }

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={config.title}
      centered
      size="md"
      trapFocus
      returnFocus
    >
      {content}
    </Modal>
  );
}
