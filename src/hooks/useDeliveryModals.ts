import { useState } from 'react';

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

  const openModal = (modalType: keyof DeliveryModalState) => {
    setModals((prev) => ({ ...prev, [modalType]: true }));
  };

  const closeModal = (modalType: keyof DeliveryModalState) => {
    setModals((prev) => ({ ...prev, [modalType]: false }));
  };

  return {
    modals,
    openModal,
    closeModal,
  };
}
