import { useEffect, useMemo, useState } from 'react';

import {
  Alert,
  Button,
  Checkbox,
  Group,
  LoadingOverlay,
  ScrollArea,
  Select,
  Stack,
  Text,
  Textarea,
  TextInput,
} from '@mantine/core';
import {
  IconCalendar,
  IconEdit,
  IconMapPin,
  IconPackage,
  IconTruck,
  IconX,
} from '@tabler/icons-react';

import { Tabs } from '@/components/common';
import { DateInput, ModalOrDrawer } from '@/components/common';
import { useTranslation } from '@/hooks/useTranslation';
import { useClientConfig, useEmployees, useVendorOptions } from '@/stores/useAppStore';

import { DeliveryRequestForm } from './DeliveryRequestForm';

type DeliveryCreateModalProps = {
  readonly opened: boolean;
  readonly onClose: () => void;
  readonly onConfirm: (data: {
    type: 'RECEIVE' | 'DELIVERY';
    assignedTo: string;
    scheduledDate: string;
    notes?: string;
    isUrgentDelivery?: boolean;
    vendorName?: string;
    receiveAddress?: {
      oneLineAddress: string;
      googleMapsUrl?: string;
    };
    purchaseOrderId?: string;
  }) => Promise<void>;
  readonly isLoading?: boolean;
};

