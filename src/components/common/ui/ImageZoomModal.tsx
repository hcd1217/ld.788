import React, { useEffect, useRef, useState } from 'react';

import { ActionIcon, Group, Image, Modal } from '@mantine/core';
import { IconMinus, IconPlus } from '@tabler/icons-react';
import { useDeviceType } from '@/hooks/useDeviceType';

type ImageZoomModalProps = {
  readonly opened: boolean;
  readonly onClose: () => void;
  readonly imageUrl: string;
  readonly imageAlt: string;
};

export function ImageZoomModal({ opened, onClose, imageUrl, imageAlt }: ImageZoomModalProps) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const imageRef = useRef<HTMLDivElement>(null);
  const { isMobile } = useDeviceType();

  // Reset zoom and position when modal closes
  useEffect(() => {
    if (!opened) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
      setIsDragging(false);
    }
  }, [opened]);

  // Desktop: Mouse wheel zoom
  useEffect(() => {
    if (isMobile) return;

    const handleWheel = (e: WheelEvent) => {
      if (!opened || !imageRef.current?.contains(e.target as Node)) return;

      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setScale((prev) => Math.min(Math.max(prev + delta, 1), 5));
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [opened, isMobile]);

  // Desktop: Pan/drag when zoomed
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isMobile && scale > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMobile && isDragging && scale > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    if (!isMobile) {
      setIsDragging(false);
    }
  };

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.5, 5));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.5, 1));
    if (scale <= 1.5) {
      setPosition({ x: 0, y: 0 });
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="xl"
      centered
      withCloseButton={false}
      padding={0}
      styles={{
        body: {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(77, 77, 77, 0.95)',
          padding: '2px',
          overflow: 'hidden',
          position: 'relative',
        },
        content: {
          backgroundColor: 'transparent',
          maxHeight: '95vh',
          maxWidth: '95vw',
        },
      }}
    >
      {isMobile && (
        <Group
          gap="xs"
          style={{
            position: 'absolute',
            bottom: 20,
            right: 20,
            zIndex: 1000,
          }}
        >
          <ActionIcon
            size="lg"
            variant="filled"
            color="dark"
            onClick={handleZoomOut}
            disabled={scale <= 1}
            aria-label="Zoom out"
          >
            <IconMinus size={20} />
          </ActionIcon>
          <ActionIcon
            size="lg"
            variant="filled"
            color="dark"
            onClick={handleZoomIn}
            disabled={scale >= 5}
            aria-label="Zoom in"
          >
            <IconPlus size={20} />
          </ActionIcon>
        </Group>
      )}
      <div
        ref={imageRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
          transition: isDragging ? 'none' : 'transform 0.1s ease-out',
          cursor: isMobile ? 'pointer' : scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'pointer',
        }}
      >
        <Image
          src={imageUrl}
          alt={imageAlt}
          fit="contain"
          onClick={scale === 1 ? onClose : undefined}
          style={{
            maxHeight: '90vh',
            maxWidth: '90vw',
            width: 'auto',
            height: 'auto',
            userSelect: 'none',
            pointerEvents: scale > 1 ? 'none' : 'auto',
          }}
          fallbackSrc="/photos/no-photo.svg"
        />
      </div>
    </Modal>
  );
}
