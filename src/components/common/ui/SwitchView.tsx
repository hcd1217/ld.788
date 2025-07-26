import {Center, Box, SegmentedControl, Tooltip} from '@mantine/core';
import {IconLayoutGrid, IconTable} from '@tabler/icons-react';
import {useTranslation} from '@/hooks/useTranslation';
import {useIsDarkMode} from '@/hooks/useIsDarkMode';

type SwitchViewProps = {
  readonly viewMode: 'table' | 'grid';
  readonly setViewMode: (viewMode: 'table' | 'grid') => void;
};
export function SwitchView({viewMode, setViewMode}: SwitchViewProps) {
  const {t} = useTranslation();
  const isDarkMode = useIsDarkMode();
  const tooltipStyles = {
    tooltip: {
      color: isDarkMode ? 'var(--mantine-color-dark-0)' : 'white',
      backgroundColor: isDarkMode
        ? 'var(--mantine-color-dark-6)'
        : 'var(--mantine-color-brand-4)',
    },
  };

  return (
    <Box visibleFrom="md">
      <SegmentedControl
        value={viewMode}
        data={[
          {
            value: 'table',
            label: (
              <Tooltip
                label={t('common.tableView')}
                position="bottom"
                styles={tooltipStyles}
              >
                <Center>
                  <IconTable size={16} />
                </Center>
              </Tooltip>
            ),
          },
          {
            value: 'grid',
            label: (
              <Tooltip
                label={t('common.gridView')}
                position="bottom"
                styles={tooltipStyles}
              >
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
