import { forwardRef } from 'react';
import { Box, ActionIcon } from '@mantine/core';
import { IconCamera } from '@tabler/icons-react';

interface CameraViewProps {
  readonly onCapture: () => void;
}

export const CameraView = forwardRef<HTMLVideoElement, CameraViewProps>(({ onCapture }, ref) => {
  return (
    <>
      <video
        ref={ref}
        autoPlay
        playsInline
        muted
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />

      {/* Capture button */}
      <Box
        style={{
          position: 'absolute',
          bottom: 'var(--mantine-spacing-xl)',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10000,
        }}
      >
        <ActionIcon
          size={80}
          radius="xl"
          variant="filled"
          color="white"
          onClick={onCapture}
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
          }}
        >
          <IconCamera size={40} color="black" />
        </ActionIcon>
      </Box>
    </>
  );
});

CameraView.displayName = 'CameraView';
