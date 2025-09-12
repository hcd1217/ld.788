import { Tooltip } from '@mantine/core';
import { ActionIcon } from '@mantine/core';
import { IconExternalLink } from '@tabler/icons-react';

import { useTranslation } from '@/hooks/useTranslation';

type ViewOnMapProps = {
  readonly googleMapsUrl?: string;
};
export function ViewOnMap({ googleMapsUrl }: ViewOnMapProps) {
  const { t } = useTranslation();
  if (!googleMapsUrl) {
    return null;
  }
  return (
    <Tooltip label={t('common.viewOnMap')}>
      <ActionIcon
        size="sm"
        variant="subtle"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          window.open(googleMapsUrl, '_blank', 'noopener,noreferrer');
        }}
      >
        <IconExternalLink size={16} />
      </ActionIcon>
    </Tooltip>
  );
}
