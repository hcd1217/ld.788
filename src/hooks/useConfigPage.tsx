import { useMemo, useState } from 'react';

import { type UseFormReturnType } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import { IconUpload } from '@tabler/icons-react';

import { BulkImportModalContent } from '@/components/common';
import { useClientSidePagination } from '@/hooks/useClientSidePagination';
import { useDeviceType } from '@/hooks/useDeviceType';
import { useOnce } from '@/hooks/useOnce';
import { useSimpleSWRAction, useSWRAction } from '@/hooks/useSWRAction';
import { useTranslation } from '@/hooks/useTranslation';
import { showErrorNotification, showSuccessNotification } from '@/utils/notifications';

export interface BaseEntity {
  id: string;
  name: string;
  isActive?: boolean;
}

export interface ConfigService<
  T extends BaseEntity,
  CreateRequest,
  UpdateRequest,
  BulkRequest,
  BulkResponse,
> {
  getAll: () => Promise<T[]>;
  create: (data: CreateRequest) => Promise<T>;
  update: (id: string, data: UpdateRequest) => Promise<void>;
  activate?: (entity: T) => Promise<void>;
  deactivate?: (entity: T) => Promise<void>;
  bulkUpsert?: (data: BulkRequest) => Promise<BulkResponse>;
}

export interface UseConfigPageOptions<
  T extends BaseEntity,
  FormValues,
  CreateRequest,
  UpdateRequest,
  BulkRequest,
  BulkResponse,
> {
  service: ConfigService<T, CreateRequest, UpdateRequest, BulkRequest, BulkResponse>;
  permissions: {
    canView: boolean;
    canCreate: boolean;
    canEdit: boolean;
    canDelete?: boolean;
  };
  entityName: string;
  form: UseFormReturnType<FormValues>;
  transformToCreateRequest: (values: FormValues) => CreateRequest;
  transformToUpdateRequest: (values: FormValues) => UpdateRequest;
  transformToBulkRequest?: (items: any[]) => BulkRequest;
  parseExcelFile?: (file: File) => Promise<any[]>;
  generateExcelTemplate?: (language: string, options?: any) => void;
  setFormValues: (entity: T, form: UseFormReturnType<FormValues>) => void;
  searchFilter: (entity: T, query: string) => boolean;
  defaultPageSize?: number;
}

export interface BulkImportResult {
  created: number;
  updated: number;
  failed: number;
}

export function useConfigPage<
  T extends BaseEntity,
  FormValues,
  CreateRequest,
  UpdateRequest,
  BulkRequest,
  BulkResponse extends BulkImportResult,
