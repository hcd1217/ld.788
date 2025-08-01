import {type MantineStyleProp, ActionIcon, Group} from '@mantine/core';
import {IconEdit, IconUserOff, IconUserCheck} from '@tabler/icons-react';
import {useNavigate} from 'react-router';
import {useTranslation} from '@/hooks/useTranslation';
import {Tooltip} from '@/components/common';
import {getEmployeeDetailRoute} from '@/config/routeConfig';

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
  const {t} = useTranslation();

  const handleEdit = () => {
    navigate(getEmployeeDetailRoute(employeeId));
  };

  return (
    <Group gap={gap} style={style}>
      <ActionIcon
        variant="subtle"
        color="gray"
        size="sm"
        aria-label={t('common.edit')}
        onClick={handleEdit}
      >
        <Tooltip label={t('common.edit')} position="bottom">
          <IconEdit size={16} />
        </Tooltip>
      </ActionIcon>
      {isActive ? (
        <ActionIcon
          variant="subtle"
          size="sm"
          aria-label={t('employee.deactivate')}
          color="var(--app-danger-color)"
          onClick={onDeactivate}
        >
          <Tooltip label={t('employee.deactivate')}>
            <IconUserOff size={16} />
          </Tooltip>
        </ActionIcon>
      ) : (
        <ActionIcon
          variant="subtle"
          color="var(--app-active-color)"
          size="sm"
          aria-label={t('employee.activate')}
          onClick={onActivate}
        >
          <Tooltip label={t('employee.activate')}>
            <IconUserCheck size={16} />
          </Tooltip>
        </ActionIcon>
      )}
    </Group>
  );
}
