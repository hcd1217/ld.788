import { useMemo, useState } from 'react';

import { Box, Button, Group, Paper, Stack } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import { IconPlus, IconUpload } from '@tabler/icons-react';

import { ProductCard, ProductFormModal, type ProductFormValues } from '@/components/app/config';
import {
  ActiveBadge,
  AppDesktopLayout,
  AppMobileLayout,
  AppPageTitle,
  BlankState,
  BulkImportModalContent,
  DataTable,
  Pagination,
  PermissionDeniedPage,
  SearchBar,
} from '@/components/common';
import { useClientSidePagination } from '@/hooks/useClientSidePagination';
import { useDeviceType } from '@/hooks/useDeviceType';
import { useOnce } from '@/hooks/useOnce';
import { useSimpleSWRAction, useSWRAction } from '@/hooks/useSWRAction';
import { useTranslation } from '@/hooks/useTranslation';
import {
  type BulkUpsertProductsRequest,
  type BulkUpsertProductsResponse,
  type Product,
  productService,
} from '@/services/sales/product';
import { usePermissions } from '@/stores/useAppStore';
import { generateProductExcelTemplate, parseProductExcelFile } from '@/utils/excelParser';
import { showErrorNotification, showSuccessNotification } from '@/utils/notifications';
import { canCreateProduct, canEditProduct, canViewProduct } from '@/utils/permission.utils';

export function ProductConfigPage() {
  const { t, currentLanguage } = useTranslation();
  const { isMobile } = useDeviceType();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [editOpened, { open: openEdit, close: closeEdit }] = useDisclosure(false);
  const [createOpened, { open: openCreate, close: closeCreate }] = useDisclosure(false);
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
        product.category?.toLowerCase().includes(query),
    );
  }, [products, searchQuery]);

  const [paginatedProducts, paginationState, paginationHandlers] = useClientSidePagination({
    data: filteredProducts,
    defaultPageSize: isMobile ? 1000 : 20,
  });

  const loadProductsAction = useSimpleSWRAction(
    'load-products',
    async () => {
      setIsLoading(true);
      setError(undefined);
      if (!canView) {
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
      if (!canCreate) {
        throw new Error(t('common.doNotHavePermissionForAction'));
      }
      if (!values) {
        throw new Error(t('common.invalidFormData'));
      }
      setIsLoading(true);
      const product = await productService.createProduct({
        productCode: values.productCode,
        metadata: {
          name: values.name,
          description: values.description || undefined,
          category: values.category || undefined,
          unit: values.unit || undefined,
        },
      });
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
      if (!canEdit) {
        throw new Error(t('common.doNotHavePermissionForAction'));
      }
      if (!selectedProduct) {
        throw new Error(t('common.invalidFormData'));
      }
      setIsLoading(true);
      await productService.updateProduct(selectedProduct?.id, {
        metadata: {
          name: values.name,
          description: values.description || undefined,
          category: values.category || undefined,
          unit: values.unit || undefined,
        },
      });
      return selectedProduct;
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

  const handleActivateProductAction = useSWRAction(
    'activate-product',
    async (product: Product) => {
      if (!canEdit) {
        throw new Error(t('common.doNotHavePermissionForAction'));
      }
      setIsLoading(true);
      await productService.activateProduct(product.id);
      return product;
    },
    {
      notifications: {
        errorTitle: t('common.errors.notificationTitle'),
        errorMessage: t('common.updateFailed', { entity: t('common.entity.product') }),
      },
      onSuccess: (product: Product) => {
        showSuccessNotification(
          t('common.activated', {
            entity: t('common.entity.product'),
          }),
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

  const handleDeactivateProductAction = useSWRAction(
    'deactivate-product',
    async (product: Product) => {
      if (!canEdit) {
        throw new Error(t('common.doNotHavePermissionForAction'));
      }
      setIsLoading(true);
      await productService.deactivateProduct(product.id);
      return product;
    },
    {
      notifications: {
        errorTitle: t('common.errors.notificationTitle'),
        errorMessage: t('common.updateFailed', { entity: t('common.entity.product') }),
      },
      onSuccess: (product: Product) => {
        showSuccessNotification(
          t('common.deactivated', {
            entity: t('common.entity.product'),
          }),
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

  const openEditModal = (product: Product) => {
    if (!canEdit) {
      return;
    }
    setSelectedProduct(product);
    form.setValues({
      productCode: product.productCode,
      name: product.name,
      description: product.description || '',
      category: product.category || '',
      unit: product.unit || 'pcs',
      color: product.color || '',
    });
    openEdit();
  };

  const openCreateModal = () => {
    if (!canCreate) {
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
          metadata: {
            name: p.name,
            description: p.description || undefined,
            category: p.category || undefined,
            unit: p.unit || undefined,
            color: p.color || undefined,
          },
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
        const message = t('common.bulkImportSuccess', {
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
    if (!canCreate) {
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
          onDownloadTemplate={() => generateProductExcelTemplate(currentLanguage)}
          entityType="product"
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
        if (!canCreate) {
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
        clearError={() => setError(undefined)}
        header={<AppPageTitle title={t('common.pages.productManagement')} />}
      >
        {/* Sticky Search Bar */}
        <Box
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 100,
            backgroundColor: 'var(--mantine-color-body)',
            paddingTop: '0.5rem',
            paddingBottom: '0.5rem',
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
          title={searchQuery ? t('common.noDataFound') : t('common.noDataFound')}
          description={searchQuery ? t('common.tryDifferentSearch') : t('common.noDataFound')}
        />

        {/* Product List */}
        <Box mt="md">
          {paginatedProducts.length > 0 && (
            <Stack gap="sm" px="sm">
              {paginatedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </Stack>
          )}
        </Box>

        {/* Pagination */}
        <Pagination
          totalPages={paginationState.totalPages}
          pageSize={paginationState.pageSize}
          currentPage={paginationState.currentPage}
          onPageSizeChange={paginationHandlers.setPageSize}
          onPageChange={paginationHandlers.setCurrentPage}
        />
      </AppMobileLayout>
    );
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
            disabled={!canCreate}
            onClick={openBulkImportModal}
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
          data={paginatedProducts as Product[]}
          isLoading={false}
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
                return (
                  <ActiveBadge
                    isActive={!product.isDeleted}
                    label={product.isDeleted ? t('product.inactive') : t('product.active')}
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
        onSubmit={handleCreateProductAction.trigger}
      />

      <ProductFormModal
        mode="edit"
        product={selectedProduct}
        opened={editOpened}
        form={form}
        isLoading={isLoading}
        onClose={closeEdit}
        onSubmit={handleUpdateProductAction.trigger}
        onActivate={() => selectedProduct && handleActivateProductAction.trigger(selectedProduct)}
        onDeactivate={() =>
          selectedProduct && handleDeactivateProductAction.trigger(selectedProduct)
        }
      />
    </AppDesktopLayout>
  );
}
