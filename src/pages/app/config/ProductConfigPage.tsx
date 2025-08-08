import { useState, useEffect, useCallback, useMemo } from 'react';
import { Paper, Text } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import { IconPlus } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import {
  DataTable,
  PCOnlyAlert,
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
import { showErrorNotification, showSuccessNotification } from '@/utils/notifications';
import { formatCurrency } from '@/utils/string';
import { isDevelopment } from '@/utils/env';
import { useIsDesktop } from '@/hooks/useIsDesktop';
import { useClientSidePagination } from '@/hooks/useClientSidePagination';

export function ProductConfigPage() {
  const { t } = useTranslation();
  const isDesktop = useIsDesktop();
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
      unitPrice: 0,
      costPrice: undefined,
      status: 'ACTIVE',
      stockLevel: 0,
      minStock: 0,
      maxStock: undefined,
      unit: 'pcs',
      sku: '',
      barcode: '',
    },
    validate: {
      productCode: (value) => (!value ? t('common.error') : null),
      name: (value) => (!value ? t('common.error') : null),
      unitPrice: (value) => {
        if (value === undefined || value === null) return t('common.error');
        if (value < 0) return t('product.priceCannotBeNegative');
        return null;
      },
      costPrice: (value) => {
        // costPrice is optional, so undefined/null is valid
        if (value !== undefined && value !== null && value < 0) {
          return t('product.priceCannotBeNegative');
        }
        return null;
      },
      stockLevel: (value) => {
        if (value === undefined || value === null) return t('common.error');
        if (value < 0) return t('product.stockCannotBeNegative');
        return null;
      },
      minStock: (value, values) => {
        if (value === undefined || value === null) return null;
        if (value < 0) return t('product.stockCannotBeNegative');
        if (values.maxStock !== undefined && values.maxStock !== null && value > values.maxStock) {
          return t('product.minStockCannotExceedMax');
        }
        return null;
      },
      maxStock: (value, values) => {
        if (value === undefined || value === null) return null;
        if (value < 0) return t('product.stockCannotBeNegative');
        if (values.minStock !== undefined && values.minStock !== null && value < values.minStock) {
          return t('product.maxStockCannotBeLessThanMin');
        }
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

  const loadProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(undefined);
      const data = await productService.getAllProducts();
      setProducts(data);
    } catch (err) {
      if (isDevelopment) {
        console.error('Failed to load products:', err);
      }
      setError(t('common.loadingFailed'));
      showErrorNotification(t('common.error'), t('common.loadingFailed'));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  const clearError = useCallback(() => {
    setError(undefined);
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleCreateProduct = async (values: ProductFormValues) => {
    try {
      setIsLoading(true);
      const data: CreateProductRequest = {
        productCode: values.productCode,
        name: values.name,
        description: values.description || undefined,
        category: values.category || undefined,
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
      await productService.createProduct(data);
      showSuccessNotification(
        t('product.created'),
        t('product.createdMessage', { name: values.name }),
      );
      closeCreate();
      form.reset();
      await loadProducts();
    } catch (error) {
      if (isDevelopment) {
        console.error('Failed to create product:', error);
      }
      showErrorNotification(t('common.error'), t('common.addFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProduct = async (values: ProductFormValues) => {
    if (!selectedProduct) return;

    try {
      setIsLoading(true);
      const data: UpdateProductRequest = {
        name: values.name,
        description: values.description || undefined,
        category: values.category || undefined,
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
    } catch (error) {
      if (isDevelopment) {
        console.error('Failed to update product:', error);
      }
      showErrorNotification(t('common.error'), t('common.updateFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProduct = (product: Product) => {
    modals.openConfirmModal({
      title: t('common.confirmDelete'),
      children: <Text size="sm">{t('common.confirmDeleteMessage', { name: product.name })}</Text>,
      labels: { confirm: t('common.delete'), cancel: t('common.cancel') },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        try {
          setIsLoading(true);
          await productService.deleteProduct(product.id);
          showSuccessNotification(
            t('product.deleted'),
            t('product.deletedMessage', { name: product.name }),
          );
          await loadProducts();
        } catch (error) {
          if (isDevelopment) {
            console.error('Failed to delete product:', error);
          }
          showErrorNotification(t('common.error'), t('common.deleteFailed'));
        } finally {
          setIsLoading(false);
        }
      },
    });
  };

  const openEditModal = (product: Product) => {
    setSelectedProduct(product);
    form.setValues({
      productCode: product.productCode,
      name: product.name,
      description: product.description || '',
      category: product.category || '',
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

  if (!isDesktop) {
    return <PCOnlyAlert />;
  }

  return (
    <AppDesktopLayout
      isLoading={isLoading && !createOpened && !editOpened}
      error={error}
      clearError={clearError}
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
          data={[...paginatedProducts]}
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
        hidden={paginationState.totalItems === 0}
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
