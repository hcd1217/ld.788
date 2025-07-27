import type * as z from 'zod/v4';
import {addApiError} from '@/stores/error';
import {authService} from '@/services/auth';
import {cleanObject} from '@/utils/object';
import {isDevelopment} from '@/utils/env';
import {delay} from '@/utils/time';

type ApiConfig = {
  baseURL: string;
  timeout?: number;
  cacheEnabled?: boolean;
  cacheTTL?: number;
};

type CacheEntry<T> = {
  data: T;
  timestamp: number;
  ttl: number;
};

type RequestConfig<T = unknown> = {
  params?: Record<string, string>;
  schema?: z.ZodSchema<T>;
} & RequestInit;

export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public data?: unknown,
  ) {
    super(`API Error: ${status} ${statusText}`);
    this.name = 'ApiError';
  }
}

export class BaseApiClient {
  protected adminAccessKey = '';

  private readonly baseURL: string;
  private readonly timeout: number;
  private readonly cacheEnabled: boolean;
  private readonly cacheTTL: number;
  private readonly cache = new Map<string, CacheEntry<unknown>>();
  private readonly locks = new Map<string, true>();

  constructor(config: ApiConfig) {
    this.baseURL = config.baseURL;
    this.timeout = config.timeout ?? 30_000;
    this.cacheEnabled = config.cacheEnabled ?? true;
    this.cacheTTL = config.cacheTTL ?? 30_000; // 30 seconds default
  }

  public clearCache(): void {
    this.cache.clear();
  }

  public clearExpiredCache(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Generates a cache key for a given endpoint and params
   * This is exposed for manual cache management
   */
  public getCacheKey(
    endpoint: string,
    params?: Record<string, string | number | boolean>,
  ): string {
    return this.generateCacheKey(endpoint, params);
  }

  /**
   * Checks if a cache entry exists and is valid
   */
  public hasCachedData(cacheKey: string): boolean {
    if (!this.cacheEnabled) return false;

    const entry = this.cache.get(cacheKey);
    if (!entry) return false;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(cacheKey);
      return false;
    }

    return true;
  }

  /**
   * Clears a specific cache entry
   */
  public clearCacheEntry(cacheKey: string): void {
    this.cache.delete(cacheKey);
  }

  /**
   * Gets remaining TTL for a cache entry in milliseconds
   */
  public getCacheTTL(cacheKey: string): number {
    const entry = this.cache.get(cacheKey);
    if (!entry) return 0;

    const elapsed = Date.now() - entry.timestamp;
    const remaining = entry.ttl - elapsed;
    return Math.max(0, remaining);
  }

  async get<T, R = unknown>(
    endpoint: string,
    params?: R,
    schema?: z.ZodSchema<T>,
    paramsSchema?: z.ZodSchema<R>,
  ): Promise<T> {
    const cleanParams = params
      ? cleanObject(paramsSchema?.parse(params) ?? params, true)
      : undefined;

    // Check cache first
    const cacheKey = this.generateCacheKey(endpoint, cleanParams);
    const cachedData = this.getCachedData<T>(cacheKey);
    if (cachedData !== undefined) {
      console.ignore?.('get data from cache!!!', {endpoint});
      return cachedData;
    }

    console.ignore?.('no cached data!!!', {endpoint});

    if (this.locks.has(cacheKey)) {
      console.ignore?.('race condition!!!');
      await delay(200);
      return this.get(endpoint, params, schema, paramsSchema);
    }

    this.locks.set(cacheKey, true);
    try {
      // Make request and cache result
      const result = await this.request<T>(endpoint, {
        method: 'GET',
        params: cleanParams,
        schema,
      });

      // Cache the result
      this.setCachedData(cacheKey, result);
      return result;
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      this.locks.delete(cacheKey);
    }
  }

