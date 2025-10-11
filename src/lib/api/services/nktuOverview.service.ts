import { BaseApiClient } from '../base';
import { type NktuOverview, NktuOverviewSchema } from '../schemas/nktuOverview.schemas';

/**
 * NKTU Custom API Service
 * Handles custom endpoints specific to NKTU client
 */
export class NktuOverviewApi extends BaseApiClient {
  /**
   * Get NKTU overview data including purchase orders and delivery requests
   * @returns Combined overview with POs and DRs
   */
  async getNktuOverview(): Promise<NktuOverview> {
    return this.get<NktuOverview, void>('/api/custom/nktu/overview', undefined, NktuOverviewSchema);
  }
}
