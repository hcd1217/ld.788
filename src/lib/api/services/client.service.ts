import { BaseApiClient } from '../base';
import { ClientPublicConfigSchema } from '../schemas';
import {
  type ClientPublicConfigResponse,
  SetPasswordForUserRequestSchema,
} from '../schemas/client.schemas';

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
