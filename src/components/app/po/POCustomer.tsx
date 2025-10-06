import { useTranslation } from '@/hooks/useTranslation';
import type { PurchaseOrder } from '@/services/sales/purchaseOrder';

type POCustomerProps = {
  readonly purchaseOrder: PurchaseOrder;
};

export function POCustomer({ purchaseOrder }: POCustomerProps) {
  const { t } = useTranslation();

  if (!purchaseOrder.isPersonalCustomer) {
    return <>{purchaseOrder.customerName ?? '-'}</>;
  }

  if (purchaseOrder.personalCustomerName) {
    return (
      <>
        {purchaseOrder.personalCustomerName} ({t('po.personalCustomer')})
      </>
    );
  }

  return <>{t('po.personalCustomer')}</>;
}
