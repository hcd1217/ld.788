import { Select } from '@mantine/core';
import { useState, useEffect } from 'react';
import { isDebug } from '@/utils/env';
type DepartmentCode = 'sales' | 'delivery' | 'warehouse' | 'accounting' | 'manager';

export function RoleSelector() {
  const [currentRole, setCurrentRole] = useState<DepartmentCode>(
    (localStorage.getItem('__DEBUG_CURRENT_ROLE__') as DepartmentCode) ?? 'manager',
  );

  useEffect(() => {
    if (!currentRole || !isDebug) {
      return;
    }
    const storageRole = localStorage.getItem('__DEBUG_CURRENT_ROLE__') as DepartmentCode;
    if (storageRole === currentRole) {
      return;
    }
    localStorage.setItem('__DEBUG_CURRENT_ROLE__', currentRole);
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
