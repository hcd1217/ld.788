import { userApi } from '@/lib/api';
import { delay } from '@/utils/time';

export type User = {
  id: string;
  userName: string;
  email: string;
  isRoot: boolean;
  firstName: string;
  lastName: string;
};

const magicLinks: Record<string, string> = {};

export const userService = {
  users: [] as User[],
  async getUsers(): Promise<User[]> {
    if (this.users.length === 0) {
      const response = await userApi.getUsers();
      this.users = response.data.users.map((user) => ({
        id: user.id,
        userName: user.userName ?? '',
        email: user.email ?? '',
        isRoot: user.isRoot ?? false,
        firstName: user.firstName ?? '',
        lastName: user.lastName ?? '',
      }));
    }

    return this.users;
  },
  async getLoginMagicLink(userId: string, clientCode: string) {
    if (!magicLinks[userId]) {
      const response = await userApi.getMagicLink(userId);
      magicLinks[userId] =
        `${location.origin}/magic-link?clientCode=${clientCode}&token=${response.magicToken}`;
    }

    return magicLinks[userId];
  },
  async updatePassword(_params: {
    userId: string;
    password: string;
    confirmPassword: string;
    currentPassword: string;
  }) {
    await delay(100);
    // Remove sensitive password logging
    return { success: true };
  },
};
