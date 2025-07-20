import {BaseApiClient} from '../base';
import {
  GetUsersRequestSchema,
  GetUsersResponseSchema,
  type GetUsersRequest,
  type GetUsersResponse,
} from '../schemas/user.schemas';

export class UserApi extends BaseApiClient {
  async getUsers(params?: GetUsersRequest): Promise<GetUsersResponse> {
    return this.get(
      '/users',
      params,
      GetUsersResponseSchema,
      GetUsersRequestSchema,
    );
  }
}
