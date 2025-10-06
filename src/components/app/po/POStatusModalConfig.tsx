import React from 'react';

import {
  IconCheck,
  IconCurrencyDollar,
  IconPackage,
  IconPackageExport,
  IconTrash,
  IconTruck,
  IconX,
} from '@tabler/icons-react';

export type POModalMode =
  | 'confirm'
  | 'cancel'
  | 'process'
  | 'markReady'
  | 'ship'
  | 'deliver'
  | 'refund'
  | 'delete';

export type ModalConfig = {
  title: string;
  description: string;
  buttonText: string;
  buttonColor: string;
  icon: React.ReactNode;
  alertColor: string;
  requiresReason?: boolean;
  reasonLabel?: string;
  reasonPlaceholder?: string;
};

export const getModalConfig = (mode: POModalMode, t: any): ModalConfig => {
  const configs = {
    confirm: {
      title: t('po.confirmOrder'),
      description: t('po.confirmOrderDescription'),
      buttonText: t('po.confirmOrder'),
      buttonColor: 'green',
      icon: <IconCheck size={16} />,
      alertColor: 'blue',
      requiresReason: false,
    },
    cancel: {
      title: t('po.cancelOrder'),
      description: t('po.cancelOrderDescription'),
      buttonText: t('po.cancelOrder'),
      buttonColor: 'red',
      icon: <IconX size={16} />,
      alertColor: 'red',
      requiresReason: true,
      reasonLabel: t('po.cancellationReason'),
      reasonPlaceholder: t('po.enterCancellationReason'),
    },
    process: {
      title: t('po.processOrder'),
      description: t('po.processOrderDescription'),
      buttonText: t('po.processOrder'),
      buttonColor: 'blue',
      icon: <IconPackage size={16} />,
      alertColor: 'blue',
      requiresReason: false,
    },
    markReady: {
      title: t('po.markReadyOrder'),
      description: t('po.markReadyOrderDescription'),
      buttonText: t('po.markReady'),
      buttonColor: 'teal',
      icon: <IconPackageExport size={16} />,
      alertColor: 'teal',
      requiresReason: false,
    },
    ship: {
      title: t('po.shipOrder'),
      description: t('po.shipOrderDescription'),
      buttonText: t('po.shipOrder'),
      buttonColor: 'cyan',
      icon: <IconTruck size={16} />,
      alertColor: 'cyan',
      requiresReason: false,
    },
    deliver: {
      title: t('po.deliverOrder'),
      description: t('po.deliverOrderDescription'),
      buttonText: t('po.markAsDelivered'),
      buttonColor: 'green',
      icon: <IconCheck size={16} />,
      alertColor: 'green',
      requiresReason: false,
    },
    refund: {
      title: t('po.refundOrder'),
      description: t('po.refundOrderDescription'),
      buttonText: t('po.processRefund'),
      buttonColor: 'orange',
      icon: <IconCurrencyDollar size={16} />,
      alertColor: 'orange',
      requiresReason: true,
      reasonLabel: t('po.refundReason'),
      reasonPlaceholder: t('po.enterRefundReason'),
    },
    delete: {
      title: t('po.deleteOrder'),
      description: t('po.deleteOrderDescription'),
      buttonText: t('common.delete'),
      buttonColor: 'red',
      icon: <IconTrash size={16} />,
      alertColor: 'red',
      requiresReason: true,
      reasonLabel: t('po.deleteReason'),
      reasonPlaceholder: t('po.enterDeleteReason'),
    },
  };

  return configs[mode];
};
