import { STORAGE_KEYS } from '@/utils/storageKeys';

export const isProduction = Boolean(import.meta.env.PROD ?? false);
export const isDevelopment = Boolean(import.meta.env.DEV ?? false);
export const isDebug = Boolean('Sxk7g9MDjfCE' === localStorage.getItem(STORAGE_KEYS.DEBUG.MODE));
// export const isProduction = true;
// export const isDevelopment = false;
