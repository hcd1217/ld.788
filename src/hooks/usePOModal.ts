import { useCallback, useState } from 'react';

import type { PurchaseOrder } from '@/services/sales/purchaseOrder';

type ModalType = 'confirm' | 'cancel' | 'process' | 'ship' | 'deliver' | 'refund';

type ModalState = {
  type: ModalType | null;
  isOpen: boolean;
  purchaseOrder: PurchaseOrder | null;
  data?: any;
};

export function usePOModal() {
  const [modalState, setModalState] = useState<ModalState>({
    type: null,
    isOpen: false,
    purchaseOrder: null,
    data: undefined,
  });

  // Open modal with type and PO data
  const openModal = useCallback((type: ModalType, purchaseOrder: PurchaseOrder, data?: any) => {
    setModalState({
      type,
      isOpen: true,
      purchaseOrder,
      data,
    });
  }, []);

  // Close modal and reset state
  const closeModal = useCallback(() => {
    setModalState({
      type: null,
      isOpen: false,
      purchaseOrder: null,
      data: undefined,
    });
  }, []);

  // Check if specific modal is open
  const isModalOpen = useCallback(
    (type: ModalType): boolean => {
      return modalState.type === type && modalState.isOpen;
    },
    [modalState],
  );

  // Get current modal data
  const getModalData = useCallback(() => {
    return {
      purchaseOrder: modalState.purchaseOrder,
      data: modalState.data,
    };
  }, [modalState]);

  return {
    modalState,
    openModal,
    closeModal,
    isModalOpen,
    getModalData,
    // Convenience methods for specific modals
    openConfirmModal: useCallback((po: PurchaseOrder) => openModal('confirm', po), [openModal]),
    openCancelModal: useCallback((po: PurchaseOrder) => openModal('cancel', po), [openModal]),
    openProcessModal: useCallback((po: PurchaseOrder) => openModal('process', po), [openModal]),
    openShipModal: useCallback((po: PurchaseOrder) => openModal('ship', po), [openModal]),
    openDeliverModal: useCallback((po: PurchaseOrder) => openModal('deliver', po), [openModal]),
    openRefundModal: useCallback((po: PurchaseOrder) => openModal('refund', po), [openModal]),
  };
}
