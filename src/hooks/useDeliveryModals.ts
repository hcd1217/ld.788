import { useState } from 'react';

import type { DeliveryRequest } from '@/services/sales/deliveryRequest';

type DeliveryModalState = {
  startTransit: boolean;
  complete: boolean;
  uploadPhotos: boolean;
  update: boolean;
};

export function useDeliveryModals() {
  const [modals, setModals] = useState<DeliveryModalState>({
    startTransit: false,
    complete: false,
    uploadPhotos: false,
    update: false,
  });
  const [selectedDeliveryRequest, setSelectedDeliveryRequest] = useState<
    DeliveryRequest | undefined
  >();

  const closeModal = (modalType: keyof DeliveryModalState) => {
    setModals((prev) => ({ ...prev, [modalType]: false }));
    setSelectedDeliveryRequest(undefined);
  };

  const handlers = {
    handleStartTransit: (dr: DeliveryRequest) => {
      setSelectedDeliveryRequest(dr);
      setModals((prev) => ({ ...prev, startTransit: true }));
    },

    handleComplete: (dr: DeliveryRequest) => {
      setSelectedDeliveryRequest(dr);
      setModals((prev) => ({ ...prev, complete: true }));
    },

    handleTakeDeliveryPhoto: (dr: DeliveryRequest) => {
      setSelectedDeliveryRequest(dr);
      setModals((prev) => ({ ...prev, uploadPhotos: true }));
    },

    handleUpdate: (dr: DeliveryRequest) => {
      setSelectedDeliveryRequest(dr);
      setModals((prev) => ({ ...prev, update: true }));
    },
  };

  return {
    modals,
    selectedDeliveryRequest,
    closeModal,
    handlers,
  };
}
