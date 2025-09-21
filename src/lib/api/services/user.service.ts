import { BaseApiClient } from '../base';
import {
  type GetMagicLinkResponse,
  GetMagicLinkResponseSchema,
  type GetUsersRequest,
  GetUsersRequestSchema,
  type GetUsersResponse,
  GetUsersResponseSchema,
} from '../schemas/user.schemas';

export class UserApi extends BaseApiClient {
  async getMagicLink(id: string): Promise<GetMagicLinkResponse> {
    return this.post(
      `/api/users/${id}/magic-link`,
      {
        reason: 'request from client',
      },
      GetMagicLinkResponseSchema,
    );
  }

  async getUsers(params?: GetUsersRequest): Promise<GetUsersResponse> {
    return this.get('/api/users', params, GetUsersResponseSchema, GetUsersRequestSchema);
  }
}
