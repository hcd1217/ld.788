import { BaseApiClient } from '../base';
import { randomElement } from '@/utils/fake';
import {
  // Customer schemas
  GetCustomersResponseSchema,
  CreateCustomerRequestSchema,
  CreateCustomerResponseSchema,
  UpdateCustomerRequestSchema,
  UpdateCustomerResponseSchema,
  GetCustomerResponseSchema,
  type GetCustomersResponse,
  type CreateCustomerRequest,
  type CreateCustomerResponse,
  type UpdateCustomerRequest,
  type UpdateCustomerResponse,
  type GetCustomerResponse,
  // Purchase Order schemas
  GetPurchaseOrdersResponseSchema,
  CreatePurchaseOrderRequestSchema,
  CreatePurchaseOrderResponseSchema,
  UpdatePurchaseOrderRequestSchema,
  UpdatePurchaseOrderResponseSchema,
  GetPurchaseOrderResponseSchema,
  UpdatePOStatusRequestSchema,
  type GetPurchaseOrdersResponse,
  type CreatePurchaseOrderRequest,
  type CreatePurchaseOrderResponse,
  type UpdatePurchaseOrderRequest,
  type UpdatePurchaseOrderResponse,
  type GetPurchaseOrderResponse,
  type UpdatePOStatusRequest,
  type POStatus,
  type Customer,
  type PurchaseOrder,
  type POItem,
  type Address,
  // Product schemas
  GetProductsResponseSchema,
  CreateProductRequestSchema,
  CreateProductResponseSchema,
  UpdateProductRequestSchema,
  UpdateProductResponseSchema,
  GetProductResponseSchema,
  type GetProductsResponse,
  type CreateProductRequest,
  type CreateProductResponse,
  type UpdateProductRequest,
  type UpdateProductResponse,
  type GetProductResponse,
  type ProductStatus,
  type Product,
} from '../schemas/sales.schemas';
import { logError } from '@/utils/logger';

// ========== Fake Data Generation ==========
// cspell:words cust

// Sample data for fake Purchase Order generation
const contactNames = [
  'James Wilson',
  'Sarah Johnson',
  'Michael Chen',
  'Emily Davis',
  'Robert Lee',
  'Jennifer Martinez',
  'David Thompson',
  'Lisa Anderson',
  'Christopher Taylor',
  'Maria Rodriguez',
  'William Brown',
  'Jessica White',
  'Daniel Kim',
  'Amanda Harris',
  'Matthew Clark',
  'Sophia Lewis',
  'Andrew Walker',
  'Olivia Hall',
  'Joseph Young',
  'Isabella King',
];

const paymentTermsList = ['Net 30', 'Net 60', 'Due on Receipt', '2/10 Net 30', 'COD'];

// cspell:disable
const streets = [
  'Nguyễn Huệ',
  'Lê Lợi',
  'Trần Hưng Đạo',
  'Võ Văn Tần',
  'Hai Bà Trưng',
  'Lý Thường Kiệt',
];
const cities = ['Ho Chi Minh City', 'Hanoi', 'Da Nang', 'Can Tho', 'Nha Trang', 'Hue'];
// cspell:enable
const generateFakeAddress = (): Address => ({
  street: `${Math.floor(Math.random() * 999) + 1} ${randomElement(streets)} Street`,
  city: randomElement(cities),
  state: undefined,
  postalCode: `${Math.floor(Math.random() * 90000) + 10000}`,
  country: 'Vietnam',
});

