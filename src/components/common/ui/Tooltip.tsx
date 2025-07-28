import {
  Tooltip as MantineTooltip,
  rem,
  type TooltipProps as MantineTooltipProps,
} from '@mantine/core';
import {type ReactNode} from 'react';
import useIsDarkMode from '@/hooks/useIsDarkMode';

type TooltipProps = MantineTooltipProps & {
  readonly children: ReactNode;
};

export function Tooltip({children, ...props}: TooltipProps) {
  const isDarkMode = useIsDarkMode();

  return (
    <MantineTooltip
      mt="sm"
      styles={{
        tooltip: {
          fontSize: rem(10),
          fontWeight: 600,
          color: isDarkMode ? 'var(--mantine-color-dark-0)' : 'white',
          backgroundColor: isDarkMode
            ? 'var(--mantine-color-dark-6)'
            : 'var(--mantine-color-dark-3)',
        },
      }}
      {...props}
    >
      {children}
    </MantineTooltip>
  );
}
