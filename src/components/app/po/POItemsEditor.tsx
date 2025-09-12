import { useDeviceType } from '@/hooks/useDeviceType';
import type { POItem } from '@/services/sales/purchaseOrder';

import { POItemsEditorDesktop } from './POItemsEditorDesktop';
import { POItemsEditorMobile } from './POItemsEditorMobile';

type POItemsEditorProps = {
  readonly items: POItem[];
  readonly onChange: (items: POItem[]) => void;
  readonly isReadOnly?: boolean;
};

export function POItemsEditor({ items, onChange, isReadOnly = false }: POItemsEditorProps) {
  const { isMobile } = useDeviceType();

  if (isMobile) {
    return <POItemsEditorMobile items={items} onChange={onChange} disabled={isReadOnly} />;
  }

  return <POItemsEditorDesktop items={items} onChange={onChange} isReadOnly={isReadOnly} />;
}
