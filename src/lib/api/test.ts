import {z} from 'zod';
import {BaseApiClient} from './base';

// Test API client for demonstrating error handling
export class TestApiClient extends BaseApiClient {
  constructor() {
    super({
      baseURL: 'https://jsonplaceholder.typicode.com',
      timeout: 5000,
    });
  }

  // This will succeed
  async getValidUser(id: number) {
    const schema = z.object({
      id: z.number(),
      name: z.string(),
      username: z.string(),
      email: z.string(),
    });

    return this.get(`/users/${id}`, undefined, schema);
  }

  // This will fail with 404
  async getInvalidResource() {
    return this.get('/invalid-endpoint-404');
  }

  // This will fail validation
  async getUserWithBadSchema(id: number) {
    const schema = z.object({
      id: z.string(), // Wrong type - API returns number
      name: z.string(),
    });

    return this.get(`/users/${id}`, undefined, schema);
  }

  // This will timeout (simulated with very short timeout)
  async getWithTimeout() {
    const client = new BaseApiClient({
      baseURL: 'https://httpstat.us',
      timeout: 1, // 1ms timeout - will definitely timeout
    });

    return client.get('/200?sleep=5000');
  }
}
