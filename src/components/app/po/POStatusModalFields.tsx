import { Textarea, TextInput } from '@mantine/core';

import { useTranslation } from '@/hooks/useTranslation';

import type { POModalMode } from './POStatusModalConfig';

type POStatusModalFieldsProps = {
  readonly mode: POModalMode;
  readonly reason: string;
  readonly setReason: (value: string) => void;
  readonly deliveryNotes: string;
  readonly setDeliveryNotes: (value: string) => void;
  readonly trackingNumber: string;
  readonly setTrackingNumber: (value: string) => void;
  readonly carrier: string;
  readonly setCarrier: (value: string) => void;
};

export function POStatusModalFields({
  mode,
  reason,
  setReason,
  deliveryNotes,
  setDeliveryNotes,
  trackingNumber,
  setTrackingNumber,
  carrier,
  setCarrier,
}: POStatusModalFieldsProps) {
  const { t } = useTranslation();

  if (mode === 'refund') {
    return (
      <Textarea
        label={t('po.refundReason')}
        placeholder={t('po.enterRefundReason')}
        value={reason}
        onChange={(event) => setReason(event.currentTarget.value)}
        rows={3}
        required
      />
    );
  }

  if (mode === 'cancel') {
    return (
      <Textarea
        label={t('po.cancellationReason')}
        placeholder={t('po.enterCancellationReason')}
        value={reason}
        onChange={(event) => setReason(event.currentTarget.value)}
        rows={3}
        required
      />
    );
  }

  if (mode === 'deliver') {
    return (
      <Textarea
        label={t('po.deliveryNotes')}
        placeholder={t('po.enterDeliveryNotes')}
        value={deliveryNotes}
        onChange={(event) => setDeliveryNotes(event.currentTarget.value)}
        rows={3}
      />
    );
  }

  if (mode === 'ship') {
    return (
      <>
        <TextInput
          label={t('po.trackingNumber')}
          placeholder={t('po.enterTrackingNumber')}
          value={trackingNumber}
          onChange={(event) => setTrackingNumber(event.currentTarget.value)}
        />
        <TextInput
          label={t('po.carrier')}
          placeholder={t('po.enterCarrier')}
          value={carrier}
          onChange={(event) => setCarrier(event.currentTarget.value)}
        />
      </>
    );
  }

  return null;
}
