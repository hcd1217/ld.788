import { type ReactNode, useRef } from 'react';

import {
  Box,
  Drawer as MantineDrawer,
  type DrawerProps as MantineDrawerProps,
  rem,
} from '@mantine/core';

type DrawerProps = MantineDrawerProps & {
  readonly position?: 'bottom' | 'left' | 'right' | 'top';
  readonly children: ReactNode;
  readonly expandable?: boolean;
  readonly expanded?: boolean;
  readonly onExpandedChange?: (expanded: boolean) => void;
};

export function Drawer({
  expandable = false,
  expanded = false,
  onExpandedChange,
  position = 'bottom',
  children,
  size,
  ...props
}: DrawerProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Reset drag state when expanded changes

  const isBottomDrawer = position === 'bottom';
  const showMobileStyles = expandable || (isBottomDrawer && expanded !== undefined);

  // Calculate dynamic size based on drag state
  const getDrawerSize = () => {
    if (!expandable) return expanded ? '90vh' : size;
    return expanded ? '90vh' : size || '300px';
  };

  return (
    <MantineDrawer
      ref={drawerRef}
      position={position}
      size={getDrawerSize()}
      overlayProps={{
        opacity: 0.8,
      }}
      transitionProps={{
        transition: 'slide-up',
        duration: 300,
        timingFunction: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
      }}
      styles={
        showMobileStyles
          ? {
              body: {
                paddingBottom: 80,
                height: expanded ? 'calc(90vh - 60px)' : 'calc(50vh - 60px)',
                overflowY: 'hidden',
                transitionProperty: 'height',
                transitionDuration: '0.3s',
                transitionTimingFunction: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
              },
              content: {
                borderTopLeftRadius: rem(16),
                borderTopRightRadius: rem(16),
                overflow: 'hidden',
                boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.15)',
              },
              header: {
                padding: 'var(--mantine-spacing-md)',
                borderTopLeftRadius: rem(16),
                borderTopRightRadius: rem(16),
                position: 'relative',
                '&::before': expandable
                  ? {
                      content: '""',
                      position: 'absolute',
                      top: '8px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '40px',
                      height: '4px',
                      backgroundColor: 'var(--mantine-color-gray-4)',
                      borderRadius: '2px',
                    }
                  : undefined,
              },
            }
          : undefined
      }
      {...props}
    >
      {expandable ? (
        <Box
          ref={contentRef}
          style={{
            height: '100%',
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
            touchAction: 'pan-y',
          }}
        >
          {children}
        </Box>
      ) : (
        children
      )}
    </MantineDrawer>
  );
}
