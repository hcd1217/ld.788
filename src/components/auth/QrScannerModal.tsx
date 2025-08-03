import {Modal, Text, Stack, Alert, Button, TextInput, Group, FileInput, Tabs, rem} from '@mantine/core';
import {IconAlertCircle, IconUpload, IconClipboard, IconCamera} from '@tabler/icons-react';
import {useState, useEffect} from 'react';
import {QrReader} from 'react-qr-reader';
import {useTranslation} from '@/hooks/useTranslation';

type QrScannerModalProps = {
  readonly opened: boolean;
  readonly onClose: () => void;
  readonly onScan: (data: string) => void;
};

export function QrScannerModal({opened, onClose, onScan}: QrScannerModalProps) {
  const {t} = useTranslation();
  const [error, setError] = useState<string | undefined>(undefined);
  const [manualInput, setManualInput] = useState('');
  const [activeTab, setActiveTab] = useState<string | null>('camera');
  const [isProcessing, setIsProcessing] = useState(false);
  const [cameraKey, setCameraKey] = useState(0);

  // Force camera re-initialization when modal opens
  useEffect(() => {
    if (opened && activeTab === 'camera') {
      setCameraKey(prev => prev + 1);
    }
  }, [opened, activeTab]);

  const handleQrResult = (result: any, error: any) => {
    if (result?.text) {
      onScan(result.text);
      onClose();
    }

    if (error?.message) {
      // Only show camera permission error, ignore other scanning errors
      if (error.message.includes('Permission') || error.message.includes('NotAllowedError')) {
        setError(t('auth.magicLink.cameraPermissionDenied'));
      }
    }
  };

  const handleManualSubmit = () => {
    if (manualInput) {
      onScan(manualInput);
      setManualInput('');
      onClose();
    }
  };

  const handleClose = () => {
    setError(undefined);
    setManualInput('');
    setActiveTab('camera');
    setIsProcessing(false);
    // Force camera to stop by resetting the key
    setCameraKey(prev => prev + 1);
    onClose();
  };

  const processImage = async (_file: File | Blob) => {
    setError(undefined);
    setIsProcessing(true);

    try {
      // Since jsQR is not installed, we cannot decode QR codes from images yet
      // Show a user-friendly message explaining the limitation
      setError(t('auth.magicLink.uploadNotSupported') || 'QR code upload is not supported yet. Please use camera scanning or manual code entry.');
    } catch (err) {
      console.error('Error processing image:', err);
      setError(t('auth.magicLink.invalidImageFormat'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = (file: File | null) => {
    if (file) {
      void processImage(file);
    }
  };

  const handlePaste = async () => {
    try {
      const clipboardItems = await navigator.clipboard.read();
      
      for (const item of clipboardItems) {
        if (item.types.includes('image/png') || item.types.includes('image/jpeg')) {
          const blob = await item.getType(item.types.find(type => type.startsWith('image/')) || 'image/png');
          void processImage(blob);
          return;
        }
      }
      
      // If no image found, try text
      const text = await navigator.clipboard.readText();
      if (text) {
        onScan(text);
        onClose();
      } else {
        setError(t('auth.magicLink.noQrCodeFound'));
      }
    } catch (err) {
      console.error('Error reading clipboard:', err);
      setError(t('auth.magicLink.invalidImageFormat'));
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={t('auth.magicLink.scanQrCode')}
      size="lg"
      centered
    >
      <Stack gap="md">
        {error && (
          <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light">
            {error}
          </Alert>
        )}

        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tabs.List grow>
            <Tabs.Tab value="camera" leftSection={<IconCamera size={16} />}>
              {t('auth.magicLink.scanQrCode')}
            </Tabs.Tab>
            <Tabs.Tab value="upload" leftSection={<IconUpload size={16} />}>
              {t('auth.magicLink.uploadQrImage')}
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="camera" pt="md">
            {opened && activeTab === 'camera' && (
              <Stack gap="md">
                <div style={{position: 'relative', width: '100%', maxWidth: 400, margin: '0 auto'}}>
                  <QrReader
                    key={cameraKey}
                    onResult={handleQrResult}
                    constraints={{ facingMode: 'environment' }}
                    containerStyle={{ width: '100%' }}
                    videoStyle={{ width: '100%', borderRadius: 8 }}
                  />
                </div>
                
                <Text size="sm" c="dimmed" ta="center">
                  {t('auth.magicLink.scanningQrCode')}
                </Text>
              </Stack>
            )}
          </Tabs.Panel>

          <Tabs.Panel value="upload" pt="md">
            <Stack gap="md">
              <FileInput
                accept="image/*"
                leftSection={<IconUpload size={rem(16)} />}
                placeholder={t('auth.magicLink.clickToUpload')}
                onChange={handleFileUpload}
                disabled={isProcessing}
              />
              
              <Button
                fullWidth
                variant="default"
                leftSection={<IconClipboard size={16} />}
                onClick={() => void handlePaste()}
                disabled={isProcessing}
              >
                {t('auth.magicLink.pasteFromClipboard')}
              </Button>

              {isProcessing && (
                <Text size="sm" c="dimmed" ta="center">
                  {t('auth.magicLink.processingImage')}
                </Text>
              )}
            </Stack>
          </Tabs.Panel>
        </Tabs>

        <Stack gap="sm" mt="md">
          <Text size="sm" c="dimmed">
            {t('auth.magicLink.or')} {t('auth.magicLink.enterCodeDescription')}
          </Text>
          <TextInput
            placeholder={t('auth.magicLink.magicLinkCode')}
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && manualInput) {
                handleManualSubmit();
              }
            }}
            disabled={isProcessing}
          />
          <Group grow>
            <Button
              variant="default"
              onClick={handleClose}
              disabled={isProcessing}
            >
              {t('common.cancel')}
            </Button>
            <Button
              variant="filled"
              onClick={handleManualSubmit}
              disabled={!manualInput || isProcessing}
            >
              {t('auth.magicLink.verifyCode')}
            </Button>
          </Group>
        </Stack>
      </Stack>
    </Modal>
  );
}