import { Button, Group } from '@mantine/core';

import { useTranslation } from '@/hooks/useTranslation';

type POFormActionsProps = {
  readonly onCancel: () => void;
  readonly isDisabled: boolean;
  readonly isLoading: boolean;
  readonly isEditMode: boolean;
  readonly isMobile: boolean;
  readonly formId?: string;
  readonly isHidden?: boolean;
};

export function POFormActions({
  onCancel,
  isDisabled,
  isLoading,
  isEditMode,
  isMobile,
  formId,
  isHidden = false,
}: POFormActionsProps) {
  const { t } = useTranslation();

  // Hide buttons on mobile when modal is open
  if (isMobile && isHidden) {
    return null;
  }

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
      disabled={isDisabled}
      type="submit"
      form={formId}
      loading={isLoading}
      size={isMobile ? 'md' : 'sm'}
      style={isMobile ? { flex: 1 } : undefined}
    >
      {isEditMode ? t('common.save') : t('po.createPO')}
    </Button>
  );

  return (
    <Group justify={isMobile ? 'space-between' : 'flex-end'}>
      {cancelButton}
      {submitButton}
    </Group>
  );
}
