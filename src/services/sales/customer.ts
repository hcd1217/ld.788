import { salesApi } from '@/lib/api';
import {
  type Customer,
  type CreateCustomerRequest,
  type UpdateCustomerRequest,
} from '@/lib/api/schemas/sales.schemas';

// Re-export Customer type for compatibility
export type {
  Customer,
  CreateCustomerRequest,
  UpdateCustomerRequest,
} from '@/lib/api/schemas/sales.schemas';

export const customerService = {
  customers: [] as Customer[],

  async getAllCustomers(): Promise<Customer[]> {
    const debug = false;
    if (debug) {
      throw new Error('Not implemented');
    }
    const response = await salesApi.getCustomers({
      limit: 1000, // Get all customers
    });
    return response.customers;
  },

  async getCustomer(id: string): Promise<Customer | undefined> {
    try {
      const customer = await salesApi.getCustomerById(id);
      return customer;
    } catch (error) {
      console.error('Failed to get customer by ID:', error);
      return undefined;
    }
  },

  async getActiveCustomers(): Promise<Customer[]> {
    const response = await salesApi.getCustomers({
      isActive: true,
      limit: 1000,
    });
    return response.customers;
  },

  async createCustomer(data: CreateCustomerRequest): Promise<Customer> {
    const customer = await salesApi.createCustomer(data);
    return customer;
  },

  async updateCustomer(id: string, data: UpdateCustomerRequest): Promise<Customer> {
    const customer = await salesApi.updateCustomer(id, data);
    return customer;
  },

  async deleteCustomer(id: string): Promise<void> {
    await salesApi.deleteCustomer(id);
  },

  async searchCustomers(searchTerm: string): Promise<Customer[]> {
    const response = await salesApi.getCustomers({
      name: searchTerm,
      limit: 1000,
    });
    return response.customers;
  },
};
