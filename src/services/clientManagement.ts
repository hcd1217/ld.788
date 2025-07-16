import {
  type Client,
  type RegisterClientRequest,
  type UpdateClientRequest,
  type ClientListResponse,
  adminApi,
} from '@/lib/api';

export const clientManagementService = {
  async getClients(): Promise<ClientListResponse> {
    try {
      return await adminApi.getClients();
    } catch (error) {
      console.error('Failed to fetch clients:', error);
      throw error;
    }
  },

  async getClientById(id: string): Promise<Client> {
    try {
      return await adminApi.getClient(id);
    } catch (error) {
      console.error(`Failed to fetch client ${id}:`, error);
      throw error;
    }
  },

  async registerClient(data: RegisterClientRequest): Promise<Client> {
    try {
      // Validate client code format
      if (!/^[A-Z\d]{2,10}$/.test(data.clientCode)) {
        throw new Error(
          'Client code must be 2-10 uppercase alphanumeric characters',
        );
      }

      // Validate password strength
      if (data.rootUserPassword.length < 12) {
        throw new Error('Password must be at least 12 characters long');
      }

      const registerResult = await adminApi.registerClient(data);
      if (!registerResult) {
        throw new Error('Failed to register client');
      }

      return {
        id: registerResult.clientId,
        clientCode: data.clientCode,
        clientName: data.clientName,
        status: 'active',
        rootUser: {
          email: data.rootUserEmail,
          firstName: data.rootUserFirstName,
          lastName: data.rootUserLastName,
        },
        createdAt: new Date().toISOString(),
      };
    } catch (error) {
      if (error instanceof Error && error.message.includes('already exists')) {
        throw new Error(`Client code "${data.clientCode}" is already in use`);
      }

      console.error('Failed to register client:', error);
      throw error;
    }
  },

  async updateClient(id: string, data: UpdateClientRequest): Promise<Client> {
    try {
      return await adminApi.updateClient(id, data);
    } catch (error) {
      console.error(`Failed to update client ${id}:`, error);
      throw error;
    }
  },

  async suspendClient(id: string): Promise<void> {
    try {
      await adminApi.updateClient(id, {status: 'suspended'});
    } catch (error) {
      console.error(`Failed to suspend client ${id}:`, error);
      throw error;
    }
  },

  async activateClient(id: string): Promise<void> {
    try {
      await adminApi.updateClient(id, {status: 'active'});
    } catch (error) {
      console.error(`Failed to activate client ${id}:`, error);
      throw error;
    }
  },

  async deleteClient(id: string): Promise<void> {
    try {
      await adminApi.deleteClient(id);
    } catch (error) {
      console.error(`Failed to delete client ${id}:`, error);
      throw error;
    }
  },

  // Validation helpers
  validateClientData(data: RegisterClientRequest): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Client code validation
    if (!data.clientCode) {
      errors.push('Client code is required');
    } else if (!/^[A-Z\d]{2,10}$/.test(data.clientCode)) {
      errors.push('Client code must be 2-10 uppercase alphanumeric characters');
    }

    // Client name validation
    if (!data.clientName) {
      errors.push('Client name is required');
    } else if (data.clientName.length < 3 || data.clientName.length > 100) {
      errors.push('Client name must be between 3 and 100 characters');
    }

    // Email validation
    if (!data.rootUserEmail) {
      errors.push('Root user email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.rootUserEmail)) {
      errors.push('Invalid email format');
    }

    // Password validation
    if (!data.rootUserPassword) {
      errors.push('Root user password is required');
    } else if (data.rootUserPassword.length < 12) {
      errors.push('Password must be at least 12 characters long');
    }

    // Name validation
    if (!data.rootUserFirstName || data.rootUserFirstName.length < 2) {
      errors.push('First name must be at least 2 characters');
    }

    if (!data.rootUserLastName || data.rootUserLastName.length < 2) {
      errors.push('Last name must be at least 2 characters');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  async isClientCodeUnique(code: string): Promise<boolean> {
    try {
      const {clients} = await adminApi.getClients();
      return !clients.some((client) => client.clientCode === code);
    } catch (error) {
      console.error('Failed to check client code uniqueness:', error);
      return false;
    }
  },
};
