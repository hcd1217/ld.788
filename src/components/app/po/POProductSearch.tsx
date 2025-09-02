import { useState, useMemo, useCallback } from 'react';
import { Autocomplete } from '@mantine/core';
import { useTranslation } from '@/hooks/useTranslation';
import { useAppStore } from '@/stores/useAppStore';

type POProductSearchProps = {
  readonly value?: string;
  readonly placeholder?: string;
  readonly size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  readonly limit?: number;
  readonly onChange: (product: { code: string; name: string } | null) => void;
};

export function POProductSearch({
  value,
  placeholder,
  size = 'sm',
  limit = 10,
  onChange,
}: POProductSearchProps) {
  const { t } = useTranslation();
  const { overviewData } = useAppStore();
  const [searchValue, setSearchValue] = useState(value || '');

  // Generate autocomplete options from products
  const productOptions = useMemo(() => {
    return overviewData?.products.map((p) => `${p.code} - ${p.name}`) || [];
  }, [overviewData]);

  // Handle product selection
  const handleProductSelection = useCallback(
    (value: string) => {
      setSearchValue(value);

      // Parse the selection to get product code
      const productCode = value.split(' - ')[0];
      const product = overviewData?.products.find((p) => p.code === productCode);

      if (product) {
        onChange({ code: product.code, name: product.name });
      } else {
        onChange(null);
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
