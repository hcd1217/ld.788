import { useState, useMemo } from 'react';
import { Paper, Text } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import { IconPlus } from '@tabler/icons-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useAction } from '@/hooks/useAction';
import { useOnce } from '@/hooks/useOnce';
import {
  DataTable,
  AppDesktopLayout,
  AppPageTitle,
  SearchBar,
  Pagination,
} from '@/components/common';
import {
  ProductFormModal,
  type ProductFormValues,
  ProductStatusBadge,
  ProductStockInfo,
} from '@/components/app/config';
import {
  productService,
  type Product,
  type CreateProductRequest,
  type UpdateProductRequest,
} from '@/services/sales/product';
import { showSuccessNotification } from '@/utils/notifications';
import { formatCurrency } from '@/utils/string';
import { isDevelopment } from '@/utils/env';
import { useClientSidePagination } from '@/hooks/useClientSidePagination';

export function ProductConfigPage() {
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [editOpened, { open: openEdit, close: closeEdit }] = useDisclosure(false);
  const [createOpened, { open: openCreate, close: closeCreate }] = useDisclosure(false);

  const form = useForm<ProductFormValues>({
    initialValues: isDevelopment
      ? {
          // cspell:disable
          productCode: 'MX_800',
          name: 'Mâm xoay bàn nhôm 800mm',
          description: '',
          category: '',
          color: 'Trắng',
          unitPrice: 1350000,
          status: 'ACTIVE',
          unit: 'Cái',
        }
      : {
          productCode: '',
          name: '',
          description: '',
          category: '',
          color: '',
          unitPrice: 0,
          status: 'ACTIVE',
          unit: '',
        },
    validate: {
      productCode: (value) => (!value ? t('common.error') : null),
      name: (value) => (!value ? t('common.error') : null),
      unitPrice: (value) => {
        if (value === undefined || value === null) return t('common.error');
        if (value < 0) return t('product.priceCannotBeNegative');
        return null;
      },
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
      if (isDevelopment) {
        console.error('Failed to load products:', err);
      }
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
        unitPrice: values.unitPrice,
        costPrice: values.costPrice || undefined,
        status: values.status,
        stockLevel: values.stockLevel ?? 0,
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
      if (isDevelopment) {
        console.error('Failed to create product:', error);
      }
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
        unitPrice: values.unitPrice,
        costPrice: values.costPrice || undefined,
        status: values.status,
        stockLevel: values.stockLevel,
        minStock: values.minStock || undefined,
        maxStock: values.maxStock || undefined,
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
      if (isDevelopment) {
        console.error('Failed to update product:', error);
      }
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
      if (isDevelopment) {
        console.error('Failed to delete product:', error);
      }
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
      unitPrice: product.unitPrice,
      costPrice: product.costPrice || undefined,
      status: product.status,
      stockLevel: product.stockLevel,
      minStock: product.minStock || 0,
      maxStock: product.maxStock || undefined,
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

  return (
    <AppDesktopLayout
      isLoading={isLoading && !createOpened && !editOpened}
      error={error}
      clearError={() => {
        setError(undefined);
      }}
    >
      <AppPageTitle
        title={t('common.pages.productManagement')}
        button={{
          label: t('common.add'),
          onClick: openCreateModal,
          icon: <IconPlus size={16} />,
        }}
      />

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
              key: 'unitPrice',
              header: t('product.unitPrice'),
              width: '120px',
              render: (product: Product) =>
                product.unitPrice !== undefined ? formatCurrency(product.unitPrice) : '-',
            },
            {
              key: 'stock',
              header: t('product.stock'),
              width: '150px',
              render: (product: Product) => <ProductStockInfo product={product} />,
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