const generateFakePOItems = (products: Product[], count?: number): POItem[] => {
  const itemCount = count || Math.floor(Math.random() * 5) + 1; // 1-5 items per PO
  const activeProducts = products.filter((p) => p.status === 'ACTIVE' || p.status === 'LOW_STOCK');

  if (activeProducts.length === 0) {
    return [];
  }

  const selectedProducts = new Set<string>();
  const items: POItem[] = [];

  for (let i = 0; i < itemCount && i < activeProducts.length; i++) {
    // Select unique products for the PO
    let product: Product;
    do {
      product = randomElement(activeProducts);
    } while (selectedProducts.has(product.id) && selectedProducts.size < activeProducts.length);

    selectedProducts.add(product.id);

    const quantity = Math.floor(Math.random() * 20) + 1; // 1-20 units
    const discount = Math.random() > 0.7 ? Math.random() * 0.15 : 0; // 30% chance of up to 15% discount
    const totalPrice = quantity * product.unitPrice * (1 - discount);

    // Generate color options for certain categories
    const colors = ['Black', 'White', 'Silver', 'Blue', 'Red', 'Gray'];
    const needsColor = ['Electronics', 'Office Supplies', 'Hardware'].includes(
      product.category || '',
    );

    items.push({
      id: `item-${Date.now()}-${i}`,
      purchaseOrderId: '',
      productCode: product.productCode,
      description: product.name,
      color: needsColor && Math.random() > 0.3 ? randomElement(colors) : undefined,
      quantity,
      unitPrice: product.unitPrice,
      totalPrice: Math.round(totalPrice * 100) / 100,
      discount: discount > 0 ? Math.round(discount * 10000) / 10000 : undefined,
      category: product.category,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  return items;
};

const calculatePOTotal = (items: POItem[]): number => {
  return items.reduce((sum, item) => sum + item.totalPrice, 0);
};

// Note: generateFakeCustomers removed - using real API data

const generateFakePOs = (customers: Customer[], products: Product[]): PurchaseOrder[] => {
  const activeCustomers = customers.filter((c) => c.isActive);
  const purchaseOrders: PurchaseOrder[] = [];

  if (activeCustomers.length === 0 || products.length === 0) {
    return purchaseOrders;
  }

  // Generate 30-50 POs
  const poCount = Math.floor(Math.random() * 20) + 30;

  for (let index = 0; index < poCount; index++) {
    const customer = randomElement(activeCustomers);
    const status = randomElement<POStatus>([
      'NEW',
      'NEW', // More NEW orders
      'CONFIRMED',
      'CONFIRMED',
      'PROCESSING',
      'PROCESSING',
      'SHIPPED',
      'DELIVERED',
      'CANCELLED',
    ]);
    const daysAgo = Math.floor(Math.random() * 90);
    const orderDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
    const items = generateFakePOItems(products);

    const po: PurchaseOrder = {
      id: `po-${Date.now()}-${index}`,
      clientId: 'fake-client-id',
      poNumber: `PO-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900000) + 100000)}`,
      customer,
      customerId: customer.id,
      status,
      totalAmount: calculatePOTotal(items),
      orderDate,
      items: items.map((item) => ({ ...item, purchaseOrderId: `po-${Date.now()}-${index}` })),
      createdBy: randomElement(contactNames),
      shippingAddress: generateFakeAddress(),
      billingAddress: Math.random() > 0.5 ? generateFakeAddress() : undefined,
      paymentTerms: randomElement(paymentTermsList),
      notes: Math.random() > 0.7 ? 'Special delivery instructions' : undefined,
      metadata: {},
      createdAt: orderDate,
      updatedAt: new Date(orderDate.getTime() + Math.random() * (Date.now() - orderDate.getTime())),
      deliveryDate: undefined,
      completedDate: undefined,
      processedBy: undefined,
      shippedBy: undefined,
      deliveredBy: undefined,
      cancelledBy: undefined,
      cancelReason: undefined,
      refundedBy: undefined,
      refundReason: undefined,
      refundAmount: undefined,
    };

    // Set dates and responsible persons based on status
    if (['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'].includes(status)) {
      po.processedBy = randomElement(contactNames);
    }
    if (['SHIPPED', 'DELIVERED'].includes(status)) {
      const shippedDaysAfter = Math.floor(Math.random() * 7) + 1;
      po.deliveryDate = new Date(orderDate.getTime() + shippedDaysAfter * 24 * 60 * 60 * 1000);
      po.shippedBy = randomElement(contactNames);
    }
    if (status === 'DELIVERED') {
      const deliveredDaysAfter = Math.floor(Math.random() * 3) + 1;
      po.completedDate = new Date(
        new Date(po.deliveryDate || orderDate).getTime() + deliveredDaysAfter * 24 * 60 * 60 * 1000,
      );
      po.deliveredBy = randomElement(contactNames);
    }
    if (status === 'CANCELLED') {
      po.cancelledBy = randomElement(contactNames);
      po.cancelReason = randomElement([
        'Customer request',
        'Out of stock',
        'Payment issue',
        'Duplicate order',
      ]);
    }

    purchaseOrders.push(po);
  }

  return purchaseOrders;
};

// Note: generateFakeProducts removed - using real API data

// Mock data storage - Only for Purchase Orders
class MockDataStore {
  private purchaseOrders: PurchaseOrder[] = [];
  private cachedCustomers: Customer[] = [];
  private cachedProducts: Product[] = [];
  private initialized = false;
  private lastFetch = 0;
  private CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

  async initialize(): Promise<void> {
    if (!this.initialized || Date.now() - this.lastFetch > this.CACHE_DURATION) {
      // Fetch real customers and products from API
      await this.refreshCache();
      this.purchaseOrders = generateFakePOs(this.cachedCustomers, this.cachedProducts);
      this.initialized = true;
      this.lastFetch = Date.now();
    }
  }

  async refreshCache(): Promise<void> {
    try {
      // Note: We need access to the API instance, will be passed from SalesApi
      // For now, these will be populated by SalesApi
      console.log('Cache needs to be refreshed from API');
    } catch (error) {
      logError('Failed to refresh cache:', error, {
        module: 'Sales.serviceService',
        action: 'refreshCache',
      });
    }
  }

  setCachedCustomers(customers: Customer[]): void {
    this.cachedCustomers = customers;
  }

  setCachedProducts(products: Product[]): void {
    this.cachedProducts = products;
  }

  getCachedCustomers(): Customer[] {
    return this.cachedCustomers;
  }

  getCachedProducts(): Product[] {
    return this.cachedProducts;
  }

  async getPurchaseOrders(): Promise<PurchaseOrder[]> {
    await this.initialize();
    return this.purchaseOrders;
  }

  async getPurchaseOrder(id: string): Promise<PurchaseOrder | undefined> {
    await this.initialize();
    return this.purchaseOrders.find((po) => po.id === id);
  }

  addPurchaseOrder(po: PurchaseOrder): void {
    this.purchaseOrders.unshift(po);
  }

  updatePurchaseOrder(id: string, data: Partial<PurchaseOrder>): PurchaseOrder | undefined {
    const index = this.purchaseOrders.findIndex((po) => po.id === id);
    if (index === -1) return undefined;

    this.purchaseOrders[index] = {
      ...this.purchaseOrders[index],
      ...data,
      updatedAt: new Date(),
    };
    return this.purchaseOrders[index];
  }

  deletePurchaseOrder(id: string): boolean {
    const index = this.purchaseOrders.findIndex((po) => po.id === id);
    if (index === -1) return false;
    this.purchaseOrders.splice(index, 1);
    return true;
  }

  getCustomer(id: string): Customer | undefined {
    return this.cachedCustomers.find((c) => c.id === id);
  }

  getProduct(id: string): Product | undefined {
    return this.cachedProducts.find((p) => p.id === id);
  }
}

const mockStore = new MockDataStore();

export class SalesApi extends BaseApiClient {
  private useMockPOData = false; // Only mock Purchase Orders, not customers/products

  // Initialize mock store with real data from API
  private async initializeMockStore(): Promise<void> {
    try {
      // Fetch real customers and products
      const [customersResponse, productsResponse] = await Promise.all([
        this.get<GetCustomersResponse, void>(
          '/api/sales/customers?limit=1000',
          undefined,
          GetCustomersResponseSchema,
        ),
        this.get<GetProductsResponse, void>(
          '/api/sales/products?limit=1000',
          undefined,
          GetProductsResponseSchema,
        ),
      ]);

      // Cache the real data in mock store
      mockStore.setCachedCustomers(customersResponse.customers);
      mockStore.setCachedProducts(productsResponse.products);
      await mockStore.initialize();
    } catch (error) {
      logError('Failed to initialize mock store with real data:', error, {
        module: 'Sales.serviceService',
        action: 'catch',
      });
    }
  }

  // Enable/disable mock data mode for Purchase Orders only
  setMockPOMode(enabled: boolean): void {
    this.useMockPOData = enabled;
  }

  // ========== Customer Methods ==========

  async getCustomers(params?: {
    name?: string;
    companyName?: string;
    contactEmail?: string;
    isActive?: boolean;
    cursor?: string;
    limit?: number;
    sortBy?: 'createdAt' | 'name' | 'companyName' | 'updatedAt';
    sortOrder?: 'asc' | 'desc';
  }): Promise<GetCustomersResponse> {
    // Always use real API for customers
    const queryParams = new URLSearchParams();

    if (params?.name) queryParams.append('name', params.name);
    if (params?.companyName) queryParams.append('companyName', params.companyName);
    if (params?.contactEmail) queryParams.append('contactEmail', params.contactEmail);
    if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
    if (params?.cursor) queryParams.append('cursor', params.cursor);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    // Default limit if not provided
    if (!params?.limit) queryParams.append('limit', '1000');

    const url = `/api/sales/customers${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.get<GetCustomersResponse, void>(url, undefined, GetCustomersResponseSchema);
  }

  async getCustomerById(id: string): Promise<GetCustomerResponse> {
    // Always use real API for customers
    return this.get<GetCustomerResponse, void>(
      `/api/sales/customers/${id}`,
      undefined,
      GetCustomerResponseSchema,
    );
  }

  async createCustomer(data: CreateCustomerRequest): Promise<CreateCustomerResponse> {
    // Always use real API for customers
    return this.post<CreateCustomerResponse, CreateCustomerRequest>(
      '/api/sales/customers',
      data,
      CreateCustomerResponseSchema,
      CreateCustomerRequestSchema,
    );
  }

  async updateCustomer(id: string, data: UpdateCustomerRequest): Promise<UpdateCustomerResponse> {
    // Always use real API for customers
    return this.patch<UpdateCustomerResponse, UpdateCustomerRequest>(
      `/api/sales/customers/${id}`,
      data,
      UpdateCustomerResponseSchema,
      UpdateCustomerRequestSchema,
    );
  }

  async deleteCustomer(id: string): Promise<void> {
    // Always use real API for customers
    await this.delete(`/api/sales/customers/${id}`);
  }

  // ========== Purchase Order Methods ==========

  async getPurchaseOrders(params?: {
    poNumber?: string;
    customerId?: string;
    status?: POStatus;
    orderDateFrom?: string;
    orderDateTo?: string;
    cursor?: string;
    limit?: number;
    sortBy?: 'createdAt' | 'orderDate' | 'poNumber' | 'totalAmount' | 'updatedAt';
    sortOrder?: 'asc' | 'desc';
  }): Promise<GetPurchaseOrdersResponse> {
    if (this.useMockPOData) {
      // Initialize mock store with real customers/products if needed
      await this.initializeMockStore();
      let orders = await mockStore.getPurchaseOrders();

      // Apply filters
      if (params?.poNumber) {
        const searchPO = params.poNumber.toLowerCase();
        orders = orders.filter((po) => po.poNumber.toLowerCase().includes(searchPO));
      }
      if (params?.customerId) {
        orders = orders.filter((po) => po.customerId === params.customerId);
      }
      if (params?.status) {
        orders = orders.filter((po) => po.status === params.status);
      }
      if (params?.orderDateFrom) {
        const fromDate = new Date(params.orderDateFrom);
        orders = orders.filter((po) => new Date(po.orderDate) >= fromDate);
      }
      if (params?.orderDateTo) {
        const toDate = new Date(params.orderDateTo);
        orders = orders.filter((po) => new Date(po.orderDate) <= toDate);
      }

      // Apply sorting
      if (params?.sortBy) {
        orders.sort((a, b) => {
          const sortBy = params.sortBy!;
          const aVal = a[sortBy as keyof PurchaseOrder];
          const bVal = b[sortBy as keyof PurchaseOrder];
          const comparison = (aVal ?? '') > (bVal ?? '') ? 1 : (aVal ?? '') < (bVal ?? '') ? -1 : 0;
          return params.sortOrder === 'desc' ? -comparison : comparison;
        });
      }

      // Apply limit
      const limit = params?.limit || 1000;
      const paginatedOrders = orders.slice(0, limit);

      return Promise.resolve({
        purchaseOrders: paginatedOrders,
        pagination: {
          limit,
          hasNext: orders.length > limit,
          hasPrev: false,
          nextCursor: orders.length > limit ? 'next' : undefined,
          prevCursor: undefined,
        },
      });
    }

    const queryParams = new URLSearchParams();

    if (params?.poNumber) queryParams.append('poNumber', params.poNumber);
    if (params?.customerId) queryParams.append('customerId', params.customerId);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.orderDateFrom) queryParams.append('orderDateFrom', params.orderDateFrom);
    if (params?.orderDateTo) queryParams.append('orderDateTo', params.orderDateTo);
    if (params?.cursor) queryParams.append('cursor', params.cursor);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    // Default limit if not provided
    if (!params?.limit) queryParams.append('limit', '1000');

    const url = `/api/sales/purchase-orders${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.get<GetPurchaseOrdersResponse, void>(
      url,
      undefined,
      GetPurchaseOrdersResponseSchema,
    );
  }

  async getPurchaseOrderById(id: string): Promise<GetPurchaseOrderResponse> {
    if (this.useMockPOData) {
      await this.initializeMockStore();
      const order = await mockStore.getPurchaseOrder(id);
      if (!order) {
        throw new Error('Purchase order not found');
      }
      return Promise.resolve(order);
    }

    return this.get<GetPurchaseOrderResponse, void>(
      `/api/sales/purchase-orders/${id}`,
      undefined,
      GetPurchaseOrderResponseSchema,
    );
  }

  async createPurchaseOrder(
    data: CreatePurchaseOrderRequest,
  ): Promise<CreatePurchaseOrderResponse> {
    if (this.useMockPOData) {
      await this.initializeMockStore();
      const items = data.items.map((item, index) => ({
        id: `item-${Date.now()}-${index}`,
        purchaseOrderId: '',
        productCode: item.productCode,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.quantity * item.unitPrice * (1 - (item.discount || 0)),
        discount: item.discount,
        category: item.category,
        metadata: item.metadata,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      const newPO: PurchaseOrder = {
        id: `po-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        clientId: 'fake-client-id',
        poNumber: `PO-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900000) + 100000)}`,
        customerId: data.customerId,
        customer: mockStore.getCustomer(data.customerId),
        status: 'NEW',
        totalAmount: calculatePOTotal(items),
        orderDate: new Date(data.orderDate),
        deliveryDate: data.deliveryDate ? new Date(data.deliveryDate) : undefined,
        items: items.map((item) => ({
          ...item,
          purchaseOrderId: `po-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        })),
        createdBy: randomElement(contactNames),
        shippingAddress: data.shippingAddress,
        billingAddress: data.billingAddress,
        paymentTerms: data.paymentTerms,
        notes: data.notes,
        metadata: data.metadata || {},
        createdAt: new Date(),
        updatedAt: new Date(),
        completedDate: undefined,
        processedBy: undefined,
        shippedBy: undefined,
        deliveredBy: undefined,
        cancelledBy: undefined,
        cancelReason: undefined,
        refundedBy: undefined,
        refundReason: undefined,
        refundAmount: undefined,
      };
      mockStore.addPurchaseOrder(newPO);
      return Promise.resolve(newPO);
    }

    return this.post<CreatePurchaseOrderResponse, CreatePurchaseOrderRequest>(
      '/api/sales/purchase-orders',
      data,
      CreatePurchaseOrderResponseSchema,
      CreatePurchaseOrderRequestSchema,
    );
  }

  async updatePurchaseOrder(
    id: string,
    data: UpdatePurchaseOrderRequest,
  ): Promise<UpdatePurchaseOrderResponse> {
    if (this.useMockPOData) {
      await this.initializeMockStore();
      let updateData: Partial<PurchaseOrder> = {
        customerId: data.customerId,
        status: data.status,
        paymentTerms: data.paymentTerms,
        notes: data.notes,
        metadata: data.metadata,
        shippingAddress: data.shippingAddress,
        billingAddress: data.billingAddress,
      };

      if (data.orderDate) {
        updateData.orderDate = new Date(data.orderDate);
      }
      if (data.deliveryDate !== undefined) {
        updateData.deliveryDate = data.deliveryDate ? new Date(data.deliveryDate) : undefined;
      }
      if (data.completedDate !== undefined) {
        updateData.completedDate = data.completedDate ? new Date(data.completedDate) : undefined;
      }

      if (data.items) {
        updateData.items = data.items.map((item, index) => ({
          id: `item-${Date.now()}-${index}`,
          purchaseOrderId: id,
          productCode: item.productCode,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.quantity * item.unitPrice * (1 - (item.discount || 0)),
          discount: item.discount,
          category: item.category,
          metadata: item.metadata,
          createdAt: new Date(),
          updatedAt: new Date(),
        }));
      }

      const updated = mockStore.updatePurchaseOrder(id, updateData);
      if (!updated) {
        throw new Error('Purchase order not found');
      }
      return Promise.resolve(updated);
    }

    return this.patch<UpdatePurchaseOrderResponse, UpdatePurchaseOrderRequest>(
      `/api/sales/purchase-orders/${id}`,
      data,
      UpdatePurchaseOrderResponseSchema,
      UpdatePurchaseOrderRequestSchema,
    );
  }

  async deletePurchaseOrder(id: string): Promise<void> {
    if (this.useMockPOData) {
      await this.initializeMockStore();
      const deleted = mockStore.deletePurchaseOrder(id);
      if (!deleted) {
        throw new Error('Purchase order not found');
      }
      return Promise.resolve();
    }

    await this.delete(`/api/sales/purchase-orders/${id}`);
  }

  // ========== Purchase Order Status Methods ==========

  async confirmPurchaseOrder(
    id: string,
    data?: UpdatePOStatusRequest,
  ): Promise<UpdatePurchaseOrderResponse> {
    if (this.useMockPOData) {
      await this.initializeMockStore();
      const updated = mockStore.updatePurchaseOrder(id, {
        status: 'CONFIRMED',
        processedBy: randomElement(contactNames),
      });
      if (!updated) {
        throw new Error('Purchase order not found');
      }
      return Promise.resolve(updated);
    }

    return this.patch<UpdatePurchaseOrderResponse, UpdatePOStatusRequest | undefined>(
      `/api/sales/purchase-orders/${id}/confirm`,
      data,
      UpdatePurchaseOrderResponseSchema,
      data ? UpdatePOStatusRequestSchema : undefined,
    );
  }

  async processPurchaseOrder(
    id: string,
    data?: UpdatePOStatusRequest,
  ): Promise<UpdatePurchaseOrderResponse> {
    if (this.useMockPOData) {
      await this.initializeMockStore();
      const updated = mockStore.updatePurchaseOrder(id, {
        status: 'PROCESSING',
        processedBy: randomElement(contactNames),
      });
      if (!updated) {
        throw new Error('Purchase order not found');
      }
      return Promise.resolve(updated);
    }

    return this.patch<UpdatePurchaseOrderResponse, UpdatePOStatusRequest | undefined>(
      `/api/sales/purchase-orders/${id}/process`,
      data,
      UpdatePurchaseOrderResponseSchema,
      data ? UpdatePOStatusRequestSchema : undefined,
    );
  }

  async shipPurchaseOrder(
    id: string,
    data?: UpdatePOStatusRequest,
  ): Promise<UpdatePurchaseOrderResponse> {
    if (this.useMockPOData) {
      await this.initializeMockStore();
      const daysAhead = Math.floor(Math.random() * 7) + 1;
      const updated = mockStore.updatePurchaseOrder(id, {
        status: 'SHIPPED',
        shippedBy: randomElement(contactNames),
        deliveryDate: new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000),
      });
      if (!updated) {
        throw new Error('Purchase order not found');
      }
      return Promise.resolve(updated);
    }

    return this.patch<UpdatePurchaseOrderResponse, UpdatePOStatusRequest | undefined>(
      `/api/sales/purchase-orders/${id}/ship`,
      data,
      UpdatePurchaseOrderResponseSchema,
      data ? UpdatePOStatusRequestSchema : undefined,
    );
  }

  async deliverPurchaseOrder(
    id: string,
    data?: UpdatePOStatusRequest,
  ): Promise<UpdatePurchaseOrderResponse> {
    if (this.useMockPOData) {
      await this.initializeMockStore();
      const updated = mockStore.updatePurchaseOrder(id, {
        status: 'DELIVERED',
        deliveredBy: randomElement(contactNames),
        completedDate: new Date(),
      });
      if (!updated) {
        throw new Error('Purchase order not found');
      }
      return Promise.resolve(updated);
    }

    return this.patch<UpdatePurchaseOrderResponse, UpdatePOStatusRequest | undefined>(
      `/api/sales/purchase-orders/${id}/deliver`,
      data,
      UpdatePurchaseOrderResponseSchema,
      data ? UpdatePOStatusRequestSchema : undefined,
    );
  }

  async cancelPurchaseOrder(
    id: string,
    data?: UpdatePOStatusRequest,
  ): Promise<UpdatePurchaseOrderResponse> {
    if (this.useMockPOData) {
      await this.initializeMockStore();
      const updated = mockStore.updatePurchaseOrder(id, {
        status: 'CANCELLED',
        cancelledBy: randomElement(contactNames),
        cancelReason: data?.cancelReason,
      });
      if (!updated) {
        throw new Error('Purchase order not found');
      }
      return Promise.resolve(updated);
    }

    return this.patch<UpdatePurchaseOrderResponse, UpdatePOStatusRequest | undefined>(
      `/api/sales/purchase-orders/${id}/cancel`,
      data,
      UpdatePurchaseOrderResponseSchema,
      data ? UpdatePOStatusRequestSchema : undefined,
    );
  }

  async refundPurchaseOrder(
    id: string,
    data?: UpdatePOStatusRequest,
  ): Promise<UpdatePurchaseOrderResponse> {
    if (this.useMockPOData) {
      await this.initializeMockStore();
      const updated = mockStore.updatePurchaseOrder(id, {
        status: 'REFUNDED',
        refundedBy: randomElement(contactNames),
        refundReason: data?.refundReason,
        refundAmount: data?.refundAmount,
      });
      if (!updated) {
        throw new Error('Purchase order not found');
      }
      return Promise.resolve(updated);
    }

    return this.patch<UpdatePurchaseOrderResponse, UpdatePOStatusRequest | undefined>(
      `/api/sales/purchase-orders/${id}/refund`,
      data,
      UpdatePurchaseOrderResponseSchema,
      data ? UpdatePOStatusRequestSchema : undefined,
    );
  }

  // ========== Product Methods ==========

  async getProducts(params?: {
    search?: string;
    category?: string;
    status?: ProductStatus;
    minPrice?: number;
    maxPrice?: number;
    lowStock?: boolean;
    cursor?: string;
    limit?: number;
    sortBy?: 'name' | 'productCode' | 'unitPrice' | 'stockLevel' | 'createdAt';
    sortOrder?: 'asc' | 'desc';
  }): Promise<GetProductsResponse> {
    // Always use real API for products
    const queryParams = new URLSearchParams();

    if (params?.search) queryParams.append('search', params.search);
    if (params?.category) queryParams.append('category', params.category);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.minPrice !== undefined) queryParams.append('minPrice', params.minPrice.toString());
    if (params?.maxPrice !== undefined) queryParams.append('maxPrice', params.maxPrice.toString());
    if (params?.lowStock !== undefined) queryParams.append('lowStock', params.lowStock.toString());
    if (params?.cursor) queryParams.append('cursor', params.cursor);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    // Default limit if not provided
    if (!params?.limit) queryParams.append('limit', '20');

    const url = `/api/sales/products${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.get<GetProductsResponse, void>(url, undefined, GetProductsResponseSchema);
  }

  async getProductById(id: string): Promise<GetProductResponse> {
    // Always use real API for products
    return this.get<GetProductResponse, void>(
      `/api/sales/products/${id}`,
      undefined,
      GetProductResponseSchema,
    );
  }

  async createProduct(data: CreateProductRequest): Promise<CreateProductResponse> {
    // Always use real API for products
    return this.post<CreateProductResponse, CreateProductRequest>(
      '/api/sales/products',
      data,
      CreateProductResponseSchema,
      CreateProductRequestSchema,
    );
  }

  async updateProduct(id: string, data: UpdateProductRequest): Promise<UpdateProductResponse> {
    // Always use real API for products
    return this.patch<UpdateProductResponse, UpdateProductRequest>(
      `/api/sales/products/${id}`,
      data,
      UpdateProductResponseSchema,
      UpdateProductRequestSchema,
    );
  }

  async deleteProduct(id: string): Promise<void> {
    // Always use real API for products
    await this.delete(`/api/sales/products/${id}`);
  }
}
