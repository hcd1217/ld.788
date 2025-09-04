import { Select } from '@mantine/core';
import { useState, useEffect } from 'react';
import { isDebug } from '@/utils/env';
import { STORAGE_KEYS } from '@/utils/storageKeys';
type DepartmentCode = 'sales' | 'delivery' | 'warehouse' | 'accounting' | 'manager';

export function RoleSelector() {
  const [currentRole, setCurrentRole] = useState<DepartmentCode>(
    (localStorage.getItem(STORAGE_KEYS.DEBUG.CURRENT_ROLE) as DepartmentCode) ?? 'manager',
  );

  useEffect(() => {
    if (!currentRole || !isDebug) {
      return;
    }
    const storageRole = localStorage.getItem(STORAGE_KEYS.DEBUG.CURRENT_ROLE) as DepartmentCode;
    if (storageRole === currentRole) {
      return;
    }
    localStorage.setItem(STORAGE_KEYS.DEBUG.CURRENT_ROLE, currentRole);
    setTimeout(() => {
      window.location.reload();
    }, 500);
  }, [currentRole]);

  if (!isDebug) {
    return null;
  }
  return (
    <Select
      data={[
        { value: 'sales', label: 'Sales' },
        { value: 'delivery', label: 'Delivery' },
        { value: 'warehouse', label: 'Warehouse' },
        { value: 'accounting', label: 'Accounting' },
        { value: 'manager', label: 'Manager' },
      ]}
      value={currentRole}
      onChange={(value) => setCurrentRole((value as DepartmentCode) ?? 'manager')}
    />
  );
}
