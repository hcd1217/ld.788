import { BaseApiClient } from '../base';
import { fakeEmail, firstName, lastName, randomElement } from '@/utils/fake';
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

// ========== Fake Data Generation ==========
// cspell:words cust

// Sample data for fake generation
const companyNames = [
  'ABC Corporation',
  'XYZ Industries',
  'Global Tech Solutions',
  'Prime Manufacturing',
  'Elite Services',
  'Innovative Systems',
  'Quality Products Ltd',
  'Dynamic Enterprises',
  'Modern Solutions',
  'Advanced Technologies',
  'Future Vision Corp',
  'Smart Industries',
];

const productCategories = ['Electronics', 'Office Supplies', 'Hardware', 'Software', 'Services'];
const paymentTermsList = ['Net 30', 'Net 60', 'Due on Receipt', '2/10 Net 30', 'COD'];

const productNames = [
  'Laptop Computer',
  'Desktop Monitor',
  'Wireless Mouse',
  'Mechanical Keyboard',
  'Office Chair',
  'Standing Desk',
  'Printer Paper',
  'Toner Cartridge',
  'USB Cable',
  'HDMI Adapter',
  'External Hard Drive',
  'Cloud Storage License',
  'Software Subscription',
  'Technical Support',
  'Consultation Service',
  'Training Package',
];

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

const generateFakePOItems = (count: number = Math.floor(Math.random() * 9) + 1): POItem[] => {
  return Array.from({ length: count }, (_, index) => {
    const quantity = Math.floor(Math.random() * 99) + 1;
    const unitPrice = Math.floor(Math.random() * 4990) + 10;
    const discount = Math.random() > 0.7 ? Math.random() * 0.2 : 0;
    const totalPrice = quantity * unitPrice * (1 - discount);

    return {
      id: `item-${Date.now()}-${index}`,
      purchaseOrderId: '',
      productCode: `PRD-${Math.floor(Math.random() * 9000) + 1000}`,
      description: randomElement(productNames),
      quantity,
      unitPrice,
      totalPrice: Math.round(totalPrice * 100) / 100,
      discount: discount > 0 ? Math.round(discount * 100) / 100 : undefined,
      category: randomElement(productCategories),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  });
};

const calculatePOTotal = (items: POItem[]): number => {
  return items.reduce((sum, item) => sum + item.totalPrice, 0);
};

const generateFakeCustomers = (): Customer[] => {
  return Array.from({ length: 20 }, (_, index) => {
    const fname = firstName();
    const lname = lastName();
    const fullName = `${lname} ${fname}`;
    const company = randomElement(companyNames);

    return {
      id: `cust-${Date.now()}-${index}`,
      clientId: 'fake-client-id',
      name: fullName,
      companyName: Math.random() > 0.3 ? company : undefined,
      contactEmail: fakeEmail(fullName),
      contactPhone: `0${Math.floor(Math.random() * 9) + 1}0-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 900) + 100}`,
      creditLimit: Math.floor(Math.random() * 100 + 50) * 1000000, // 50M to 150M
      creditUsed: Math.floor(Math.random() * 40) * 1000000, // 0 to 40M
      // cspell:disable-next-line
      address: `${Math.floor(Math.random() * 999) + 1} ${randomElement(['Nguyễn Huệ', 'Lê Lợi', 'Trần Hưng Đạo', 'Võ Văn Tần'])} Street, District ${Math.floor(Math.random() * 12) + 1}`,
      isActive: Math.random() > 0.1, // 90% active
      deletedAt: undefined,
      deletedBy: undefined,
      metadata: {},
      createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000 * 2), // Past 2 years
      updatedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Past 30 days
    };
  });
};

const generateFakePOs = (customers: Customer[]): PurchaseOrder[] => {
  const activeCustomers = customers.filter((c) => c.isActive);

  return Array.from({ length: 50 }, (_, index) => {
    const customer = randomElement(activeCustomers);
    const status = randomElement<POStatus>([
      'NEW',
      'CONFIRMED',
      'PROCESSING',
      'SHIPPED',
      'DELIVERED',
      'CANCELLED',
    ]);
    const daysAgo = Math.floor(Math.random() * 90);
    const orderDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
    const items = generateFakePOItems();

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
      createdBy: `${lastName()} ${firstName()}`,
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

    // Set dates based on status
    if (['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'].includes(status)) {
      po.processedBy = `${lastName()} ${firstName()}`;
    }
    if (['SHIPPED', 'DELIVERED'].includes(status)) {
      const shippedDaysAfter = Math.floor(Math.random() * 7) + 1;
      po.deliveryDate = new Date(orderDate.getTime() + shippedDaysAfter * 24 * 60 * 60 * 1000);
    }
    if (status === 'DELIVERED') {
      const deliveredDaysAfter = Math.floor(Math.random() * 3) + 1;
      po.completedDate = new Date(
        new Date(po.deliveryDate || orderDate).getTime() + deliveredDaysAfter * 24 * 60 * 60 * 1000,
      );
    }

    return po;
  });
};

