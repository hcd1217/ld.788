import { salesApi } from '@/lib/api';
import {
  type CreateCustomerRequest,
  type UpdateCustomerRequest,
  type BulkUpsertCustomersRequest,
  type BulkUpsertCustomersResponse,
} from '@/lib/api/schemas/sales.schemas';

// Re-export Customer type for compatibility
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
  taxCode?: string;
  isActive: boolean;
  metadata: {
    googleMapsUrl?: string;
    [key: string]: unknown;
  };
};

export const customerService = {
  customers: [] as Customer[],

  async getAllCustomers(): Promise<Customer[]> {
    if (this.customers.length > 0) {
      return this.customers;
    }
    const response = await salesApi.getCustomers({
      limit: 1000, // Get all customers
    });
    this.customers = response.customers.map((customer) => ({
      ...customer,
      googleMapsUrl: customer.metadata.googleMapsUrl,
    }));
    return this.customers;
  },

  async getCustomer(id: string): Promise<Customer | undefined> {
    const customers = await this.getAllCustomers();
    return customers.find((customer) => customer.id === id);
  },

  async getActiveCustomers(): Promise<Customer[]> {
    const response = await salesApi.getCustomers({
      isActive: true,
      limit: 1000,
    });
    return response.customers.map((customer) => ({
      ...customer,
      googleMapsUrl: customer.metadata.googleMapsUrl,
    }));
  },

  async createCustomer(data: CreateCustomerRequest): Promise<Customer> {
    const customer = await salesApi.createCustomer(data);
    // Clear cache to ensure fresh data on next fetch
    this.customers = [];
    return {
      ...customer,
      googleMapsUrl: customer.metadata.googleMapsUrl,
    };
  },

  async updateCustomer(id: string, data: UpdateCustomerRequest): Promise<Customer> {
    const customer = await salesApi.updateCustomer(id, data);
    // Clear cache to ensure fresh data on next fetch
    this.customers = [];
    return {
      ...customer,
      googleMapsUrl: customer.metadata.googleMapsUrl,
    };
  },

  async deleteCustomer(id: string): Promise<void> {
    await salesApi.deleteCustomer(id);
    // Clear cache to ensure fresh data on next fetch
    this.customers = [];
  },

  async bulkUpsertCustomers(
    data: BulkUpsertCustomersRequest,
  ): Promise<BulkUpsertCustomersResponse> {
    const result = await salesApi.bulkUpsertCustomers(data);
    // Clear cache to ensure fresh data on next fetch
    this.customers = [];
    return result;
  },

  async searchCustomers(searchTerm: string): Promise<Customer[]> {
    const response = await salesApi.getCustomers({
      search: searchTerm,
      limit: 1000,
    });
    return response.customers.map((customer) => ({
      ...customer,
      googleMapsUrl: customer.metadata.googleMapsUrl,
    }));
  },
};
