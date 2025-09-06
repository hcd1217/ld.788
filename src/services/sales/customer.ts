import { salesApi, type Customer as APICustomer } from '@/lib/api';
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
  clientId: string;
  name: string;
  companyName?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
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
    googleMapsUrl: customer.metadata?.googleMapsUrl,
    memo: customer.metadata?.memo,
    pic: customer.metadata?.pic as string | undefined,
  };
}

export const customerService = {
  async getAllCustomers(): Promise<Customer[]> {
    const response = await salesApi.getCustomers({
      limit: 1000,
    });
    return response.customers.map(transformCustomer);
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

  async createCustomer({
    googleMapsUrl,
    memo,
    pic,
    ...data
  }: Omit<Customer, 'metadata' | 'id' | 'clientId'>): Promise<Customer> {
    const customer = await salesApi.createCustomer({
      ...data,
      metadata: {
        pic: pic || undefined,
        googleMapsUrl: googleMapsUrl || undefined,
        memo: memo || undefined,
      },
    });
    return transformCustomer(customer);
  },

  async updateCustomer(
    id: string,
    { pic, googleMapsUrl, memo, ...data }: Omit<Customer, 'metadata' | 'id' | 'clientId'>,
  ): Promise<Customer> {
    const customer = await salesApi.updateCustomer(id, {
      ...data,
      metadata: {
        pic: pic || undefined,
        googleMapsUrl: googleMapsUrl || undefined,
        memo: memo || undefined,
      },
    });
    return transformCustomer(customer);
  },

  async deleteCustomer(id: string): Promise<void> {
    await salesApi.deleteCustomer(id);
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
