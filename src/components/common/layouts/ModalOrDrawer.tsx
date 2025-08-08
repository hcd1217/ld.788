import { Modal, rem, type MantineSize } from '@mantine/core';
import type { ReactNode } from 'react';
import { useIsDesktop } from '@/hooks/useIsDesktop';
import { Drawer } from '@/components/common/ui';

type ModalOrDrawerProps = {
  readonly opened: boolean;
  readonly title: string;
  readonly drawerSize?: number | MantineSize | (string & {}) | undefined;
  readonly children: ReactNode;
  readonly onClose: () => void;
};
export function ModalOrDrawer({
  title,
  drawerSize,
  opened,
  onClose,
  children,
}: ModalOrDrawerProps) {
  const isDesktop = useIsDesktop();
  if (isDesktop) {
    return (
      <Modal centered opened={opened} title={title} onClose={onClose}>
        {children}
      </Modal>
    );
  }

  return (
    <Drawer
      opened={opened}
      title={title}
      position="bottom"
      size={drawerSize ?? '50vh'}
      transitionProps={{
        transition: 'slide-up',
        duration: 250,
        timingFunction: 'ease',
      }}
      styles={{
        content: {
          borderTopLeftRadius: rem(16),
          borderTopRightRadius: rem(16),
        },
        header: {
          borderTopLeftRadius: rem(16),
          borderTopRightRadius: rem(16),
        },
      }}
      onClose={onClose}
    >
      {children}
    </Drawer>
  );
}
