import { useMemo } from 'react';

import { Box, Button, Group, Paper, Stack } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconPlus, IconUpload } from '@tabler/icons-react';

import { ProductCard, ProductFormModal, type ProductFormValues } from '@/components/app/config';
import {
  ActiveBadge,
  AppDesktopLayout,
  AppMobileLayout,
  AppPageTitle,
  BlankState,
  DataTable,
  Pagination,
  PermissionDeniedPage,
  SearchBar,
} from '@/components/common';
import { useConfigPage } from '@/hooks/useConfigPage';
import { useDeviceType } from '@/hooks/useDeviceType';
import { useTranslation } from '@/hooks/useTranslation';
import {
  type BulkUpsertProductsRequest,
  type BulkUpsertProductsResponse,
  type CreateProductRequest,
  type Product,
  productService,
  type UpdateProductRequest,
} from '@/services/sales/product';
import { usePermissions } from '@/stores/useAppStore';
import { generateProductExcelTemplate, parseProductExcelFile } from '@/utils/excelParser';
import { canCreateProduct, canEditProduct, canViewProduct } from '@/utils/permission.utils';

export function ProductConfigPage() {
  const { t } = useTranslation();
  const { isMobile } = useDeviceType();
  const permissions = usePermissions();

  const { canView, canCreate, canEdit } = useMemo(() => {
    return {
      canView: canViewProduct(permissions),
      canCreate: canCreateProduct(permissions),
      canEdit: canEditProduct(permissions),
    };
  }, [permissions]);

  const form = useForm<ProductFormValues>({
    initialValues: {
      productCode: '',
      name: '',
      description: '',
      category: '',
      unit: '',
      color: '',
    },
    validate: {
      productCode: (value) => (!value ? t('validation.fieldRequired') : null),
      name: (value) => (!value ? t('validation.fieldRequired') : null),
    },
  });

  // Service adapter for the generic hook
  const service = useMemo(
    () => ({
      getAll: productService.getAllProducts,
      create: productService.createProduct,
      update: productService.updateProduct,
      activate: async (product: Product) => {
        await productService.activateProduct(product.id);
      },
      deactivate: async (product: Product) => {
        await productService.deactivateProduct(product.id);
      },
      bulkUpsert: productService.bulkUpsertProducts,
    }),
    [],
  );

  const {
    items: paginatedProducts,
    allItems: products,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    selectedItem: selectedProduct,
    editOpened,
    createOpened,
    closeEdit,
    closeCreate,
    handleCreate,
    handleUpdate,
    handleActivate,
    handleDeactivate,
    openEditModal,
    openCreateModal,
    openBulkImportModal,
    paginationState,
    paginationHandlers,
    clearError,
  } = useConfigPage<
    Product,
    ProductFormValues,
    CreateProductRequest,
    UpdateProductRequest,
    BulkUpsertProductsRequest,
    BulkUpsertProductsResponse
  >({
    service,
    permissions: { canView, canCreate, canEdit },
    entityName: 'product',
    form,
    transformToCreateRequest: (values) => ({
      productCode: values.productCode,
      metadata: {
        name: values.name,
        description: values.description || undefined,
        category: values.category || undefined,
        unit: values.unit || undefined,
      },
    }),
    transformToUpdateRequest: (values) => ({
      metadata: {
        name: values.name,
        description: values.description || undefined,
        category: values.category || undefined,
        unit: values.unit || undefined,
      },
    }),
    transformToBulkRequest: (products) => ({
      products: products.map((p) => ({
        productCode: p.productCode,
        metadata: {
          name: p.name,
          description: p.description || undefined,
          category: p.category || undefined,
          unit: p.unit || undefined,
          color: p.color || undefined,
        },
      })),
      skipInvalid: false,
    }),
    parseExcelFile: parseProductExcelFile,
    generateExcelTemplate: generateProductExcelTemplate,
    setFormValues: (product, form) => {
      form.setValues({
        productCode: product.productCode,
        name: product.name,
        description: product.description || '',
        category: product.category || '',
        unit: product.unit || 'pcs',
        color: product.color || '',
      });
    },
    searchFilter: (product, query) =>
      product.name.toLowerCase().includes(query) ||
      product.productCode.toLowerCase().includes(query) ||
      (product.category?.toLowerCase().includes(query) ?? false),
  });

  if (!canView) {
    return <PermissionDeniedPage />;
  }

  if (isMobile) {
    return (
      <AppMobileLayout
        showLogo
        withGoBack
        isLoading={isLoading}
        error={error}
        clearError={clearError}
        header={<AppPageTitle title={t('common.pages.productManagement')} />}
      >
        {/* Sticky Search Bar */}
        <Box
          py="xs"
          bg="var(--mantine-color-body)"
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 100,
          }}
        >
          <SearchBar
            placeholder={t('product.searchPlaceholder')}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        </Box>

        {/* Blank State for no results */}
        <BlankState
          hidden={paginatedProducts.length > 0 || isLoading}
          title={t('common.noDataFound')}
          description={searchQuery ? t('common.tryDifferentSearch') : t('common.noDataFound')}
        />

        {/* Product List */}
        <Box mb="xl">
          {paginatedProducts.length > 0 && (
            <Stack gap="sm" px="sm">
              {paginatedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </Stack>
          )}
        </Box>
      </AppMobileLayout>
    );
  }

  return (
    <AppDesktopLayout
      isLoading={isLoading && !createOpened && !editOpened}
      error={error}
      clearError={clearError}
    >
      {/* Page Title with Actions */}
      <Group justify="space-between" align="center" mb="xl">
        <AppPageTitle title={t('common.pages.productManagement')} />
        <Group gap="sm">
          <Button
            variant="light"
            leftSection={<IconUpload size={16} />}
            disabled={!canCreate}
            onClick={() => openBulkImportModal()}
          >
            {t('product.bulkImport')}
          </Button>
          <Button
            disabled={!canCreate}
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
          withIndex
          indexStart={(paginationState.currentPage - 1) * paginationState.pageSize + 1}
          data={paginatedProducts as Product[]}
          emptyMessage={t('common.noDataFound')}
          onRowClick={openEditModal}
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
              width: '100px',
              render: (product: Product) => product.unit || '-',
            },
            {
              key: 'category',
              header: t('product.category'),
              width: '200px',
              render: (product: Product) => product.category || '-',
            },
            {
              key: 'status',
              header: t('common.status'),
              width: '200px',
              render: (product: Product) => {
                const isActive = product.isActive ?? true;
                return (
                  <ActiveBadge
                    isActive={isActive}
                    label={isActive ? t('product.active') : t('product.inactive')}
                  />
                );
              },
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
        form={form}
        isLoading={isLoading}
        opened={createOpened}
        onClose={closeCreate}
        onSubmit={handleCreate}
      />

      <ProductFormModal
        mode="edit"
        product={selectedProduct}
        opened={editOpened}
        form={form}
        isLoading={isLoading}
        onClose={closeEdit}
        onSubmit={handleUpdate}
        onActivate={() => selectedProduct && handleActivate(selectedProduct)}
        onDeactivate={() => selectedProduct && handleDeactivate(selectedProduct)}
      />
    </AppDesktopLayout>
  );
}
