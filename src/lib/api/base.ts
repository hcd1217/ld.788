import type {z} from 'zod';
import {addApiError} from '@/stores/error';
import {authService} from '@/services/auth';

type ApiConfig = {
  baseURL: string;
  timeout?: number;
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
  private readonly baseURL: string;
  private readonly timeout: number;

  constructor(config: ApiConfig) {
    this.baseURL = config.baseURL;
    this.timeout = config.timeout ?? 30_000;
  }

  async get<T>(
    endpoint: string,
    params?: Record<string, string>,
    schema?: z.ZodSchema<T>,
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'GET',
      params,
      schema,
    });
  }

  async post<T, R = unknown>(
    endpoint: string,
    data?: unknown,
    schema?: z.ZodSchema<T>,
    dataSchema?: z.ZodSchema<R>,
  ): Promise<T> {
    data = dataSchema?.parse(data) ?? data;
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      schema,
    });
  }

  async put<T>(
    endpoint: string,
    data?: unknown,
    schema?: z.ZodSchema<T>,
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
      schema,
    });
  }

  async patch<T>(
    endpoint: string,
    data?: unknown,
    schema?: z.ZodSchema<T>,
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
      schema,
    });
  }

  async delete<T>(endpoint: string, schema?: z.ZodSchema<T>): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
      schema,
    });
  }

  private getAuthToken(): string | undefined {
    return authService.getAccessToken() ?? undefined;
  }

  private getClientCode(): string | undefined {
    return authService.getClientCode() ?? undefined;
  }

  private async request<T>(
    endpoint: string,
    config: RequestConfig<T> = {},
  ): Promise<T> {
    const {params, schema, ...init} = config;
    // Add configurable delay in development mode
    if (import.meta.env.DEV) {
      const delayMs = Number(import.meta.env.VITE_DEV_API_DELAY) || 0;
      if (delayMs > 0) {
        console.ignore(
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

    if (!headers.has('Content-Type') && init.body) {
      headers.set('Content-Type', 'application/json');
    }

    const clientCode = this.getClientCode();
    if (clientCode) {
      headers.set('X-CLIENT-CODE', clientCode);
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

      const data = (await response.json()) as unknown;

      if (!response.ok) {
        const apiError = new ApiError(
          response.status,
          response.statusText,
          data,
        );
        // Log to error store in development
        if (import.meta.env.DEV) {
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
          if (import.meta.env.DEV) {
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
          if (import.meta.env.DEV) {
            addApiError('Request Timeout', 408, endpoint, {
              method: init.method ?? 'GET',
              url: url.toString(),
              timeout: this.timeout,
            });
          }

          throw timeoutError;
        }

        const networkError = new ApiError(0, error.message);
        if (import.meta.env.DEV) {
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
      if (import.meta.env.DEV) {
        addApiError('Unknown error occurred', 0, endpoint, {
          method: init.method ?? 'GET',
          url: url.toString(),
        });
      }

      throw unknownError;
    }
  }
}
