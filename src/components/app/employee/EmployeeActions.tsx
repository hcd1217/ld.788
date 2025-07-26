import {type MantineStyleProp} from '@mantine/core';
import {useNavigate} from 'react-router';
import {ActionIcons} from '@/components/common';

type EmployeeActionsProps = {
  readonly employeeId: string;
  readonly gap?: number;
  readonly style?: MantineStyleProp;
  readonly onDelete?: () => void;
};

export function EmployeeActions({
  employeeId,
  onDelete,
  gap = 4,
  style,
}: EmployeeActionsProps) {
  const navigate = useNavigate();

  const handleEdit = () => {
    navigate(`/employees/edit/${employeeId}`);
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete();
    } else {
      // @todo: Implement delete functionality
      console.warn('Delete functionality not implemented');
    }
  };

  return (
    <ActionIcons
      styles={{group: style}}
      gap={gap}
      onEdit={handleEdit}
      onDelete={handleDelete}
    />
  );
}
