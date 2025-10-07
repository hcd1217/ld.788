import React, { useEffect, useRef, useState } from 'react';

import { ActionIcon, Group, Image, Modal, Stack } from '@mantine/core';
import { IconArrowDown, IconArrowLeft, IconArrowRight, IconArrowUp, IconMinus, IconPlus, IconRotateClockwise } from '@tabler/icons-react';
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
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const imageRef = useRef<HTMLDivElement>(null);
  const { isMobile } = useDeviceType();

  // Reset zoom and position when modal closes
  useEffect(() => {
    if (!opened) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
      setRotation(0);
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

  // Mobile: Touch pan/drag when zoomed
  const handleTouchStart = (e: React.TouchEvent) => {
    if (isMobile && scale > 1 && e.touches.length === 1) {
      setIsDragging(true);
      const touch = e.touches[0];
      setDragStart({ x: touch.clientX - position.x, y: touch.clientY - position.y });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isMobile && isDragging && scale > 1 && e.touches.length === 1) {
      const touch = e.touches[0];
      setPosition({
        x: touch.clientX - dragStart.x,
        y: touch.clientY - dragStart.y,
      });
    }
  };

  const handleTouchEnd = () => {
    if (isMobile) {
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

  // Pan controls for mobile
  const PAN_STEP = 50;
  const handlePanUp = () => {
    setPosition((prev) => ({ ...prev, y: prev.y + PAN_STEP }));
  };

  const handlePanDown = () => {
    setPosition((prev) => ({ ...prev, y: prev.y - PAN_STEP }));
  };

  const handlePanLeft = () => {
    setPosition((prev) => ({ ...prev, x: prev.x + PAN_STEP }));
  };

  const handlePanRight = () => {
    setPosition((prev) => ({ ...prev, x: prev.x - PAN_STEP }));
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
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
      {/* Zoom and rotate controls */}
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
        <ActionIcon
          size="lg"
          variant="filled"
          color="dark"
          onClick={handleRotate}
          aria-label="Rotate image"
        >
          <IconRotateClockwise size={20} />
        </ActionIcon>
      </Group>

      {isMobile && (
        <>

          {/* Pan controls - only show when zoomed */}
          {scale > 1 && (
            <Stack
              gap={4}
              style={{
                position: 'absolute',
                bottom: 20,
                left: 20,
                zIndex: 1000,
              }}
            >
              <Group gap={4} justify="center">
                <ActionIcon
                  size="md"
                  variant="filled"
                  color="dark"
                  onClick={handlePanUp}
                  aria-label="Pan up"
                >
                  <IconArrowUp size={16} />
                </ActionIcon>
              </Group>
              <Group gap={4}>
                <ActionIcon
                  size="md"
                  variant="filled"
                  color="dark"
                  onClick={handlePanLeft}
                  aria-label="Pan left"
                >
                  <IconArrowLeft size={16} />
                </ActionIcon>
                <ActionIcon
                  size="md"
                  variant="filled"
                  color="dark"
                  onClick={handlePanDown}
                  aria-label="Pan down"
                >
                  <IconArrowDown size={16} />
                </ActionIcon>
                <ActionIcon
                  size="md"
                  variant="filled"
                  color="dark"
                  onClick={handlePanRight}
                  aria-label="Pan right"
                >
                  <IconArrowRight size={16} />
                </ActionIcon>
              </Group>
            </Stack>
          )}
        </>
      )}
      <div
        ref={imageRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px) rotate(${rotation}deg)`,
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
