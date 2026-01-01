import type { ScheduleEvent } from '../FacilitySchedule.schema';

export interface EventIndexes {
  byResource: Map<string, ScheduleEvent[]>;
  byDay: Map<string, ScheduleEvent[]>;
  byGroup: Map<string, ScheduleEvent[]>;
}

export function createEventIndexes(events: ScheduleEvent[]): EventIndexes {
  const byResource = new Map<string, ScheduleEvent[]>();
  const byDay = new Map<string, ScheduleEvent[]>();
  const byGroup = new Map<string, ScheduleEvent[]>();

  for (const event of events) {
    // By Resource
    if (event.resourceId) {
      const resourceList = byResource.get(event.resourceId) ?? [];
      resourceList.push(event);
      byResource.set(event.resourceId, resourceList);
    }

    // By Day
    const dayKey = getDayKey(event.startDate);
    const dayList = byDay.get(dayKey) ?? [];
    dayList.push(event);
    byDay.set(dayKey, dayList);

    // By Group
    const groupList = byGroup.get(event.groupId) ?? [];
    groupList.push(event);
    byGroup.set(event.groupId, groupList);
  }

  return { byResource, byDay, byGroup };
}

const dayKeyCache = new Map<string, string>();

export function getDayKey(date: Date): string {
  const timestamp = date.getTime();
  const cacheKey = timestamp.toString();

  const cached = dayKeyCache.get(cacheKey);
  if (cached) return cached;

  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  const key = normalized.toISOString().split('T')[0] ?? '';

  if (dayKeyCache.size > 1000) {
    dayKeyCache.clear();
  }

  dayKeyCache.set(cacheKey, key);
  return key;
}

export function getEventsByResource(
  resourceId: string,
  indexes: EventIndexes
): ScheduleEvent[] {
  return indexes.byResource.get(resourceId) ?? [];
}

export function getEventsByDay(date: Date, indexes: EventIndexes): ScheduleEvent[] {
  const dayKey = getDayKey(date);
  return indexes.byDay.get(dayKey) ?? [];
}

export function getEventsByGroup(groupId: string, indexes: EventIndexes): ScheduleEvent[] {
  return indexes.byGroup.get(groupId) ?? [];
}
