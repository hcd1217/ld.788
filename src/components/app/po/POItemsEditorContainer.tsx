import { useDeviceType } from '@/hooks/useDeviceType';
import { POItemsEditorDesktop } from './POItemsEditorDesktop';
import { POItemsEditorMobile } from './POItemsEditorMobile';
import type { POItem } from '@/lib/api/schemas/sales.schemas';

type POItemsEditorContainerProps = {
  readonly items: POItem[];
  readonly onChange: (items: POItem[]) => void;
  readonly isReadOnly?: boolean;
};

export function POItemsEditorContainer({
  items,
  onChange,
  isReadOnly = false,
}: POItemsEditorContainerProps) {
  const { isMobile } = useDeviceType();

  if (isMobile) {
    return <POItemsEditorMobile items={items} onChange={onChange} disabled={isReadOnly} />;
  }

  return <POItemsEditorDesktop items={items} onChange={onChange} isReadOnly={isReadOnly} />;
}
