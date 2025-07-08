import {userApi, type GetUsersRequest, type GetUsersResponse} from '@/lib/api';

export type User = GetUsersResponse['data']['users'][number];

export const userService = {
  async getUsers(params?: GetUsersRequest): Promise<User[]> {
    const response = await userApi.getUsers(params);
    return response.data.users;
  },
};
