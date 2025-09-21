import { type Customer as APICustomer, salesApi } from '@/lib/api';
import {
  type BulkUpsertCustomersRequest,
  type BulkUpsertCustomersResponse,
} from '@/lib/api/schemas/sales.schemas';

// Re-export types for compatibility
export type {
  CreateCustomerRequest,
  UpdateCustomerRequest,
  BulkUpsertCustomersRequest,
  BulkUpsertCustomersResponse,
} from '@/lib/api/schemas/sales.schemas';

export type Customer = {
  id: string;
  name: string;
  companyName?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  deliveryAddress?: string;
  googleMapsUrl?: string;
  memo?: string;
  pic?: string;
  taxCode?: string;
  isActive: boolean;
};

/**
 * Transform API Customer to Frontend Customer
 */
function transformCustomer(customer: APICustomer): Customer {
  return {
    ...customer,
    name: customer.name,
    companyName: customer.companyName,
    contactEmail: customer.contactEmail,
    contactPhone: customer.contactPhone,
    address: customer.address,
    deliveryAddress: customer.deliveryAddress,
    taxCode: customer.taxCode,
    isActive: customer.isActive ?? true,
    googleMapsUrl: customer.googleMapsUrl,
    memo: customer.memo,
    pic: customer.pic,
  };
}

export const customerService = {
  async getAllCustomers(): Promise<Customer[]> {
    const response = await salesApi.getCustomers({
      limit: 1000,
    });
    return response.customers.map(transformCustomer).sort((a, b) => {
      if (a.isActive && !b.isActive) return -1;
      if (!a.isActive && b.isActive) return 1;
      return a.name.localeCompare(b.name);
    });
  },

  async getCustomer(id: string): Promise<Customer | undefined> {
    try {
      const response = await salesApi.getCustomers({ limit: 1000 });
      const customer = response.customers.find((c) => c.id === id);
      return customer ? transformCustomer(customer) : undefined;
    } catch {
      return undefined;
    }
  },

  async createCustomer(data: Omit<Customer, 'metadata' | 'id' | 'clientId'>): Promise<Customer> {
    const customer = await salesApi.createCustomer({
      ...data,
      metadata: {
        name: data.name,
        companyName: data.companyName,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone,
        address: data.address,
        deliveryAddress: data.deliveryAddress,
        taxCode: data.taxCode,
        googleMapsUrl: data.googleMapsUrl || undefined,
        memo: data.memo || undefined,
        pic: data.pic || undefined,
        isActive: true,
      },
    });
    return transformCustomer(customer);
  },

  async updateCustomer(
    id: string,
    data: Omit<Customer, 'metadata' | 'id' | 'clientId'>,
  ): Promise<void> {
    await salesApi.updateCustomer(id, {
      ...data,
      metadata: {
        name: data.name,
        pic: data.pic || undefined,
        googleMapsUrl: data.googleMapsUrl || undefined,
        memo: data.memo || undefined,
        companyName: data.companyName || undefined,
        contactEmail: data.contactEmail || undefined,
        contactPhone: data.contactPhone || undefined,
        address: data.address || undefined,
        deliveryAddress: data.deliveryAddress || undefined,
        taxCode: data.taxCode || undefined,
        isActive: data.isActive ?? true,
      },
    });
  },

  async deleteCustomer(id: string): Promise<void> {
    await salesApi.deleteCustomer(id);
  },

  async activateCustomer(customer: Customer): Promise<void> {
    await salesApi.updateCustomer(customer.id, {
      metadata: {
        isActive: true,
      },
    });
  },

  async deactivateCustomer(customer: Customer): Promise<void> {
    await salesApi.updateCustomer(customer.id, {
      metadata: {
        isActive: false,
      },
    });
  },

  async bulkUpsertCustomers(
    data: BulkUpsertCustomersRequest,
  ): Promise<BulkUpsertCustomersResponse> {
    return salesApi.bulkUpsertCustomers(data);
  },

  async searchCustomers(searchTerm: string): Promise<Customer[]> {
    const response = await salesApi.getCustomers({
      search: searchTerm,
      limit: 1000,
    });
    return response.customers.map(transformCustomer);
  },
};
