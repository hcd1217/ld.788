import { type JWTPayload, JWTPayloadSchema } from '@/lib/api';

function base64UrlDecode(str: string): string {
  // Base64url to base64
  const base64 = str.replaceAll('-', '+').replaceAll('_', '/');
  // Pad with = if needed
  const padded = base64 + '=='.slice(0, (4 - (base64.length % 4)) % 4);

  // Convert base64 to string
  const binaryString = globalThis.atob(padded);
  return binaryString;
}

export function decodeJWT(token: string): JWTPayload | undefined {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return undefined;
    }

    const payload = parts[1];
    const decoded = base64UrlDecode(payload);
    const parsed = JSON.parse(decoded) as unknown;

    // Validate the JWT payload structure
    return JWTPayloadSchema.parse(parsed);
  } catch {
    return undefined;
  }
}

export function isTokenExpired(token?: string): boolean {
  if (!token) {
    return true;
  }

  const payload = decodeJWT(token);
  if (!payload) {
    return true;
  }

  const currentTime = Math.floor(Date.now() / 1000);
  return payload.exp < currentTime;
}
