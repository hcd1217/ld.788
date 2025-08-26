import { useState, useMemo } from 'react';
import { Paper, Text, Group, Button } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import { IconPlus, IconUpload } from '@tabler/icons-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useAction } from '@/hooks/useAction';
import { useOnce } from '@/hooks/useOnce';
import {
  DataTable,
  AppDesktopLayout,
  AppPageTitle,
  SearchBar,
  Pagination,
  BulkImportModalContent,
} from '@/components/common';
import {
  ProductFormModal,
  type ProductFormValues,
  ProductStatusBadge,
} from '@/components/app/config';
import {
  productService,
  type Product,
  type CreateProductRequest,
  type UpdateProductRequest,
  type BulkUpsertProductsRequest,
  type ProductStatus,
} from '@/services/sales/product';
import { showSuccessNotification, showErrorNotification } from '@/utils/notifications';
import { useClientSidePagination } from '@/hooks/useClientSidePagination';
import { logError } from '@/utils/logger';
import { parseProductExcelFile, generateProductExcelTemplate } from '@/utils/excelParser';

export function ProductConfigPage() {
  const { t, i18n } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [editOpened, { open: openEdit, close: closeEdit }] = useDisclosure(false);
  const [createOpened, { open: openCreate, close: closeCreate }] = useDisclosure(false);

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
      productCode: (value) => (!value ? t('common.error') : null),
      name: (value) => (!value ? t('common.error') : null),
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
    defaultPageSize: 10,
  });

  const loadProducts = useAction<Record<string, never>>({
    options: {
      errorTitle: t('common.error'),
      errorMessage: t('common.loadingFailed'),
    },
    async actionHandler() {
      setIsLoading(true);
      setError(undefined);
      const data = await productService.getAllProducts();
      setProducts(data);
    },
    errorHandler(err) {
      logError('Failed to load products:', err, {
        module: 'ProductConfigPagePage',
        action: 'actionHandler',
      });
      setError(t('common.loadingFailed'));
    },
    cleanupHandler() {
      setIsLoading(false);
    },
  });

  useOnce(() => {
    loadProducts();
  });

  const handleCreateProduct = useAction<ProductFormValues>({
    options: {
      errorTitle: t('common.error'),
      errorMessage: t('common.addFailed'),
    },
    async actionHandler(values) {
      if (!values) {
        throw new Error(t('common.addFailed'));
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
      await productService.createProduct(data);
      showSuccessNotification(
        t('product.created'),
        t('product.createdMessage', { name: values.name }),
      );
      closeCreate();
      form.reset();
      await loadProducts();
    },
    errorHandler(error) {
      logError('Failed to create product:', error, {
        module: 'ProductConfigPagePage',
        action: 'errorHandler',
      });
    },
    cleanupHandler() {
      setIsLoading(false);
    },
  });

  const handleUpdateProduct = useAction<ProductFormValues>({
    options: {
      errorTitle: t('common.error'),
      errorMessage: t('common.updateFailed'),
    },
    async actionHandler(values) {
      if (!values || !selectedProduct) {
        throw new Error(t('common.updateFailed'));
      }
      setIsLoading(true);
      const data: UpdateProductRequest = {
        name: values.name,
        description: values.description || undefined,
        category: values.category || undefined,
        color: values.color || undefined,
        status: values.status,
        unit: values.unit || undefined,
        sku: values.sku || undefined,
        barcode: values.barcode || undefined,
      };
      await productService.updateProduct(selectedProduct.id, data);
      showSuccessNotification(
        t('product.updated'),
        t('product.updatedMessage', { name: values.name }),
      );
      closeEdit();
      await loadProducts();
    },
    errorHandler(error) {
      logError('Failed to update product:', error, {
        module: 'ProductConfigPagePage',
        action: 'errorHandler',
      });
    },
    cleanupHandler() {
      setIsLoading(false);
    },
  });

  const confirmDeleteProduct = useAction<{ product: Product }>({
    options: {
      successTitle: t('product.deleted'),
      errorTitle: t('common.error'),
      errorMessage: t('common.deleteFailed'),
    },
    async actionHandler(values) {
      if (!values?.product) {
        throw new Error(t('common.deleteFailed'));
      }
      setIsLoading(true);
      await productService.deleteProduct(values.product.id);
      showSuccessNotification(
        t('product.deleted'),
        t('product.deletedMessage', { name: values.product.name }),
      );
      await loadProducts();
    },
    errorHandler(error) {
      logError('Failed to delete product:', error, {
        module: 'ProductConfigPagePage',
        action: 'actionHandler',
      });
    },
    cleanupHandler() {
      setIsLoading(false);
    },
  });

  const handleDeleteProduct = (product: Product) => {
    modals.openConfirmModal({
      title: t('common.confirmDelete'),
      children: <Text size="sm">{t('common.confirmDeleteMessage', { name: product.name })}</Text>,
      labels: { confirm: t('common.delete'), cancel: t('common.cancel') },
      confirmProps: { color: 'red' },
      onConfirm: () => confirmDeleteProduct({ product }),
    });
  };

  const openEditModal = (product: Product) => {
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
    form.reset();
    openCreate();
  };

  // Open bulk import modal
  const openBulkImportModal = () => {
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
        if (selectedFile) {
          handleExcelImport({ file: selectedFile });
        } else {
          showErrorNotification(t('common.error'), t('common.selectFile'));
        }
      },
    });
  };

  // Handle Excel file import
  const handleExcelImport = useAction<{ file: File }>({
    options: {
      errorTitle: t('common.error'),
      errorMessage: t('auth.importFailed'),
    },
    async actionHandler(data) {
      if (!data?.file) return;
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

      // Show results
      const message = t('product.bulkImportSuccess', {
        created: result.created,
        updated: result.updated,
        failed: result.failed,
      });

      showSuccessNotification(t('auth.importSuccess'), message);
      modals.closeAll();
      await loadProducts();
    },
    errorHandler(error) {
      logError('Failed to import products from Excel:', error, {
        module: 'ProductConfigPage',
        action: 'handleExcelImport',
      });
    },
    cleanupHandler() {
      setIsLoading(false);
    },
  });

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
            onClick={openBulkImportModal}
          >
            {t('product.bulkImport')}
          </Button>
          <Button leftSection={<IconPlus size={16} />} onClick={openCreateModal}>
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
              width: '150px',
              header: t('common.status'),
              render: (product: Product) => <ProductStatusBadge status={product.status} />,
            },
          ]}
        />
      </Paper>

      <Pagination
        hidden={paginationState.totalPages < 2}
        totalPages={paginationState.totalPages}
        pageSize={paginationState.pageSize}
        currentPage={paginationState.currentPage}
        onPageSizeChange={paginationHandlers.setPageSize}
        onPageChange={paginationHandlers.setCurrentPage}
      />

      <ProductFormModal
        opened={createOpened}
        onClose={closeCreate}
        mode="create"
        form={form}
        onSubmit={handleCreateProduct}
        isLoading={isLoading}
      />

      <ProductFormModal
        opened={editOpened}
        onClose={closeEdit}
        mode="edit"
        form={form}
        onSubmit={handleUpdateProduct}
        onDelete={() => {
          if (selectedProduct) {
            handleDeleteProduct(selectedProduct);
            closeEdit();
          }
        }}
        isLoading={isLoading}
      />
    </AppDesktopLayout>
  );
}
