import { Center, Box, SegmentedControl, type MantineBreakpoint } from '@mantine/core';
import { IconLayoutGrid, IconTable } from '@tabler/icons-react';
import { Tooltip } from './Tooltip';
import { useTranslation } from '@/hooks/useTranslation';
import { VIEW_MODE, type ViewModeType } from '@/hooks/useViewMode';

type SwitchViewProps = {
  readonly viewMode: ViewModeType;
  readonly visibleFrom?: MantineBreakpoint;
  readonly setViewMode: (viewMode: ViewModeType) => void;
};
export function SwitchView({ visibleFrom, viewMode, setViewMode }: SwitchViewProps) {
  const { t } = useTranslation();

  return (
    <Box visibleFrom={visibleFrom}>
      <SegmentedControl
        value={viewMode}
        data={[
          {
            value: VIEW_MODE.TABLE,
            label: (
              <Tooltip label={t('common.tableView')} position="bottom">
                <Center>
                  <IconTable size={16} />
                </Center>
              </Tooltip>
            ),
          },
          {
            value: VIEW_MODE.GRID,
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
          setViewMode(value as ViewModeType);
        }}
      />
    </Box>
  );
}