const generateFakeProducts = (): Product[] => {
  const units = ['pcs', 'box', 'pack', 'set', 'unit', 'kg', 'gram', 'liter', 'meter'];

  const productData = [
    // Electronics
    { name: 'Laptop Computer Pro', category: 'Electronics', basePrice: 25000000, code: 'LAP' },
    { name: 'Desktop Monitor 27"', category: 'Electronics', basePrice: 8000000, code: 'MON' },
    { name: 'Wireless Mouse', category: 'Electronics', basePrice: 500000, code: 'MOU' },
    { name: 'Mechanical Keyboard', category: 'Electronics', basePrice: 2000000, code: 'KEY' },
    { name: 'USB-C Hub', category: 'Electronics', basePrice: 1500000, code: 'HUB' },
    { name: 'Webcam HD', category: 'Electronics', basePrice: 1800000, code: 'CAM' },
    { name: 'External SSD 1TB', category: 'Electronics', basePrice: 3000000, code: 'SSD' },
    { name: 'Wireless Headphones', category: 'Electronics', basePrice: 2500000, code: 'HDP' },

    // Office Supplies
    {
      name: 'Office Chair Ergonomic',
      category: 'Office Supplies',
      basePrice: 5000000,
      code: 'CHR',
    },
    { name: 'Standing Desk', category: 'Office Supplies', basePrice: 8000000, code: 'DSK' },
    { name: 'Printer Paper A4', category: 'Office Supplies', basePrice: 80000, code: 'PAP' },
    { name: 'Toner Cartridge Black', category: 'Office Supplies', basePrice: 1200000, code: 'TNR' },
    { name: 'Whiteboard Marker Set', category: 'Office Supplies', basePrice: 50000, code: 'MRK' },
    { name: 'File Cabinet 4-Drawer', category: 'Office Supplies', basePrice: 3500000, code: 'CAB' },
    { name: 'Desk Lamp LED', category: 'Office Supplies', basePrice: 800000, code: 'LMP' },

    // Hardware
    { name: 'HDMI Cable 2m', category: 'Hardware', basePrice: 200000, code: 'HDM' },
    { name: 'USB Cable Type-C', category: 'Hardware', basePrice: 150000, code: 'USB' },
    { name: 'Power Strip 6-Outlet', category: 'Hardware', basePrice: 300000, code: 'PWR' },
    { name: 'Network Cable Cat6', category: 'Hardware', basePrice: 100000, code: 'NET' },
    { name: 'Screwdriver Set', category: 'Hardware', basePrice: 250000, code: 'SCR' },

    // Software
    { name: 'Office Suite License', category: 'Software', basePrice: 2000000, code: 'OFC' },
    { name: 'Antivirus Software', category: 'Software', basePrice: 800000, code: 'ANT' },
    { name: 'Cloud Storage 1TB/Year', category: 'Software', basePrice: 1500000, code: 'CLD' },
    { name: 'Project Management Tool', category: 'Software', basePrice: 500000, code: 'PMT' },
    { name: 'Video Editing Software', category: 'Software', basePrice: 3000000, code: 'VID' },

    // Services
    { name: 'IT Support Package', category: 'Services', basePrice: 5000000, code: 'ITS' },
    { name: 'Consultation Hour', category: 'Services', basePrice: 1000000, code: 'CON' },
    { name: 'Training Session', category: 'Services', basePrice: 3000000, code: 'TRN' },
    { name: 'System Installation', category: 'Services', basePrice: 2000000, code: 'INS' },
    { name: 'Maintenance Contract', category: 'Services', basePrice: 10000000, code: 'MNT' },
  ];

  return productData.map((item, index) => {
    const stockLevel = Math.floor(Math.random() * 500);
    const minStock = Math.floor(Math.random() * 50) + 10;
    const maxStock = minStock + Math.floor(Math.random() * 450) + 100;

    // Determine status based on stock level
    let status: ProductStatus = 'ACTIVE';
    if (Math.random() < 0.1) {
      status = randomElement(['DISCONTINUED', 'INACTIVE']);
    } else if (stockLevel === 0) {
      status = 'OUT_OF_STOCK';
    } else if (stockLevel < minStock) {
      status = 'LOW_STOCK';
    }

    const product: Product = {
      id: `prod-${Date.now()}-${index}`,
      productCode: `${item.code}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
      name: item.name,
      description: `High-quality ${item.name.toLowerCase()} for professional use`,
      category: item.category,
      unitPrice: item.basePrice + (Math.random() * item.basePrice * 0.2 - item.basePrice * 0.1),
      costPrice: item.basePrice * (0.6 + Math.random() * 0.2),
      status,
      stockLevel,
      minStock,
      maxStock,
      unit: randomElement(units),
      sku: `SKU-${item.code}-${String(Math.floor(Math.random() * 900000) + 100000)}`,
      barcode: `${Math.floor(Math.random() * 9000000000000) + 1000000000000}`,
      weight: Math.random() < 0.7 ? Math.floor(Math.random() * 5000) + 100 : undefined,
      dimensions:
        Math.random() < 0.5
          ? {
              length: Math.floor(Math.random() * 50) + 10,
              width: Math.floor(Math.random() * 50) + 10,
              height: Math.floor(Math.random() * 30) + 5,
            }
          : undefined,
      metadata: {},
      createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000 * 2),
      updatedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
    };

    return product;
  });
};

// Mock data storage
class MockDataStore {
  private customers: Customer[] = [];
  private purchaseOrders: PurchaseOrder[] = [];
  private products: Product[] = [];
  private initialized = false;

  private initialize(): void {
    if (!this.initialized) {
      this.customers = generateFakeCustomers();
      this.purchaseOrders = generateFakePOs(this.customers);
      this.products = generateFakeProducts();
      this.initialized = true;
    }
  }

  getCustomers(): Customer[] {
    this.initialize();
    return this.customers;
  }

  getCustomer(id: string): Customer | undefined {
    this.initialize();
    return this.customers.find((c) => c.id === id);
  }

  addCustomer(customer: Customer): void {
    this.customers.unshift(customer);
  }

  updateCustomer(id: string, data: Partial<Customer>): Customer | undefined {
    const index = this.customers.findIndex((c) => c.id === id);
    if (index === -1) return undefined;

    this.customers[index] = {
      ...this.customers[index],
      ...data,
      updatedAt: new Date(),
    };
    return this.customers[index];
  }

  deleteCustomer(id: string): boolean {
    const index = this.customers.findIndex((c) => c.id === id);
    if (index === -1) return false;
    this.customers.splice(index, 1);
    return true;
  }

  getPurchaseOrders(): PurchaseOrder[] {
    this.initialize();
    return this.purchaseOrders;
  }

  getPurchaseOrder(id: string): PurchaseOrder | undefined {
    this.initialize();
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

  getProducts(): Product[] {
    this.initialize();
    return this.products;
  }

  getProduct(id: string): Product | undefined {
    this.initialize();
    return this.products.find((p) => p.id === id);
  }

  addProduct(product: Product): void {
    this.products.unshift(product);
  }

  updateProduct(id: string, data: Partial<Product>): Product | undefined {
    const index = this.products.findIndex((p) => p.id === id);
    if (index === -1) return undefined;

    this.products[index] = {
      ...this.products[index],
      ...data,
      updatedAt: new Date(),
    };
    return this.products[index];
  }

  deleteProduct(id: string): boolean {
    const index = this.products.findIndex((p) => p.id === id);
    if (index === -1) return false;
    this.products.splice(index, 1);
    return true;
  }
}

const mockStore = new MockDataStore();

export class SalesApi extends BaseApiClient {
  private useMockData = true;

  // Enable/disable mock data mode
  setMockMode(enabled: boolean): void {
    this.useMockData = enabled;
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
    // Use mock data if enabled
    if (this.useMockData) {
      let customers = mockStore.getCustomers();

      // Apply filters
      if (params?.name) {
        const searchName = params.name.toLowerCase();
        customers = customers.filter((c) => c.name.toLowerCase().includes(searchName));
      }
      if (params?.companyName) {
        const searchCompany = params.companyName.toLowerCase();
        customers = customers.filter((c) => c.companyName?.toLowerCase().includes(searchCompany));
      }
      if (params?.contactEmail) {
        const searchEmail = params.contactEmail.toLowerCase();
        customers = customers.filter((c) => c.contactEmail?.toLowerCase().includes(searchEmail));
      }
      if (params?.isActive !== undefined) {
        customers = customers.filter((c) => c.isActive === params.isActive);
      }

      // Apply sorting
      if (params?.sortBy) {
        customers.sort((a, b) => {
          const sortBy = params.sortBy!;
          const aVal = a[sortBy as keyof Customer];
          const bVal = b[sortBy as keyof Customer];
          const comparison = (aVal ?? '') > (bVal ?? '') ? 1 : (aVal ?? '') < (bVal ?? '') ? -1 : 0;
          return params.sortOrder === 'desc' ? -comparison : comparison;
        });
      }

      // Apply limit
      const limit = params?.limit || 1000;
      const paginatedCustomers = customers.slice(0, limit);

      return Promise.resolve({
        customers: paginatedCustomers,
        pagination: {
          limit,
          hasNext: customers.length > limit,
          hasPrev: false,
          nextCursor: customers.length > limit ? 'next' : undefined,
          prevCursor: undefined,
        },
      });
    }

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
    if (this.useMockData) {
      const customer = mockStore.getCustomer(id);
      if (!customer) {
        throw new Error('Customer not found');
      }
      return Promise.resolve(customer);
    }

    return this.get<GetCustomerResponse, void>(
      `/api/sales/customers/${id}`,
      undefined,
      GetCustomerResponseSchema,
    );
  }

  async createCustomer(data: CreateCustomerRequest): Promise<CreateCustomerResponse> {
    if (this.useMockData) {
      const newCustomer: Customer = {
        id: `cust-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        clientId: 'fake-client-id',
        name: data.name,
        companyName: data.companyName,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone,
        address: data.address,
        creditLimit: data.creditLimit,
        creditUsed: 0,
        isActive: true,
        metadata: data.metadata || {},
        deletedAt: undefined,
        deletedBy: undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockStore.addCustomer(newCustomer);
      return Promise.resolve(newCustomer);
    }

    return this.post<CreateCustomerResponse, CreateCustomerRequest>(
      '/api/sales/customers',
      data,
      CreateCustomerResponseSchema,
      CreateCustomerRequestSchema,
    );
  }

  async updateCustomer(id: string, data: UpdateCustomerRequest): Promise<UpdateCustomerResponse> {
    if (this.useMockData) {
      const updated = mockStore.updateCustomer(id, data);
      if (!updated) {
        throw new Error('Customer not found');
      }
      return Promise.resolve(updated);
    }

    return this.patch<UpdateCustomerResponse, UpdateCustomerRequest>(
      `/api/sales/customers/${id}`,
      data,
      UpdateCustomerResponseSchema,
      UpdateCustomerRequestSchema,
    );
  }

  async deleteCustomer(id: string): Promise<void> {
    if (this.useMockData) {
      const deleted = mockStore.deleteCustomer(id);
      if (!deleted) {
        throw new Error('Customer not found');
      }
      return Promise.resolve();
    }

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
    if (this.useMockData) {
      let orders = mockStore.getPurchaseOrders();

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
    if (this.useMockData) {
      const order = mockStore.getPurchaseOrder(id);
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
    if (this.useMockData) {
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
        createdBy: `${lastName()} ${firstName()}`,
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
    if (this.useMockData) {
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
    if (this.useMockData) {
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
    if (this.useMockData) {
      const updated = mockStore.updatePurchaseOrder(id, {
        status: 'CONFIRMED',
        processedBy: `${lastName()} ${firstName()}`,
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
    if (this.useMockData) {
      const updated = mockStore.updatePurchaseOrder(id, {
        status: 'PROCESSING',
        processedBy: `${lastName()} ${firstName()}`,
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
    if (this.useMockData) {
      const daysAhead = Math.floor(Math.random() * 7) + 1;
      const updated = mockStore.updatePurchaseOrder(id, {
        status: 'SHIPPED',
        shippedBy: `${lastName()} ${firstName()}`,
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
    if (this.useMockData) {
      const updated = mockStore.updatePurchaseOrder(id, {
        status: 'DELIVERED',
        deliveredBy: `${lastName()} ${firstName()}`,
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
    if (this.useMockData) {
      const updated = mockStore.updatePurchaseOrder(id, {
        status: 'CANCELLED',
        cancelledBy: `${lastName()} ${firstName()}`,
        cancelReason: data?.reason,
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
    if (this.useMockData) {
      const updated = mockStore.updatePurchaseOrder(id, {
        status: 'REFUNDED',
        refundedBy: `${lastName()} ${firstName()}`,
        refundReason: data?.reason,
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
    if (this.useMockData) {
      let products = mockStore.getProducts();

      // Apply filters
      if (params?.search) {
        const searchTerm = params.search.toLowerCase();
        products = products.filter(
          (p) =>
            p.name.toLowerCase().includes(searchTerm) ||
            p.description?.toLowerCase().includes(searchTerm) ||
            p.productCode.toLowerCase().includes(searchTerm),
        );
      }
      if (params?.category) {
        products = products.filter((p) => p.category === params.category);
      }
      if (params?.status) {
        products = products.filter((p) => p.status === params.status);
      }
      if (params?.minPrice !== undefined) {
        products = products.filter((p) => p.unitPrice >= params.minPrice!);
      }
      if (params?.maxPrice !== undefined) {
        products = products.filter((p) => p.unitPrice <= params.maxPrice!);
      }
      if (params?.lowStock) {
        products = products.filter((p) => p.status === 'LOW_STOCK' || p.status === 'OUT_OF_STOCK');
      }

      // Apply sorting
      if (params?.sortBy) {
        products.sort((a, b) => {
          const sortBy = params.sortBy!;
          const aVal = a[sortBy as keyof Product];
          const bVal = b[sortBy as keyof Product];
          const comparison = (aVal ?? '') > (bVal ?? '') ? 1 : (aVal ?? '') < (bVal ?? '') ? -1 : 0;
          return params.sortOrder === 'desc' ? -comparison : comparison;
        });
      }

      // Apply limit
      const limit = params?.limit || 20;
      const paginatedProducts = products.slice(0, limit);

      return Promise.resolve({
        products: paginatedProducts,
        pagination: {
          limit,
          hasNext: products.length > limit,
          hasPrev: false,
          nextCursor: products.length > limit ? 'next' : undefined,
          prevCursor: undefined,
        },
      });
    }

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
    if (this.useMockData) {
      const product = mockStore.getProduct(id);
      if (!product) {
        throw new Error('Product not found');
      }
      return Promise.resolve(product);
    }

    return this.get<GetProductResponse, void>(
      `/api/sales/products/${id}`,
      undefined,
      GetProductResponseSchema,
    );
  }

  async createProduct(data: CreateProductRequest): Promise<CreateProductResponse> {
    if (this.useMockData) {
      const newProduct: Product = {
        id: `prod-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        productCode: data.productCode,
        name: data.name,
        description: data.description,
        category: data.category,
        unitPrice: data.unitPrice,
        costPrice: data.costPrice,
        status: data.status || 'ACTIVE',
        stockLevel: data.stockLevel,
        minStock: data.minStock,
        maxStock: data.maxStock,
        unit: data.unit,
        sku: data.sku,
        barcode: data.barcode,
        weight: data.weight,
        dimensions: data.dimensions,
        metadata: data.metadata || {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockStore.addProduct(newProduct);
      return Promise.resolve(newProduct);
    }

    return this.post<CreateProductResponse, CreateProductRequest>(
      '/api/sales/products',
      data,
      CreateProductResponseSchema,
      CreateProductRequestSchema,
    );
  }

  async updateProduct(id: string, data: UpdateProductRequest): Promise<UpdateProductResponse> {
    if (this.useMockData) {
      const updated = mockStore.updateProduct(id, data);
      if (!updated) {
        throw new Error('Product not found');
      }
      return Promise.resolve(updated);
    }

    return this.patch<UpdateProductResponse, UpdateProductRequest>(
      `/api/sales/products/${id}`,
      data,
      UpdateProductResponseSchema,
      UpdateProductRequestSchema,
    );
  }

  async deleteProduct(id: string): Promise<void> {
    if (this.useMockData) {
      const deleted = mockStore.deleteProduct(id);
      if (!deleted) {
        throw new Error('Product not found');
      }
      return Promise.resolve();
    }

    await this.delete(`/api/sales/products/${id}`);
  }
}
