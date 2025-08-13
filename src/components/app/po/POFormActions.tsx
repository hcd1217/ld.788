import { Button, Group } from '@mantine/core';
import { useTranslation } from '@/hooks/useTranslation';

type POFormActionsProps = {
  readonly onCancel: () => void;
  readonly isLoading: boolean;
  readonly isEditMode: boolean;
  readonly isMobile: boolean;
  readonly formId?: string;
};

export function POFormActions({
  onCancel,
  isLoading,
  isEditMode,
  isMobile,
  formId,
}: POFormActionsProps) {
  const { t } = useTranslation();

  const cancelButton = (
    <Button
      variant="default"
      onClick={onCancel}
      size={isMobile ? 'md' : 'sm'}
      style={isMobile ? { flex: 1 } : undefined}
    >
      {t('common.cancel')}
    </Button>
  );

  const submitButton = (
    <Button
      type="submit"
      form={formId}
      loading={isLoading}
      size={isMobile ? 'md' : 'sm'}
      style={isMobile ? { flex: 1 } : undefined}
    >
      {isEditMode ? t('common.save') : t('po.createPO')}
    </Button>
  );

  // Desktop layout
  if (!isMobile) {
    return (
      <Group justify="flex-end">
        {cancelButton}
        {submitButton}
      </Group>
    );
  }

  // Mobile layout
  return (
    <Group justify="space-between">
      {cancelButton}
      {submitButton}
    </Group>
  );
}
