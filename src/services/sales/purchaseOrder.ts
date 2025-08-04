import { firstName, lastName, randomElement } from '@/utils/fake';
import { customerService, type Customer } from './customer';

export type POStatus =
  | 'NEW'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED';

export type POItem = {
  id: string;
  productCode: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  discount?: number;
  category?: string;
};

export type Address = {
  street: string;
  city: string;
  state?: string;
  postalCode?: string;
  country: string;
};

export type PurchaseOrder = {
  id: string;
  poNumber: string;
  customer?: Customer;
  customerId: string;
  status: POStatus;
  totalAmount: number;
  orderDate: Date;
  deliveryDate?: Date;
  completedDate?: Date;
  items: POItem[];
  createdBy: string;
  processedBy?: string;
  shippingAddress?: Address;
  billingAddress?: Address;
  paymentTerms?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
};

// Fake data generation
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

const streets = [
  'Nguyễn Huệ',
  'Lê Lợi',
  'Trần Hưng Đạo',
  'Võ Văn Tần',
  'Hai Bà Trưng',
  'Lý Thường Kiệt',
];
const cities = ['Ho Chi Minh City', 'Hanoi', 'Da Nang', 'Can Tho', 'Nha Trang', 'Hue'];

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
      productCode: `PRD-${Math.floor(Math.random() * 9000) + 1000}`,
      description: randomElement(productNames),
      quantity,
      unitPrice,
      totalPrice: Math.round(totalPrice * 100) / 100,
      discount: discount > 0 ? Math.round(discount * 100) / 100 : undefined,
      category: randomElement(productCategories),
    };
  });
};

const calculatePOTotal = (items: POItem[]): number => {
  return items.reduce((sum, item) => sum + item.totalPrice, 0);
};

const generateFakePOs = async (): Promise<PurchaseOrder[]> => {
  const customers = await customerService.getAllCustomers();
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
      poNumber: `PO-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900000) + 100000)}`,
      customer,
      customerId: customer.id,
      status,
      totalAmount: calculatePOTotal(items),
      orderDate,
      items,
      createdBy: `${lastName()} ${firstName()}`,
      shippingAddress: generateFakeAddress(),
      billingAddress: Math.random() > 0.5 ? generateFakeAddress() : undefined,
      paymentTerms: randomElement(paymentTermsList),
      notes: Math.random() > 0.7 ? 'Special delivery instructions' : undefined,
      createdAt: orderDate,
      updatedAt: new Date(orderDate.getTime() + Math.random() * (Date.now() - orderDate.getTime())),
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
        (po.deliveryDate || orderDate).getTime() + deliveredDaysAfter * 24 * 60 * 60 * 1000,
      );
    }

    return po;
  });
};

export const purchaseOrderService = {
  purchaseOrders: [] as PurchaseOrder[],

  async getAllPOs(): Promise<PurchaseOrder[]> {
    if (this.purchaseOrders.length === 0) {
      this.purchaseOrders = await generateFakePOs();
    }
    return Promise.resolve(this.purchaseOrders);
  },

  async getPOById(id: string): Promise<PurchaseOrder | undefined> {
    if (this.purchaseOrders.length === 0) {
      await this.getAllPOs();
    }
    return Promise.resolve(this.purchaseOrders.find((po) => po.id === id));
  },

  async createPO(
    data: Omit<PurchaseOrder, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<PurchaseOrder> {
    const newPO: PurchaseOrder = {
      ...data,
      id: `po-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.purchaseOrders.unshift(newPO);
    return Promise.resolve(newPO);
  },

  async updatePO(id: string, data: Partial<PurchaseOrder>): Promise<PurchaseOrder> {
    const index = this.purchaseOrders.findIndex((po) => po.id === id);
    if (index === -1) {
      throw new Error('PO not found');
    }

    this.purchaseOrders[index] = {
      ...this.purchaseOrders[index],
      ...data,
      updatedAt: new Date(),
    };

    return Promise.resolve(this.purchaseOrders[index]);
  },

  async confirmPO(id: string): Promise<PurchaseOrder> {
    return this.updatePO(id, {
      status: 'CONFIRMED',
      processedBy: `${lastName()} ${firstName()}`,
    });
  },

  async processPO(id: string): Promise<PurchaseOrder> {
    return this.updatePO(id, { status: 'PROCESSING' });
  },

  async shipPO(id: string): Promise<PurchaseOrder> {
    const daysAhead = Math.floor(Math.random() * 7) + 1;
    return this.updatePO(id, {
      status: 'SHIPPED',
      deliveryDate: new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000),
    });
  },

  async deliverPO(id: string): Promise<PurchaseOrder> {
    return this.updatePO(id, {
      status: 'DELIVERED',
      completedDate: new Date(),
    });
  },

  async cancelPO(id: string): Promise<PurchaseOrder> {
    return this.updatePO(id, { status: 'CANCELLED' });
  },

  async refundPO(id: string): Promise<PurchaseOrder> {
    return this.updatePO(id, { status: 'REFUNDED' });
  },
};
