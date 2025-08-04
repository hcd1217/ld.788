import { Badge } from '@mantine/core';
import { useTranslation } from '@/hooks/useTranslation';
import type { WorkType } from '@/services/hr/employee';

export function WorkTypeBadge({ workType }: { workType?: WorkType }) {
  const { t } = useTranslation();
  if (!workType) {
    return '-';
  }
  return (
    <Badge variant="outline" color={workType === 'FULL_TIME' ? 'blue' : 'orange'}>
      {workType === 'FULL_TIME' ? t('employee.fullTime') : t('employee.partTime')}
    </Badge>
  );
}
