import { useCallback, useState } from 'react';

import { Autocomplete } from '@mantine/core';

import { useTranslation } from '@/hooks/useTranslation';
import type { ProductOverview } from '@/services/client/overview';
import { useAppStore } from '@/stores/useAppStore';

type POProductSearchProps = {
  readonly value?: string;
  readonly placeholder?: string;
  readonly size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  readonly limit?: number;
  readonly productOptions: string[];
  readonly onChange: (product?: ProductOverview) => void;
};

export function POProductSearch({
  value,
  limit,
  placeholder,
  size = 'sm',
  productOptions,
  onChange,
}: POProductSearchProps) {
  const { t } = useTranslation();
  const { overviewData } = useAppStore();
  const [searchValue, setSearchValue] = useState(value || '');

  // Handle product selection
  const handleProductSelection = useCallback(
    (value: string) => {
      setSearchValue(value);

      // Parse the selection to get product code
      const productCode = value.split(' - ')[0];
      const product = overviewData?.products.find((p) => p.code === productCode);

      if (product) {
        onChange({ code: product.code, name: product.name, unit: product.unit, id: product.id });
      } else {
        onChange(undefined);
      }
    },
    [overviewData, onChange],
  );

  return (
    <Autocomplete
      placeholder={placeholder || t('po.searchProduct')}
      data={productOptions}
      value={searchValue}
      onChange={handleProductSelection}
      size={size}
      limit={limit}
    />
  );
}
