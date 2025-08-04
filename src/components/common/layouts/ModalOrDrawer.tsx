import { Modal, rem, type MantineSize } from '@mantine/core';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useIsDesktop } from '@/hooks/useIsDesktop';
import { Drawer } from '@/components/common/ui';

type ModalOrDrawerProps = {
  readonly opened: boolean;
  readonly drawerSize?: number | MantineSize | (string & {}) | undefined;
  readonly children: ReactNode;
  readonly onClose: () => void;
};
export function ModalOrDrawer({ drawerSize, opened, onClose, children }: ModalOrDrawerProps) {
  const { t } = useTranslation();
  const isDesktop = useIsDesktop();
  if (isDesktop) {
    return (
      <Modal
        centered
        opened={opened}
        title={t('employee.confirmDeactivateTitle')}
        onClose={onClose}
      >
        {children}
      </Modal>
    );
  }

  return (
    <Drawer
      opened={opened}
      title={t('employee.confirmDeactivateTitle')}
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
