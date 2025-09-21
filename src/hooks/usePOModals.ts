import { useCallback, useState } from 'react';

import { useDisclosure } from '@mantine/hooks';

import type { PurchaseOrder } from '@/services/sales/purchaseOrder';

export type ModalType =
  | 'confirm'
  | 'process'
  | 'markReady'
  | 'ship'
  | 'deliver'
  | 'cancel'
  | 'refund'
  | 'uploadPhotos';

export function usePOModals() {
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | undefined>(undefined);
  const [activeModal, setActiveModal] = useState<ModalType | null>(null);

  // Modal states
  const [confirmModalOpened, { open: openConfirmModal, close: closeConfirmModal }] =
    useDisclosure(false);
  const [processModalOpened, { open: openProcessModal, close: closeProcessModal }] =
    useDisclosure(false);
  const [markReadyModalOpened, { open: openMarkReadyModal, close: closeMarkReadyModal }] =
    useDisclosure(false);
  const [shipModalOpened, { open: openShipModal, close: closeShipModal }] = useDisclosure(false);
  const [deliverModalOpened, { open: openDeliverModal, close: closeDeliverModal }] =
    useDisclosure(false);
  const [cancelModalOpened, { open: openCancelModal, close: closeCancelModal }] =
    useDisclosure(false);
  const [refundModalOpened, { open: openRefundModal, close: closeRefundModal }] =
    useDisclosure(false);
  const [uploadPhotosModalOpened, { open: openUploadPhotosModal, close: closeUploadPhotosModal }] =
    useDisclosure(false);

  // Modal handlers
  const openModal = useCallback(
    (type: ModalType, purchaseOrder: PurchaseOrder) => {
      setSelectedPO(purchaseOrder);
      setActiveModal(type);

      switch (type) {
        case 'confirm': {
          openConfirmModal();
          break;
        }
        case 'process': {
          openProcessModal();
          break;
        }
        case 'markReady': {
          openMarkReadyModal();
          break;
        }
        case 'ship': {
          openShipModal();
          break;
        }
        case 'deliver': {
          openDeliverModal();
          break;
        }
        case 'cancel': {
          openCancelModal();
          break;
        }
        case 'refund': {
          openRefundModal();
          break;
        }
        case 'uploadPhotos': {
          openUploadPhotosModal();
          break;
        }
      }
    },
    [
      openConfirmModal,
      openProcessModal,
      openMarkReadyModal,
      openShipModal,
      openDeliverModal,
      openCancelModal,
      openRefundModal,
      openUploadPhotosModal,
    ],
  );

  const closeModal = useCallback(
    (type: ModalType) => {
      setSelectedPO(undefined);
      setActiveModal(null);

      switch (type) {
        case 'confirm': {
          closeConfirmModal();
          break;
        }
        case 'process': {
          closeProcessModal();
          break;
        }
        case 'markReady': {
          closeMarkReadyModal();
          break;
        }
        case 'ship': {
          closeShipModal();
          break;
        }
        case 'deliver': {
          closeDeliverModal();
          break;
        }
        case 'cancel': {
          closeCancelModal();
          break;
        }
        case 'refund': {
          closeRefundModal();
          break;
        }
        case 'uploadPhotos': {
          closeUploadPhotosModal();
          break;
        }
      }
    },
    [
      closeConfirmModal,
      closeProcessModal,
      closeMarkReadyModal,
      closeShipModal,
      closeDeliverModal,
      closeCancelModal,
      closeRefundModal,
      closeUploadPhotosModal,
    ],
  );

  // Action handlers
  const handleConfirm = useCallback(
    (purchaseOrder: PurchaseOrder) => {
      openModal('confirm', purchaseOrder);
    },
    [openModal],
  );

  const handleProcess = useCallback(
    (purchaseOrder: PurchaseOrder) => {
      openModal('process', purchaseOrder);
    },
    [openModal],
  );

  const handleMarkReady = useCallback(
    (purchaseOrder: PurchaseOrder) => {
      openModal('markReady', purchaseOrder);
    },
    [openModal],
  );

  const handleShip = useCallback(
    (purchaseOrder: PurchaseOrder) => {
      openModal('ship', purchaseOrder);
    },
    [openModal],
  );

  const handleDeliver = useCallback(
    (purchaseOrder: PurchaseOrder) => {
      openModal('deliver', purchaseOrder);
    },
    [openModal],
  );

  const handleCancel = useCallback(
    (purchaseOrder: PurchaseOrder) => {
      openModal('cancel', purchaseOrder);
    },
    [openModal],
  );

  const handleRefund = useCallback(
    (purchaseOrder: PurchaseOrder) => {
      openModal('refund', purchaseOrder);
    },
    [openModal],
  );

  const handleTakePhoto = useCallback(
    (purchaseOrder: PurchaseOrder) => {
      openModal('uploadPhotos', purchaseOrder);
    },
    [openModal],
  );

  return {
    // Modal states
    modals: {
      confirmModalOpened,
      processModalOpened,
      markReadyModalOpened,
      shipModalOpened,
      deliverModalOpened,
      cancelModalOpened,
      refundModalOpened,
      uploadPhotosModalOpened,
    },

    // Selected PO for modals
    selectedPO,
    activeModal,

    // Modal controls
    closeModal,

    // Action handlers
    handlers: {
      handleConfirm,
      handleProcess,
      handleMarkReady,
      handleShip,
      handleDeliver,
      handleCancel,
      handleRefund,
      handleTakePhoto,
    },
  };
}
