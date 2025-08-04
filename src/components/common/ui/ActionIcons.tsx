import { Group, ActionIcon, type MantineStyleProp } from '@mantine/core';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import { useTranslation } from '@/hooks/useTranslation';

type ActionIconsProps = {
  readonly onEdit: () => void;
  readonly onDelete?: () => void;
  readonly gap?: number;
  readonly editLabel?: string;
  readonly deleteLabel?: string;
  readonly showDelete?: boolean;
  readonly styles?: {
    group?: MantineStyleProp;
  };
};

export function ActionIcons({
  onEdit,
  onDelete,
  gap = 4,
  editLabel,
  deleteLabel,
  styles,
  showDelete = true,
}: ActionIconsProps) {
  const { t } = useTranslation();

  return (
    <Group gap={gap} style={styles?.group}>
      <ActionIcon
        variant="subtle"
        color="gray"
        size="sm"
        aria-label={editLabel ?? t('common.edit')}
        onClick={onEdit}
      >
        <IconEdit size={16} />
      </ActionIcon>
      {showDelete ? (
        <ActionIcon
          variant="subtle"
          color="red"
          size="sm"
          aria-label={deleteLabel ?? t('common.delete')}
          onClick={onDelete}
        >
          <IconTrash size={16} />
        </ActionIcon>
      ) : null}
    </Group>
  );
}
