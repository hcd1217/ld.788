import { Center, Box, SegmentedControl, type MantineBreakpoint } from '@mantine/core';
import { IconLayoutGrid, IconTable } from '@tabler/icons-react';
import { Tooltip } from './Tooltip';
import { useTranslation } from '@/hooks/useTranslation';

type SwitchViewProps = {
  readonly viewMode: 'table' | 'grid';
  readonly visibleFrom?: MantineBreakpoint;
  readonly setViewMode: (viewMode: 'table' | 'grid') => void;
};
export function SwitchView({ visibleFrom, viewMode, setViewMode }: SwitchViewProps) {
  const { t } = useTranslation();

  return (
    <Box visibleFrom={visibleFrom}>
      <SegmentedControl
        value={viewMode}
        data={[
          {
            value: 'table',
            label: (
              <Tooltip label={t('common.tableView')} position="bottom">
                <Center>
                  <IconTable size={16} />
                </Center>
              </Tooltip>
            ),
          },
          {
            value: 'grid',
            label: (
              <Tooltip label={t('common.gridView')} position="bottom">
                <Center>
                  <IconLayoutGrid size={16} />
                </Center>
              </Tooltip>
            ),
          },
        ]}
        onChange={(value) => {
          setViewMode(value as 'table' | 'grid');
        }}
      />
    </Box>
  );
}
