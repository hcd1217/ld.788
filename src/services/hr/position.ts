import {unitService} from './unit';
import {hrApi} from '@/lib/api';

export type Position = {
  id: string;
  title: string;
  code: string;
  unitId?: string;
  unit?: string;
};

export const positionService = {
  positions: [] as Position[],
  async getPositions(): Promise<Position[]> {
    if (this.positions.length === 0) {
      const response = await hrApi.getPositions();
      const units = await unitService.getUnits();
      const map = new Map(units.map((u) => [u.id, u.name]));
      this.positions = response.positions.map((position) => {
        return {
          ...position,
          unitId: position.departmentId,
          unit: map.get(position.departmentId ?? '-'),
        };
      });
    }

    return this.positions;
  },
};
