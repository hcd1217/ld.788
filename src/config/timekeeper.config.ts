import type { ElementType } from 'react';
import { IconCalendarCheck, IconCalendarWeek, IconBeach, IconUserMinus } from '@tabler/icons-react';
import { ROUTERS } from './routeConfig';

export interface QuickActionConfig {
  readonly id: string;
  readonly icon: ElementType;
  readonly titleKey: string;
  readonly descriptionKey: string;
  readonly route?: string;
}

export const QUICK_ACTIONS_CONFIG: readonly QuickActionConfig[] = [
  {
    id: 'shifts',
    icon: IconCalendarCheck,
    titleKey: 'timekeeper.myShifts.title',
    descriptionKey: 'timekeeper.myShifts.description',
    route: ROUTERS.TIME_KEEPER_DASHBOARD, // TODO: Update to ROUTERS.TIME_KEEPER_SHIFTS when available
  },
  {
    id: 'schedule',
    icon: IconCalendarWeek,
    titleKey: 'timekeeper.myJobSchedule.title',
    descriptionKey: 'timekeeper.myJobSchedule.description',
    route: ROUTERS.TIME_KEEPER_DASHBOARD, // TODO: Update to ROUTERS.TIME_KEEPER_SCHEDULE when available
  },
  {
    id: 'leave',
    icon: IconUserMinus,
    titleKey: 'timekeeper.myLeave.title',
    descriptionKey: 'timekeeper.myLeave.description',
    route: ROUTERS.TIME_KEEPER_DASHBOARD, // TODO: Update to ROUTERS.TIME_KEEPER_LEAVE when available
  },
  {
    id: 'request',
    icon: IconBeach,
    titleKey: 'timekeeper.requestLeave.title',
    descriptionKey: 'timekeeper.requestLeave.description',
    route: ROUTERS.TIME_KEEPER_DASHBOARD, // TODO: Update to ROUTERS.TIME_KEEPER_LEAVE_REQUEST when available
  },
] as const;
