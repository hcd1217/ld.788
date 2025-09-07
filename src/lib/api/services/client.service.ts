import { BaseApiClient } from '../base';
import {
  SetPasswordForUserRequestSchema,
  type ClientPublicConfigResponse,
} from '../schemas/client.schemas';
import { ClientPublicConfigSchema } from '../schemas';

export class ClientApi extends BaseApiClient {
  async getPubicClientConfig(clientCode: string): Promise<ClientPublicConfigResponse> {
    return this.get<ClientPublicConfigResponse, void>(
      `/clients/${clientCode}/public-config`,
      undefined,
      ClientPublicConfigSchema,
    );
  }

  async setPasswordForUser(userId: string, password: string): Promise<void> {
    return this.post(
      `/clients/users/set-password`,
      { userId, password },
      undefined,
      SetPasswordForUserRequestSchema,
    );
  }
}
