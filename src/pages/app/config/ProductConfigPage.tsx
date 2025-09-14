import { useMemo, useState } from 'react';

import { Button, Group, Paper, Text } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import { IconPlus, IconUpload } from '@tabler/icons-react';

import {
  ProductFormModal,
  type ProductFormValues,
  ProductStatusBadge,
} from '@/components/app/config';
import {
  AppDesktopLayout,
  AppPageTitle,
  BulkImportModalContent,
  DataTable,
  Pagination,
  PermissionDeniedPage,
  SearchBar,
} from '@/components/common';
import { useClientSidePagination } from '@/hooks/useClientSidePagination';
import { useOnce } from '@/hooks/useOnce';
import { useSimpleSWRAction, useSWRAction } from '@/hooks/useSWRAction';
import { useTranslation } from '@/hooks/useTranslation';
import {
  type BulkUpsertProductsRequest,
  type BulkUpsertProductsResponse,
  type CreateProductRequest,
  type Product,
  productService,
  type ProductStatus,
} from '@/services/sales/product';
import { usePermissions } from '@/stores/useAppStore';
import { generateProductExcelTemplate, parseProductExcelFile } from '@/utils/excelParser';
import { showErrorNotification, showSuccessNotification } from '@/utils/notifications';

export function ProductConfigPage() {
  const { t, i18n } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [editOpened, { open: openEdit, close: closeEdit }] = useDisclosure(false);
  const [createOpened, { open: openCreate, close: closeCreate }] = useDisclosure(false);
  const permissions = usePermissions();

  const form = useForm<ProductFormValues>({
    initialValues: {
      productCode: '',
      name: '',
      description: '',
      category: '',
      color: '',
      status: 'ACTIVE',
      unit: '',
    },
    validate: {
      productCode: (value) => (!value ? t('common.errors.notificationTitle') : null),
      name: (value) => (!value ? t('common.errors.notificationTitle') : null),
    },
  });

  const filteredProducts = useMemo(() => {
    if (!searchQuery) return products;

    const query = searchQuery.toLowerCase();
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(query) ||
        product.productCode.toLowerCase().includes(query) ||
        product.category?.toLowerCase().includes(query) ||
        product.sku?.toLowerCase().includes(query) ||
        product.barcode?.toLowerCase().includes(query),
    );
  }, [products, searchQuery]);

  const [paginatedProducts, paginationState, paginationHandlers] = useClientSidePagination({
    data: filteredProducts,
    defaultPageSize: 20,
  });

  const loadProductsAction = useSimpleSWRAction(
    'load-products',
    async () => {
      setIsLoading(true);
      setError(undefined);
      if (!permissions.product.canView) {
        return [];
      }
      const data = await productService.getAllProducts();
      setProducts(data);
    },
    {
      notifications: {
        errorTitle: t('common.errors.notificationTitle'),
        errorMessage: t('common.loadingFailed'),
      },
      onSettled: () => {
        setIsLoading(false);
      },
    },
  );

  useOnce(() => {
    loadProductsAction.trigger();
  });

  const handleCreateProductAction = useSWRAction(
    'create-product',
    async (values: ProductFormValues): Promise<Product> => {
      if (!permissions.product.canCreate) {
        throw new Error(t('common.doNotHavePermissionForAction'));
      }
      if (!values) {
        throw new Error(t('common.invalidFormData'));
      }
      setIsLoading(true);
      const data: CreateProductRequest = {
        productCode: values.productCode,
        name: values.name,
        description: values.description || undefined,
        category: values.category || undefined,
        color: values.color || undefined,
        status: values.status,
        unit: values.unit || undefined,
      };
      const product = await productService.createProduct(data);
      return product;
    },
    {
      notifications: {
        errorTitle: t('common.errors.notificationTitle'),
        errorMessage: t('common.addFailed', { entity: t('common.entity.product') }),
      },
      onSuccess: (product: Product) => {
        showSuccessNotification(
          t('product.created'),
          t('product.createdMessage', { name: product.name }),
        );
      },
      onSettled: () => {
        setIsLoading(false);
      },
    },
  );

  const handleUpdateProductAction = useSWRAction(
    'update-product',
    async (values: ProductFormValues) => {
      if (!permissions.product.canEdit) {
        throw new Error(t('common.doNotHavePermissionForAction'));
      }
      if (!selectedProduct) {
        throw new Error(t('common.invalidFormData'));
      }
      setIsLoading(true);
      return await productService.updateProduct(selectedProduct?.id, values);
    },
    {
      notifications: {
        errorTitle: t('common.errors.notificationTitle'),
        errorMessage: t('common.updateFailed', { entity: t('common.entity.product') }),
      },
      onSuccess: (product: Product) => {
        showSuccessNotification(
          t('product.updated'),
          t('product.updatedMessage', { name: product.name }),
        );
        closeEdit();
        form.reset();
        loadProductsAction.trigger();
      },
      onSettled: () => {
        setIsLoading(false);
      },
    },
  );

  const deleteProductAction = useSWRAction(
    'delete-product',
    async (product: Product) => {
      await productService.deleteProduct(product.id);
      return product;
    },
    {
      notifications: {
        errorTitle: t('common.errors.notificationTitle'),
        errorMessage: t('common.deleteFailed', { entity: t('common.entity.product') }),
      },
      onSuccess: (product: Product) => {
        showSuccessNotification(
          t('product.deleted'),
          t('product.deletedMessage', { name: product.name }),
        );
        loadProductsAction.trigger();
      },
      onSettled: () => {
        setIsLoading(false);
      },
    },
  );

  const handleDeleteProduct = (product: Product) => {
    if (!permissions.product.canDelete) {
      throw new Error(t('common.doNotHavePermissionForAction'));
    }
    modals.openConfirmModal({
      title: t('common.confirmDelete'),
      children: <Text size="sm">{t('common.confirmDeleteMessage', { name: product.name })}</Text>,
      labels: { confirm: t('common.delete'), cancel: t('common.cancel') },
      confirmProps: { color: 'red' },
      onConfirm: () => deleteProductAction.trigger(product),
    });
  };

  const openEditModal = (product: Product) => {
    if (!permissions.product.canEdit) {
      return;
    }
    setSelectedProduct(product);
    form.setValues({
      productCode: product.productCode,
      name: product.name,
      description: product.description || '',
      category: product.category || '',
      color: product.color || '',
      status: product.status,
      unit: product.unit || 'pcs',
      sku: product.sku || '',
      barcode: product.barcode || '',
    });
    openEdit();
  };

  const openCreateModal = () => {
    if (!permissions.product.canCreate) {
      return;
    }
    form.reset();
    openCreate();
  };

  // Handle Excel file import
  const handleExcelImportAction = useSWRAction(
    'handle-excel-import',
    async (data: { file: File }): Promise<BulkUpsertProductsResponse> => {
      const { file } = data;

      setIsLoading(true);

      // Parse Excel file
      const products = await parseProductExcelFile(file);

      if (products.length === 0) {
        throw new Error(t('product.noValidDataFound'));
      }

      // Prepare request - convert parsed products to API format
      const request: BulkUpsertProductsRequest = {
        products: products.map((p) => ({
          productCode: p.productCode,
          name: p.name,
          description: p.description || undefined,
          category: p.category || undefined,
          color: p.color || undefined,
          status: (p.status as ProductStatus) || 'ACTIVE',
          unit: p.unit || undefined,
          sku: p.sku || undefined,
          barcode: p.barcode || undefined,
        })),
        skipInvalid: false,
      };

      const result = await productService.bulkUpsertProducts(request);
      return result;
    },
    {
      notifications: {
        errorTitle: t('common.errors.notificationTitle'),
        errorMessage: t('common.bulkImport.importFailed', { entity: t('common.entity.product') }),
      },
      onSuccess: async (result: BulkUpsertProductsResponse) => {
        const message = t('product.bulkImportSuccess', {
          created: result.created,
          updated: result.updated,
          failed: result.failed,
        });

        showSuccessNotification(
          t('common.bulkImport.importSuccess', { entity: t('common.entity.product') }),
          message,
        );
        modals.closeAll();
        await loadProductsAction.trigger();
      },
      onSettled: () => {
        setIsLoading(false);
      },
    },
  );

  // Open bulk import modal
  const openBulkImportModal = () => {
    if (!permissions.product.canCreate) {
      return;
    }
    let selectedFile: File | undefined;

    modals.openConfirmModal({
      title: t('product.bulkImport'),
      size: 'lg',
      children: (
        <BulkImportModalContent
          onFileSelect={(file) => {
            selectedFile = file;
          }}
          onDownloadTemplate={() => generateProductExcelTemplate(i18n.language)}
          entityType="product"
          language={i18n.language}
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
        if (!permissions.product.canCreate) {
          throw new Error(t('common.doNotHavePermissionForAction'));
        }
        if (selectedFile) {
          handleExcelImportAction.trigger({ file: selectedFile });
        } else {
          showErrorNotification(
            t('common.errors.notificationTitle'),
            t('common.file.pleaseSelectFileFirst'),
          );
        }
      },
    });
  };

  if (!permissions.product.canView) {
    return <PermissionDeniedPage />;
  }

  return (
    <AppDesktopLayout
      isLoading={isLoading && !createOpened && !editOpened}
      error={error}
      clearError={() => {
        setError(undefined);
      }}
    >
      {/* Page Title with Actions */}
      <Group justify="space-between" align="center" mb="xl">
        <AppPageTitle title={t('common.pages.productManagement')} />
        <Group gap="sm">
          <Button
            variant="light"
            leftSection={<IconUpload size={16} />}
            disabled={!permissions.product.canCreate}
            onClick={openBulkImportModal}
          >
            {t('product.bulkImport')}
          </Button>
          <Button
            disabled={!permissions.product.canCreate}
            leftSection={<IconPlus size={16} />}
            onClick={openCreateModal}
          >
            {t('common.add')}
          </Button>
        </Group>
      </Group>

      <SearchBar
        hidden={products.length < 20}
        placeholder={t('product.searchPlaceholder')}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      <Paper withBorder shadow="md" p="md" radius="md">
        <DataTable
          data={paginatedProducts as Product[]}
          isLoading={false}
          emptyMessage={t('common.noDataFound')}
          onRowClick={openEditModal}
          ariaLabel={t('product.tableAriaLabel')}
          columns={[
            {
              key: 'productCode',
              header: t('product.productCode'),
              width: '120px',
              render: (product: Product) => product.productCode,
            },
            {
              key: 'name',
              header: t('common.name'),
              render: (product: Product) => product.name,
            },
            {
              key: 'unit',
              header: t('product.unit'),
              render: (product: Product) => product.unit || '-',
            },
            {
              key: 'category',
              header: t('product.category'),
              render: (product: Product) => product.category || '-',
            },
            {
              key: 'color',
              header: t('product.color'),
              render: (product: Product) => product.color || '-',
            },
            {
              key: 'status',
              width: '200px',
              header: t('common.status'),
              render: (product: Product) => <ProductStatusBadge status={product.status} />,
            },
          ]}
        />
      </Paper>

      <Pagination
        totalPages={paginationState.totalPages}
        pageSize={paginationState.pageSize}
        currentPage={paginationState.currentPage}
        onPageSizeChange={paginationHandlers.setPageSize}
        onPageChange={paginationHandlers.setCurrentPage}
      />

      <ProductFormModal
        mode="create"
        canCreate={permissions.product.canCreate}
        canDelete={permissions.product.canDelete}
        canEdit={permissions.product.canEdit}
        form={form}
        isLoading={isLoading}
        opened={createOpened}
        onClose={closeCreate}
        onSubmit={handleCreateProductAction.trigger}
      />

      <ProductFormModal
        mode="edit"
        canCreate={permissions.product.canCreate}
        canEdit={permissions.product.canEdit}
        canDelete={permissions.product.canDelete}
        opened={editOpened}
        form={form}
        isLoading={isLoading}
        onClose={closeEdit}
        onSubmit={handleUpdateProductAction.trigger}
        onDelete={() => {
          if (selectedProduct) {
            handleDeleteProduct(selectedProduct);
            closeEdit();
          }
        }}
      />
    </AppDesktopLayout>
  );
}