>({
  service,
  permissions,
  entityName,
  form,
  transformToCreateRequest,
  transformToUpdateRequest,
  transformToBulkRequest,
  parseExcelFile,
  generateExcelTemplate,
  setFormValues,
  searchFilter,
  defaultPageSize = 20,
}: UseConfigPageOptions<T, FormValues, CreateRequest, UpdateRequest, BulkRequest, BulkResponse>) {
  const { t, currentLanguage } = useTranslation();
  const { isMobile } = useDeviceType();

  // State
  const [items, setItems] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [selectedItem, setSelectedItem] = useState<T | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal states
  const [editOpened, { open: openEdit, close: closeEdit }] = useDisclosure(false);
  const [createOpened, { open: openCreate, close: closeCreate }] = useDisclosure(false);

  // Filter items based on search
  const filteredItems = useMemo(() => {
    if (!searchQuery) return items;
    const query = searchQuery.toLowerCase();
    return items.filter((item) => searchFilter(item, query));
  }, [items, searchQuery, searchFilter]);

  // Pagination
  const [paginatedItems, paginationState, paginationHandlers] = useClientSidePagination({
    data: filteredItems,
    defaultPageSize: isMobile ? 10_000 : defaultPageSize,
    noPagination: isMobile,
  });

  // Load items action
  const loadItemsAction = useSimpleSWRAction(
    `load-${entityName}`,
    async () => {
      setIsLoading(true);
      setError(undefined);
      if (!permissions.canView) {
        return [];
      }
      const data = await service.getAll();
      setItems(data);
    },
    {
      notifications: {
        errorTitle: t('common.errors.notificationTitle'),
        errorMessage: t('common.loadingFailed'),
      },
      onError: (err) => {
        setError(err.message);
      },
      onSettled: () => {
        setIsLoading(false);
      },
    },
  );

  // Load items on mount
  useOnce(() => {
    loadItemsAction.trigger();
  });

  // Create item action
  const handleCreateAction = useSWRAction(
    `create-${entityName}`,
    async (values: FormValues): Promise<T> => {
      if (!permissions.canCreate) {
        throw new Error(t('common.doNotHavePermissionForAction'));
      }
      if (!values) {
        throw new Error(t('common.invalidFormData'));
      }
      setIsLoading(true);
      const request = transformToCreateRequest(values);
      const item = await service.create(request);
      return item;
    },
    {
      notifications: {
        errorTitle: t('common.errors.notificationTitle'),
        errorMessage: t('common.addFailed', { entity: t(`common.entity.${entityName}` as any) }),
      },
      onSuccess: (item: T) => {
        showSuccessNotification(
          t(`${entityName}.created` as any),
          t(`${entityName}.createdMessage` as any, { name: item.name }),
        );
        closeCreate();
        form.reset();
        loadItemsAction.trigger();
      },
      onError: (err) => {
        setError(err.message);
      },
      onSettled: () => {
        setIsLoading(false);
      },
    },
  );

  // Update item action
  const handleUpdateAction = useSWRAction(
    `update-${entityName}`,
    async (values: FormValues) => {
      if (!permissions.canEdit) {
        throw new Error(t('common.doNotHavePermissionForAction'));
      }
      if (!selectedItem) {
        throw new Error(t('common.invalidFormData'));
      }
      setIsLoading(true);
      const request = transformToUpdateRequest(values);
      await service.update(selectedItem.id, request);
      return selectedItem;
    },
    {
      notifications: {
        errorTitle: t('common.errors.notificationTitle'),
        errorMessage: t('common.updateFailed', { entity: t(`common.entity.${entityName}` as any) }),
      },
      onSuccess: (item: T) => {
        showSuccessNotification(
          t(`${entityName}.updated` as any),
          t(`${entityName}.updatedMessage` as any, { name: item.name }),
        );
        closeEdit();
        form.reset();
        loadItemsAction.trigger();
      },
      onError: (err) => {
        setError(err.message);
      },
      onSettled: () => {
        setIsLoading(false);
      },
    },
  );

  // Activate item action
  const handleActivateAction = useSWRAction(
    `activate-${entityName}`,
    async (item: T) => {
      if (!permissions.canEdit || !service.activate) {
        throw new Error(t('common.doNotHavePermissionForAction'));
      }
      setIsLoading(true);
      await service.activate(item);
      return item;
    },
    {
      notifications: {
        errorTitle: t('common.errors.notificationTitle'),
        errorMessage: t('common.updateFailed', { entity: t(`common.entity.${entityName}` as any) }),
      },
      onSuccess: (item: T) => {
        showSuccessNotification(
          t('common.activated', { entity: t(`common.entity.${entityName}` as any) }),
          t(`${entityName}.updatedMessage` as any, { name: item.name }),
        );
        closeEdit();
        form.reset();
        loadItemsAction.trigger();
      },
      onError: (err) => {
        setError(err.message);
      },
      onSettled: () => {
        setIsLoading(false);
      },
    },
  );

  // Deactivate item action
  const handleDeactivateAction = useSWRAction(
    `deactivate-${entityName}`,
    async (item: T) => {
      if (!permissions.canEdit || !service.deactivate) {
        throw new Error(t('common.doNotHavePermissionForAction'));
      }
      setIsLoading(true);
      await service.deactivate(item);
      return item;
    },
    {
      notifications: {
        errorTitle: t('common.errors.notificationTitle'),
        errorMessage: t('common.updateFailed', { entity: t(`common.entity.${entityName}` as any) }),
      },
      onSuccess: (item: T) => {
        showSuccessNotification(
          t('common.deactivated', { entity: t(`common.entity.${entityName}` as any) }),
          t(`${entityName}.updatedMessage` as any, { name: item.name }),
        );
        closeEdit();
        form.reset();
        loadItemsAction.trigger();
      },
      onError: (err) => {
        setError(err.message);
      },
      onSettled: () => {
        setIsLoading(false);
      },
    },
  );

  // Bulk import action
  const handleBulkImportAction = useSWRAction(
    `bulk-import-${entityName}`,
    async (data: { file: File }): Promise<BulkResponse> => {
      if (
        !permissions.canCreate ||
        !service.bulkUpsert ||
        !parseExcelFile ||
        !transformToBulkRequest
      ) {
        throw new Error(t('common.doNotHavePermissionForAction'));
      }

      const { file } = data;
      setIsLoading(true);

      // Parse Excel file
      const items = await parseExcelFile(file);

      if (items.length === 0) {
        throw new Error(t(`${entityName}.noValidDataFound` as any));
      }

      // Transform to bulk request
      const request = transformToBulkRequest(items);
      const result = await service.bulkUpsert(request);
      return result;
    },
    {
      notifications: {
        errorTitle: t('common.errors.notificationTitle'),
        errorMessage: t('common.bulkImport.importFailed', {
          entity: t(`common.entity.${entityName}` as any),
        }),
      },
      onSuccess: async (result: BulkResponse) => {
        const message = t('common.bulkImportSuccess', {
          created: result.created,
          updated: result.updated,
          failed: result.failed,
        });

        showSuccessNotification(
          t('common.bulkImport.importSuccess', { entity: t(`common.entity.${entityName}` as any) }),
          message,
        );
        modals.closeAll();
        await loadItemsAction.trigger();
      },
      onError: (err) => {
        setError(err.message);
      },
      onSettled: () => {
        setIsLoading(false);
      },
    },
  );

  // Modal handlers
  const openEditModal = (item: T) => {
    if (!permissions.canEdit) {
      return;
    }
    setSelectedItem(item);
    setFormValues(item, form);
    openEdit();
  };

  const openCreateModal = () => {
    if (!permissions.canCreate) {
      return;
    }
    form.reset();
    openCreate();
  };

  const openBulkImportModal = (options?: any) => {
    if (!permissions.canCreate || !generateExcelTemplate) {
      return;
    }

    let selectedFile: File | undefined;

    modals.openConfirmModal({
      title: t(`${entityName}.bulkImport` as any),
      size: 'lg',
      children: (
        <BulkImportModalContent
          onFileSelect={(file) => {
            selectedFile = file;
          }}
          onDownloadTemplate={() => generateExcelTemplate(currentLanguage, options)}
          entityType={entityName as 'product' | 'customer' | 'employee'}
          language={currentLanguage}
        />
      ),
      labels: {
        confirm: t('common.import'),
        cancel: t('common.cancel'),
      },
      confirmProps: {
        loading: isLoading,
        leftSection: <IconUpload size={16} />,
      },
      onConfirm: () => {
        if (selectedFile) {
          handleBulkImportAction.trigger({ file: selectedFile });
        } else {
          showErrorNotification(
            t('common.errors.notificationTitle'),
            t('common.file.pleaseSelectFileFirst'),
          );
        }
      },
    });
  };

  const clearError = () => setError(undefined);

  return {
    // State
    items: paginatedItems,
    allItems: items,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    selectedItem,

    // Modal states
    editOpened,
    createOpened,
    closeEdit,
    closeCreate,

    // Actions
    loadItems: loadItemsAction.trigger,
    handleCreate: handleCreateAction.trigger,
    handleUpdate: handleUpdateAction.trigger,
    handleActivate: handleActivateAction.trigger,
    handleDeactivate: handleDeactivateAction.trigger,
    handleBulkImport: handleBulkImportAction.trigger,

    // Modal handlers
    openEditModal,
    openCreateModal,
    openBulkImportModal,

    // Pagination
    paginationState,
    paginationHandlers,

    // Utils
    clearError,
    form,
  };
}
