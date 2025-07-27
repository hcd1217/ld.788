import {
  type Client,
  type ClientDetail,
  type RegisterClientRequest,
  type ClientListResponse,
  type HardDeleteClientRequest,
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

  async getClientByClientCode(clientCode: string): Promise<ClientDetail> {
    try {
      return await adminApi.getClient(clientCode);
    } catch (error) {
      console.error(`Failed to fetch client ${clientCode}:`, error);
      throw error;
    }
  },

  async registerClient(data: RegisterClientRequest): Promise<Client> {
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
      createdAt: new Date(),
    };
  },

  async suspendClient(
    clientCode: string,
    reason: string,
  ): Promise<ClientDetail> {
    const response = await adminApi.suspendClient(clientCode, {reason});
    if (!response.success) {
      throw new Error(response.message || 'Failed to suspend client');
    }

    // Fetch the updated client data after successful suspension
    return adminApi.getClient(clientCode);
  },

  async reactivateClient(clientCode: string): Promise<ClientDetail> {
    const response = await adminApi.reactivateClient(clientCode);
    if (!response.success) {
      throw new Error(response.message || 'Failed to reactivate client');
    }

    // Fetch the updated client data after successful reactivation
    return adminApi.getClient(clientCode);
  },

  async hardDeleteClient(
    clientCode: string,
    confirmClientCode: string,
    reason: string,
  ): Promise<void> {
    try {
      const data: HardDeleteClientRequest = {confirmClientCode, reason};
      await adminApi.hardDeleteClient(clientCode, data);
    } catch (error) {
      console.error(`Failed to delete client ${clientCode}:`, error);
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