export function DeliveryCreateModal({
  opened,
  onClose,
  onConfirm,
  isLoading = false,
}: DeliveryCreateModalProps) {
  const { t } = useTranslation();
  const employees = useEmployees();
  const clientConfig = useClientConfig();
  const vendorOptions = useVendorOptions();

  // Tab state
  const [activeTab, setActiveTab] = useState<string | null>('delivery');

  // Form state
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);
  const [customVendorName, setCustomVendorName] = useState('');
  const [useCustomVendor, setUseCustomVendor] = useState(false);
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(undefined);
  const [notes, setNotes] = useState('');
  const [oneLineAddress, setOneLineAddress] = useState('');
  const [googleMapsUrl, setGoogleMapsUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Employee options for select - filtered by assigneeIds from clientConfig
  const employeeOptions = useMemo(() => {
    const assigneeIds = clientConfig.features?.deliveryRequest?.assigneeIds ?? [];

    // Filter employees based on assigneeIds if configured, otherwise show all
    const filteredEmployees =
      assigneeIds.length > 0
        ? employees.filter((employee) => assigneeIds.includes(employee.id))
        : employees;

    return filteredEmployees.map((employee) => ({
      value: employee.id,
      label: employee.fullName,
    }));
  }, [employees, clientConfig.features?.deliveryRequest]);

  // Auto-fill address and google maps URL when vendor is selected (only in select mode)
  useEffect(() => {
    if (!useCustomVendor && selectedVendorId) {
      const selectedVendor = vendorOptions.find((v) => v.id === selectedVendorId);
      if (selectedVendor) {
        setOneLineAddress(selectedVendor.address ?? '');
        setGoogleMapsUrl(selectedVendor.googleMapsUrl ?? '');
      }
    }
  }, [selectedVendorId, vendorOptions, useCustomVendor]);

  // Clear vendor selection when switching to custom mode
  useEffect(() => {
    if (useCustomVendor) {
      setSelectedVendorId(null);
    } else {
      setCustomVendorName('');
    }
  }, [useCustomVendor]);

  // Reset form when modal closes
  useEffect(() => {
    if (!opened) {
      setSelectedEmployeeId(null);
      setSelectedVendorId(null);
      setCustomVendorName('');
      setUseCustomVendor(false);
      setScheduledDate(undefined);
      setNotes('');
      setOneLineAddress('');
      setGoogleMapsUrl('');
      setIsSubmitting(false);
    }
  }, [opened]);

  // Handle form submission
  const handleSubmit = async () => {
    if (!selectedEmployeeId || !scheduledDate || !oneLineAddress.trim()) {
      return;
    }

    // Validate vendor input based on mode
    let vendorName: string;
    if (useCustomVendor) {
      if (!customVendorName.trim()) {
        return;
      }
      vendorName = customVendorName.trim();
    } else {
      if (!selectedVendorId) {
        return;
      }
      const selectedVendor = vendorOptions.find((v) => v.id === selectedVendorId);
      if (!selectedVendor) {
        return;
      }
      vendorName = selectedVendor.label;
    }

    setIsSubmitting(true);
    try {
      await onConfirm({
        type: 'RECEIVE',
        assignedTo: selectedEmployeeId,
        scheduledDate: scheduledDate.toISOString(),
        notes: notes.trim() || undefined,
        isUrgentDelivery: false,
        vendorName,
        receiveAddress: {
          oneLineAddress: oneLineAddress.trim(),
          googleMapsUrl: googleMapsUrl.trim() || undefined,
        },
      });
      onClose();
    } catch {
      // Error handling is done by the parent component
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = Boolean(
    selectedEmployeeId &&
      scheduledDate &&
      oneLineAddress.trim() &&
      (useCustomVendor ? customVendorName.trim() : selectedVendorId),
  );

  return (
    <ModalOrDrawer
      title={t('delivery.createReceiveRequest')}
      opened={opened}
      onClose={onClose}
      drawerSize="lg"
    >
      <Stack gap="md" style={{ position: 'relative' }}>
        <LoadingOverlay
          visible={isLoading || isSubmitting}
          overlayProps={{ blur: 2 }}
          transitionProps={{ duration: 300 }}
        />

        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Tab value="delivery">{t('delivery.modal.tabs.delivery')}</Tabs.Tab>
            <Tabs.Tab value="receive">{t('delivery.modal.tabs.receive')}</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="receive" pt="md">
            {/* Info Alert */}
            <Alert
              icon={<IconPackage size={20} />}
              title={t('delivery.receiveRequestInfo')}
              color="blue"
              variant="light"
            >
              <Text size="sm">{t('delivery.receiveRequestDescription')}</Text>
            </Alert>

            <ScrollArea style={{ maxHeight: '90vh' }}>
              <Stack gap="md">
                {/* Type Badge */}
                <Group gap="xs">
                  <Text size="sm" fw={500}>
                    {t('delivery.requestType')}:
                  </Text>
                  <Group gap={4}>
                    <IconTruck size={16} />
                    <Text size="sm" c="blue" fw={600}>
                      {t('delivery.receiveType')}
                    </Text>
                  </Group>
                </Group>
                {/* Vendor Input - Toggle between Select and Custom */}
                <Stack gap="xs">
                  <Checkbox
                    label={t('delivery.useCustomVendor')}
                    checked={useCustomVendor}
                    onChange={(e) => setUseCustomVendor(e.currentTarget.checked)}
                    disabled={isLoading || isSubmitting}
                  />

                  {useCustomVendor ? (
                    <TextInput
                      required
                      label={t('delivery.vendorName')}
                      placeholder={t('delivery.vendorNamePlaceholder')}
                      value={customVendorName}
                      onChange={(e) => setCustomVendorName(e.currentTarget.value)}
                      leftSection={<IconMapPin size={16} />}
                      disabled={isLoading || isSubmitting}
                    />
                  ) : (
                    <Select
                      required
                      label={t('delivery.vendorName')}
                      placeholder={t('delivery.vendorNamePlaceholder')}
                      data={vendorOptions}
                      value={selectedVendorId}
                      onChange={setSelectedVendorId}
                      searchable
                      leftSection={<IconMapPin size={16} />}
                      disabled={isLoading || isSubmitting}
                    />
                  )}
                </Stack>

                {/* Vendor Pickup Address */}
                <TextInput
                  required
                  label={t('delivery.vendorPickupAddress')}
                  placeholder={t('delivery.vendorPickupAddressPlaceholder')}
                  value={oneLineAddress}
                  onChange={(e) => setOneLineAddress(e.currentTarget.value)}
                  leftSection={<IconMapPin size={16} />}
                  disabled={isLoading || isSubmitting}
                />

                <TextInput
                  label={t('common.googleMapsUrl')}
                  placeholder={t('common.googleMapsUrlPlaceholder')}
                  value={googleMapsUrl}
                  onChange={(e) => setGoogleMapsUrl(e.currentTarget.value)}
                  leftSection={<IconMapPin size={16} />}
                  disabled={isLoading || isSubmitting}
                />

                {/* Assigned Driver */}
                <Select
                  required
                  label={t('delivery.assignedTo')}
                  placeholder={t('delivery.form.selectDriver')}
                  data={employeeOptions}
                  value={selectedEmployeeId}
                  onChange={setSelectedEmployeeId}
                  searchable
                  leftSection={<IconEdit size={16} />}
                  disabled={isLoading || isSubmitting}
                />

                {/* Scheduled Date */}
                <DateInput
                  required
                  label={t('delivery.scheduledDate')}
                  placeholder={t('delivery.form.selectDate')}
                  value={scheduledDate}
                  onChange={(date) => setScheduledDate(date ? new Date(date) : undefined)}
                  minDate={new Date()}
                  leftSection={<IconCalendar size={16} />}
                  disabled={isLoading || isSubmitting}
                />

                {/* Notes */}
                <Textarea
                  label={t('common.notes')}
                  placeholder={t('delivery.form.enterNotes')}
                  value={notes}
                  onChange={(e) => setNotes(e.currentTarget.value)}
                  rows={3}
                  disabled={isLoading || isSubmitting}
                />
              </Stack>
            </ScrollArea>

            {/* Action Buttons */}
            <Group justify="flex-end" gap="sm" mt="md">
              <Button
                variant="light"
                onClick={onClose}
                disabled={isSubmitting}
                leftSection={<IconX size={16} />}
              >
                {t('common.cancel')}
              </Button>
              <Button
                onClick={handleSubmit}
                loading={isSubmitting}
                disabled={!isFormValid || isLoading}
                leftSection={<IconPackage size={16} />}
              >
                {t('common.add')}
              </Button>
            </Group>
          </Tabs.Panel>

          <Tabs.Panel value="delivery" pt="md">
            <DeliveryRequestForm
              onSuccess={onClose}
              onClose={onClose}
              onSubmit={async (data) => {
                // Create delivery request for each selected PO
                for (const poId of data.purchaseOrderIds) {
                  await onConfirm({
                    type: 'DELIVERY',
                    assignedTo: data.assignedTo,
                    scheduledDate: data.scheduledDate,
                    notes: data.notes,
                    isUrgentDelivery: data.isUrgentDelivery,
                    purchaseOrderId: poId,
                  });
                }
              }}
            />
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </ModalOrDrawer>
  );
}
