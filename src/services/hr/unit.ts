import {hrApi} from '@/lib/api';

export type Unit = {
  id: string;
  name: string;
};

export const unitService = {
  units: [] as Unit[],
  async getUnits(): Promise<Unit[]> {
    if (!this.units?.length) {
      this.units = await hrApi.getUnits();
    }

    return this.units;
  },
};
