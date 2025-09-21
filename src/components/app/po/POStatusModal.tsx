import { useMemo, useState } from 'react';

import { Drawer, Modal, ScrollArea } from '@mantine/core';

import { DRAWER_BODY_PADDING_BOTTOM, DRAWER_HEADER_PADDING } from '@/constants/po.constants';
import { useDeviceType } from '@/hooks/useDeviceType';
import { useTranslation } from '@/hooks/useTranslation';
import type { PurchaseOrder } from '@/services/sales/purchaseOrder';

import { getModalConfig, type POModalMode } from './POStatusModalConfig';
import { POStatusModalContent } from './POStatusModalContent';

export type { POModalMode } from './POStatusModalConfig';

type POStatusModalProps = {
  readonly opened: boolean;
  readonly mode: POModalMode;
  readonly purchaseOrder?: PurchaseOrder;
  readonly isLoading?: boolean;
  readonly onClose: () => void;
  readonly onConfirm: (data?: any) => Promise<void>;
};

export function POStatusModal({
  opened,
  mode,
  purchaseOrder,
  isLoading = false,
  onClose,
  onConfirm,
}: POStatusModalProps) {
  const { t } = useTranslation();
  const { isMobile } = useDeviceType();
  const [reason, setReason] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [carrier, setCarrier] = useState('');

  // Get modal configuration - memoized
  const config = useMemo(() => getModalConfig(mode, t), [mode, t]);

  // Check if confirm button should be disabled - moved before early return
  const isConfirmDisabled = useMemo(() => {
    if (mode === 'cancel' || mode === 'refund') {
      return !reason.trim();
    }
    return false;
  }, [mode, reason]);

  // Early return after all hooks
  if (!purchaseOrder) return null;

  const handleConfirm = async () => {
    let data: any = undefined;
    if (mode === 'refund') {
      data = {
        refundReason: reason.trim(),
      };
    } else if (mode === 'cancel') {
      data = { cancelReason: reason.trim() };
    } else if (mode === 'deliver') {
      data = { deliveryNotes: deliveryNotes.trim() };
    } else if (mode === 'ship') {
      data = { trackingNumber: trackingNumber.trim(), carrier: carrier.trim() };
    }
    await onConfirm(data);
    handleClose();
  };

  const handleClose = () => {
    setReason('');
    setDeliveryNotes('');
    setTrackingNumber('');
    setCarrier('');
    onClose();
  };

  // Content to be rendered in both Modal and Drawer
  const content = (
    <POStatusModalContent
      mode={mode}
      config={config}
      purchaseOrder={purchaseOrder}
      isLoading={isLoading}
      reason={reason}
      setReason={setReason}
      deliveryNotes={deliveryNotes}
      setDeliveryNotes={setDeliveryNotes}
      trackingNumber={trackingNumber}
      setTrackingNumber={setTrackingNumber}
      carrier={carrier}
      setCarrier={setCarrier}
      onClose={handleClose}
      onConfirm={handleConfirm}
      isConfirmDisabled={isConfirmDisabled}
    />
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