  async post<T, R = unknown>(
    endpoint: string,
    data?: unknown,
    schema?: z.ZodSchema<T>,
    dataSchema?: z.ZodSchema<R>,
  ): Promise<T> {
    data = dataSchema?.parse(data) ?? data;
    const result = await this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      schema,
    });

    // Invalidate related cache entries
    this.invalidateRelatedCache(endpoint);

    return result;
  }

  async put<T, R = unknown>(
    endpoint: string,
    data?: unknown,
    schema?: z.ZodSchema<T>,
    dataSchema?: z.ZodSchema<R>,
  ): Promise<T> {
    data = dataSchema?.parse(data) ?? data;
    const result = await this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
      schema,
    });

    // Invalidate related cache entries
    this.invalidateRelatedCache(endpoint);

    return result;
  }

  async patch<T, R = unknown>(
    endpoint: string,
    data?: unknown,
    schema?: z.ZodSchema<T>,
    dataSchema?: z.ZodSchema<R>,
  ): Promise<T> {
    data = dataSchema?.parse(data) ?? data;
    const result = await this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
      schema,
    });

    // Invalidate related cache entries
    this.invalidateRelatedCache(endpoint);

    return result;
  }

  async delete<T, R = unknown>(
    endpoint: string,
    data?: unknown,
    schema?: z.ZodSchema<T>,
    dataSchema?: z.ZodSchema<R>,
  ): Promise<T> {
    data = dataSchema?.parse(data) ?? data;
    const result = await this.request<T>(endpoint, {
      method: 'DELETE',
      body: data ? JSON.stringify(data) : undefined,
      schema,
    });

    // Invalidate related cache entries
    this.invalidateRelatedCache(endpoint);

    return result;
  }

  private getAuthToken(): string | undefined {
    return authService.getAccessToken() ?? undefined;
  }

  private getClientCode(): string | undefined {
    return authService.getClientCode() ?? undefined;
  }

  private invalidateRelatedCache(endpoint: string): void {
    if (!this.cacheEnabled) return;

    // Extract the resource path from endpoint (e.g., '/users/123' -> '/users')
    const resourcePath = endpoint.split('/').slice(0, 2).join('/');

    for (const key of this.cache.keys()) {
      if (key.includes(resourcePath)) {
        this.cache.delete(key);
      }
    }
  }

  private generateCacheKey(
    endpoint: string,
    params?: Record<string, string | number | boolean>,
  ): string {
    const url = new URL(`${this.baseURL}${endpoint}`);
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        url.searchParams.append(key, value.toString());
      }
    }

    return url.toString();
  }

  private getCachedData<T>(cacheKey: string): T | undefined {
    if (!this.cacheEnabled) return undefined;

    const entry = this.cache.get(cacheKey) as CacheEntry<T> | undefined;
    if (!entry) return undefined;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(cacheKey);
      return undefined;
    }

    return entry.data;
  }

  private async request<T>(
    endpoint: string,
    config: RequestConfig<T> = {},
  ): Promise<T> {
    const {params, schema, ...init} = config;
    // Add configurable delay in development mode
    if (isDevelopment) {
      const delayMs = Number(import.meta.env.VITE_DEV_API_DELAY) || 0;
      if (delayMs > 0) {
        console.ignore?.(
          `[API] Delaying request for ${delayMs}ms: ${init.method ?? 'GET'} ${endpoint}`,
        );
        await new Promise((resolve) => {
          setTimeout(resolve, delayMs);
        });
      }
    }

    const url = new URL(`${this.baseURL}${endpoint}`);
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        url.searchParams.append(key, value);
      }
    }

    const token = this.getAuthToken();
    const headers = new Headers(init.headers);

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    if (this.adminAccessKey) {
      headers.set('X-ADMIN-KEY', this.adminAccessKey);
    } else {
      const clientCode = this.getClientCode();
      if (clientCode) {
        headers.set('X-CLIENT-CODE', clientCode);
      }
    }

    if (!headers.has('Content-Type') && init.body) {
      headers.set('Content-Type', 'application/json');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, this.timeout);

    try {
      const response = await fetch(url.toString(), {
        ...init,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Check if response has content before parsing JSON
      const contentType = response.headers.get('content-type');
      const contentLength = response.headers.get('content-length');

      // Check if response likely has JSON content
      const hasJsonContent =
        contentType?.includes('application/json') &&
        contentLength !== '0' &&
        response.status !== 204;

      let data = hasJsonContent ? await response.json() : undefined;

      // @todo: refactor this later
      if (data && 'success' in data) {
        data = data.data;
      }

      if (!response.ok) {
        const apiError = new ApiError(
          response.status,
          response.statusText,
          data,
        );
        // Log to error store in development
        if (isDevelopment) {
          addApiError(apiError.message, response.status, endpoint, {
            method: init.method ?? 'GET',
            url: url.toString(),
            requestBody: init.body,
            responseData: data,
            headers: Object.fromEntries(headers.entries()),
          });
        }

        throw apiError;
      }

      // Validate response if schema provided
      if (schema) {
        try {
          return schema.parse(data) as T;
        } catch (error) {
          const validationError = new ApiError(422, 'Invalid response format', {
            received: data,
            error: error instanceof Error ? error.message : 'Validation failed',
          });
          // Log validation errors to error store
          if (isDevelopment) {
            addApiError(validationError.message, 422, endpoint, {
              method: init.method ?? 'GET',
              url: url.toString(),
              validationError:
                error instanceof Error ? error.message : 'Validation failed',
              receivedData: data,
            });
          }

          throw validationError;
        }
      }

      return data as T;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof ApiError) {
        throw error;
      }

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          const timeoutError = new ApiError(408, 'Request Timeout');
          if (isDevelopment) {
            addApiError('Request Timeout', 408, endpoint, {
              method: init.method ?? 'GET',
              url: url.toString(),
              timeout: this.timeout,
            });
          }

          throw timeoutError;
        }

        const networkError = new ApiError(0, error.message);
        if (isDevelopment) {
          addApiError(error.message, 0, endpoint, {
            method: init.method ?? 'GET',
            url: url.toString(),
            errorType: error.name,
            stack: error.stack,
          });
        }

        throw networkError;
      }

      const unknownError = new ApiError(0, 'Unknown error occurred');
      if (isDevelopment) {
        addApiError('Unknown error occurred', 0, endpoint, {
          method: init.method ?? 'GET',
          url: url.toString(),
        });
      }

      throw unknownError;
    }
  }

  private setCachedData<T>(cacheKey: string, data: T, ttl?: number): void {
    if (!this.cacheEnabled) return;

    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now(),
      ttl: ttl ?? this.cacheTTL,
    });
  }
}
