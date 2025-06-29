import {
  clientApi,
  type RegisterClientRequest,
  type RegisterClientResponse,
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
};
