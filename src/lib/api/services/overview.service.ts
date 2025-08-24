import { BaseApiClient } from '../base';
import {
  CombinedOverviewSchema,
  type CombinedOverview,
  type OverviewParams,
} from '../schemas/overview.schemas';

export class OverviewApi extends BaseApiClient {
  async getCombinedOverview(params?: OverviewParams): Promise<CombinedOverview> {
    return this.get<CombinedOverview>('/api/overview', params, CombinedOverviewSchema);
  }
}
