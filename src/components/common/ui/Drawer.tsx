import {
  Drawer as MantineDrawer,
  Box,
  rem,
  type DrawerProps as MantineDrawerProps,
} from '@mantine/core';
import {type ReactNode, useRef, useCallback, useState, useEffect} from 'react';

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
  const touchStartY = useRef(0);
  const touchStartTime = useRef(0);
  const contentRef = useRef<HTMLDivElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);

  // Reset drag state when expanded changes
  useEffect(() => {
    setDragOffset(0);
    setIsDragging(false);
  }, [expanded]);

  // Handle touch start
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (!expandable) return;
      touchStartY.current = e.touches[0].clientY;
      touchStartTime.current = Date.now();
      setIsDragging(true);
    },
    [expandable],
  );

  // Handle touch move for swipe detection
  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!expandable || !touchStartY.current || !isDragging) return;

      const currentY = e.touches[0].clientY;
      const diffY = touchStartY.current - currentY;

      // Only allow dragging in the correct direction
      if (!expanded && diffY > 0) {
        // Dragging up when collapsed - show expansion preview
        setDragOffset(Math.min(diffY, 200));
      } else if (expanded && diffY < 0 && contentRef.current?.scrollTop === 0) {
        // Dragging down when expanded - show collapse preview
        setDragOffset(Math.max(diffY, -200));
      }
    },
    [expandable, expanded, isDragging],
  );

  // Handle touch end
  const handleTouchEnd = useCallback(() => {
    if (!isDragging) return;

    const touchDuration = Date.now() - touchStartTime.current;
    const velocity = Math.abs(dragOffset) / touchDuration;

    // Determine action based on offset and velocity
    if (!expanded && (dragOffset > 100 || velocity > 0.5)) {
      onExpandedChange?.(true);
    } else if (expanded && (dragOffset < -100 || velocity > 0.5)) {
      onExpandedChange?.(false);
    }

    // Reset state
    setIsDragging(false);
    setDragOffset(0);
    touchStartY.current = 0;
    touchStartTime.current = 0;
  }, [dragOffset, expanded, isDragging, onExpandedChange]);

  const isBottomDrawer = position === 'bottom';
  const showMobileStyles =
    expandable || (isBottomDrawer && expanded !== undefined);

  // Calculate dynamic size based on drag state
  const getDrawerSize = () => {
    if (!expandable) return expanded ? '90vh' : size;

    if (isDragging) {
      const baseSize = expanded ? 90 : 30;
      const offsetPercentage = (dragOffset / window.innerHeight) * 100;
      const newSize = Math.max(20, Math.min(90, baseSize + offsetPercentage));
      return `${newSize}vh`;
    }

    return expanded ? '90vh' : size || '300px';
  };

  // Calculate opacity for backdrop during drag
  const getBackdropOpacity = () => {
    if (!isDragging) return undefined;
    const maxOffset = 200;
    const opacity = 0.5 + (Math.abs(dragOffset) / maxOffset) * 0.3;
    return Math.min(0.8, opacity);
  };

  return (
    <MantineDrawer
      ref={drawerRef}
      position={position}
      size={getDrawerSize()}
      overlayProps={{
        opacity: getBackdropOpacity(),
        blur: isDragging ? 2 : undefined,
      }}
      transitionProps={{
        transition: 'slide-up',
        duration: isDragging ? 0 : 300,
        timingFunction: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
      }}
      styles={
        showMobileStyles
          ? {
              body: {
                paddingBottom: 80,
                height: expanded ? 'calc(90vh - 60px)' : 'calc(50vh - 60px)',
                overflowY: 'hidden',
                transition: isDragging
                  ? 'none'
                  : 'height 0.3s cubic-bezier(0.22, 0.61, 0.36, 1)',
              },
              content: {
                borderTopLeftRadius: rem(16),
                borderTopRightRadius: rem(16),
                transition: isDragging
                  ? 'none'
                  : 'all 0.3s cubic-bezier(0.22, 0.61, 0.36, 1)',
                overflow: 'hidden',
                boxShadow: isDragging
                  ? '0 -4px 20px rgba(0, 0, 0, 0.15)'
                  : undefined,
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
            cursor: isDragging ? 'grabbing' : 'grab',
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {children}
        </Box>
      ) : (
        children
      )}
    </MantineDrawer>
  );
}
