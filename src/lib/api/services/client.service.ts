import { BaseApiClient } from '../base';
import { type ClientPublicConfigResponse } from '../schemas/client.schemas';
import { ClientPublicConfigSchema } from '../schemas';

export class ClientApi extends BaseApiClient {
  async getPubicClientConfig(clientCode: string): Promise<ClientPublicConfigResponse> {
    return this.get<ClientPublicConfigResponse, void>(
      `/clients/${clientCode}/public-config`,
      undefined,
      ClientPublicConfigSchema,
    );
  }
}
