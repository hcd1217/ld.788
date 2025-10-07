import React, { useEffect, useRef, useState } from 'react';

import { Image, Modal } from '@mantine/core';

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
    const handleWheel = (e: WheelEvent) => {
      if (!opened || !imageRef.current?.contains(e.target as Node)) return;

      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setScale((prev) => Math.min(Math.max(prev + delta, 1), 5));
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [opened]);

  // Mobile: Pinch zoom
  useEffect(() => {
    if (!opened || !imageRef.current) return;

    let initialDistance = 0;
    let initialScale = 1;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        initialDistance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY,
        );
        initialScale = scale;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const currentDistance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY,
        );
        const newScale = (currentDistance / initialDistance) * initialScale;
        setScale(Math.min(Math.max(newScale, 1), 5));
      }
    };

    const element = imageRef.current;
    element.addEventListener('touchstart', handleTouchStart);
    element.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
    };
  }, [opened, scale]);

  // Pan/drag when zoomed
  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && scale > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch pan for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (scale > 1 && e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y,
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging && scale > 1 && e.touches.length === 1) {
      setPosition({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y,
      });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
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
        },
        content: {
          backgroundColor: 'transparent',
          maxHeight: '95vh',
          maxWidth: '95vw',
        },
      }}
    >
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
          transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
          transition: isDragging ? 'none' : 'transform 0.1s ease-out',
          cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'pointer',
          touchAction: scale > 1 ? 'none' : 'auto',
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
