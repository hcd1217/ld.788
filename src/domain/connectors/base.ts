import axios, { AxiosError, type AxiosInstance } from 'axios';
import type { ZodAny, ZodArray, ZodObject } from 'zod/v4';
import { AppError } from '../error/app-error.ts';
import { useErrorStore } from '@/stores/error-store.ts';

export class BaseConnector {
  static #connector: BaseConnector;

  protected axiosInstance: AxiosInstance;
  protected baseUrl?: string;

  static get connector () {
    if (!this.#connector) {
      this.#connector = new this();
    }
    return this.#connector;
  }

  protected constructor(baseUrl?: string) {
    this.axiosInstance = axios.create({
      // eslint-disable-next-line @typescript-eslint/naming-convention
      baseURL: baseUrl ?? this.baseUrl,
    });
    return this;
  }

  setAxiosInstance(axiosInstance: AxiosInstance) {
    this.axiosInstance = axiosInstance;
  }

  protected errorHandler(error: unknown): never {
    if (error instanceof AxiosError) {
      const appError = new AppError({
        code: `AXIOS_ERROR_${error.code ?? error.request?.response?.status ?? 'UNKNOWN'}`,
        message: error?.message ?? 'Axios Error',
        error,
      });
      useErrorStore.getState().setError(appError, true);
    }

    throw error;
  }

  protected getHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    };
  }

  protected async callApi<R>({
    url,
    payload,
    responseSchema,
    method,
  }: {
    url: string;
    payload?: unknown;
    responseSchema: ZodObject | ZodArray | ZodAny;
    method?: 'POST' | 'GET' | 'PUT' | 'DELETE';
  }): Promise<R> {
    try {
      const response = await this.axiosInstance.request<R>({
        url,
        method,
        data: payload,
        headers: this.getHeaders(),
      });
      return responseSchema?.parse(response.data) as R;
    } catch (error: unknown) {
      return this.errorHandler(error);
    }
  }
}
