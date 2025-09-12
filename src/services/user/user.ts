import { clientApi, userApi } from '@/lib/api';

export const userService = {
  magicLinks: {} as Record<string, string>,
  async getLoginMagicLink(userId: string, clientCode: string) {
    if (!this.magicLinks[userId]) {
      const response = await userApi.getMagicLink(userId);
      this.magicLinks[userId] =
        `${location.origin}/magic-link?clientCode=${clientCode}&token=${response.magicToken}`;
    }
    return this.magicLinks[userId];
  },
  async setPasswordForUser(userId: string, password: string): Promise<void> {
    await clientApi.setPasswordForUser(userId, password);
  },
};
