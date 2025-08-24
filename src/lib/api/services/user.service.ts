import { BaseApiClient } from '../base';
import {
  GetUsersRequestSchema,
  GetUsersResponseSchema,
  GetMagicLinkResponseSchema,
  RevokeSessionsResponseSchema,
  type GetUsersRequest,
  type GetUsersResponse,
  type GetMagicLinkResponse,
  type RevokeSessionsResponse,
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

  async revokeUserSessions(userId: string): Promise<RevokeSessionsResponse> {
    return this.post(
      `/api/users/${userId}/revoke-sessions`,
      undefined,
      RevokeSessionsResponseSchema,
    );
  }
}
