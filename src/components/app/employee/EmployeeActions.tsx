import { useMemo } from 'react';

import { useNavigate } from 'react-router';

import { ActionIcon, Group, type MantineStyleProp } from '@mantine/core';
import { IconEdit, IconUserCheck, IconUserOff } from '@tabler/icons-react';

import { Tooltip } from '@/components/common';
import { getEmployeeEditRoute } from '@/config/routeConfig';
import { useTranslation } from '@/hooks/useTranslation';
import { usePermissions } from '@/stores/useAppStore';
import { canEditEmployee } from '@/utils/permission.utils';

type EmployeeActionsProps = {
  readonly employeeId: string;
  readonly gap?: number;
  readonly style?: MantineStyleProp;
  readonly isActive: boolean;
  readonly onDeactivate?: () => void;
  readonly onActivate?: () => void;
};

export function EmployeeActions({
  employeeId,
  isActive,
  onDeactivate,
  onActivate,
  gap = 4,
  style,
}: EmployeeActionsProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const permissions = usePermissions();
  const { canEdit } = useMemo(() => {
    return {
      canEdit: canEditEmployee(permissions),
    };
  }, [permissions]);

  const handleEdit = () => {
    navigate(getEmployeeEditRoute(employeeId));
  };

  return (
    <Group gap={gap} style={style}>
      <ActionIcon disabled={!canEdit} variant="subtle" color="gray" size="sm" onClick={handleEdit}>
        <Tooltip label={t('common.edit')} position="bottom">
          <IconEdit size={16} />
        </Tooltip>
      </ActionIcon>
      {isActive ? (
        <ActionIcon
          variant="subtle"
          size="sm"
          color="var(--app-danger-color)"
          onClick={onDeactivate}
        >
          <Tooltip label={t('common.deactivate')}>
            <IconUserOff size={16} />
          </Tooltip>
        </ActionIcon>
      ) : (
        <ActionIcon
          disabled={!canEdit}
          variant="subtle"
          color="var(--app-active-color)"
          size="sm"
          onClick={onActivate}
        >
          <Tooltip label={t('common.activate')}>
            <IconUserCheck size={16} />
          </Tooltip>
        </ActionIcon>
      )}
    </Group>
  );
}
