import {
  clientApi,
  type RegisterBulkUsersByRootUserRequest,
  type RegisterBulkUsersByRootUserResponse,
  type RegisterClientRequest,
  type RegisterClientResponse,
  type RegisterUserByRootUserRequest,
  type RegisterUserByRootUserResponse,
} from '@/lib/api';

export type Client = {
  id: string;
  code: string;
  name: string;
};

export const clientService = {
  async registerNewClient(
    data: RegisterClientRequest,
  ): Promise<RegisterClientResponse> {
    return clientApi.register(data);
  },

  async registerUserByRootUser(
    data: RegisterUserByRootUserRequest,
  ): Promise<RegisterUserByRootUserResponse> {
    return clientApi.registerUserByRootUser(data);
  },

  async registerBulkUsersByRootUser(
    data: RegisterBulkUsersByRootUserRequest,
  ): Promise<RegisterBulkUsersByRootUserResponse> {
    return clientApi.registerBulkUsersByRootUser(data);
  },
};
