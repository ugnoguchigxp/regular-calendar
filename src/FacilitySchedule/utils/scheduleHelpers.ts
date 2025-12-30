import type { Resource, ScheduleConflict, ScheduleEvent } from '../FacilitySchedule.schema';

/**
 * Check if time ranges overlap
 */
export function hasTimeOverlap(
  schedule1: { startDate: Date; endDate: Date },
  schedule2: { startDate: Date; endDate: Date }
): boolean {
  return schedule1.startDate < schedule2.endDate && schedule1.endDate > schedule2.startDate;
}

/**
 * Check collision for a new event against existing events
 */
export function checkScheduleConflict(
  newEvent: Partial<ScheduleEvent> & { startDate: Date; endDate: Date; resourceId: string },
  existingEvents: ScheduleEvent[]
): ScheduleConflict | null {
  for (const existing of existingEvents) {
    if (existing.status === 'cancelled') continue;

    if (existing.resourceId === newEvent.resourceId) {
      if (hasTimeOverlap(existing, newEvent)) {
        return {
          resourceId: newEvent.resourceId, // Keep positionId property name if schema uses it, or rename to resourceId in schema
          existingSchedule: existing, // TODO: Update schema property name
          newSchedule: newEvent,
          conflictType: 'double-booking',
        };
      }
    }
  }
  return null;
}

// NOTE: ScheduleConflict schema still uses 'positionId' etc in my previous overwrite?
// Let's check schema again. I updated schema in Step 94.
// Step 94 Schema: doesn't explicitly export ScheduleConflictSchema... wait.
// I need option check.

export function filterEventsByDateRange(
  events: ScheduleEvent[],
  startDate: Date,
  endDate: Date
): ScheduleEvent[] {
  return events.filter((event) => {
    return event.startDate < endDate && event.endDate > startDate;
  });
}

export function filterEventsByResource(
  events: ScheduleEvent[],
  resourceId: string
): ScheduleEvent[] {
  return events.filter((event) => event.resourceId === resourceId);
}

export function filterEventsByDay(
  events: ScheduleEvent[],
  date: Date
): ScheduleEvent[] {
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);

  const dayEnd = new Date(date);
  dayEnd.setHours(23, 59, 59, 999);

  return filterEventsByDateRange(events, dayStart, dayEnd);
}

export function sortEventsByTime(events: ScheduleEvent[]): ScheduleEvent[] {
  return [...events].sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
}

export function sortResourcesByOrder(resources: Resource[]): Resource[] {
  return [...resources].sort((a, b) => a.order - b.order);
}

export function getEventDuration(event: ScheduleEvent): number {
  const durationMs = event.endDate.getTime() - event.startDate.getTime();
  return durationMs / (1000 * 60 * 60);
}

export function getEventDisplayText(event: ScheduleEvent): string {
  const startTime = event.startDate.toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const endTime = event.endDate.toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
  });
  return `${event.title} (${startTime}-${endTime})`;
}

// ... Date helpers (keep as is or rename) ...
const dateRangeCache = new Map<string, Date[]>();
const MAX_CACHE_SIZE = 100;

export function generateDateRange(start: Date, end: Date): Date[] {
  const normalizedStart = new Date(start);
  normalizedStart.setHours(0, 0, 0, 0);
  const normalizedEnd = new Date(end);
  normalizedEnd.setHours(0, 0, 0, 0);

  const cacheKey = `${normalizedStart.getTime()}-${normalizedEnd.getTime()}`;

  if (dateRangeCache.has(cacheKey)) {
    return dateRangeCache.get(cacheKey)!;
  }

  const dates: Date[] = [];
  const current = new Date(normalizedStart);

  while (current <= normalizedEnd) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  if (dateRangeCache.size >= MAX_CACHE_SIZE) {
    const firstKey = dateRangeCache.keys().next().value;
    if (firstKey) dateRangeCache.delete(firstKey);
  }

  dateRangeCache.set(cacheKey, dates);
  return dates;
}

export function getWeekStart(date: Date, weekStartsOn: 0 | 1): Date {
  const result = new Date(date);
  const day = result.getDay();
  const diff = day < weekStartsOn ? 7 - weekStartsOn + day : day - weekStartsOn;
  result.setDate(result.getDate() - diff);
  result.setHours(0, 0, 0, 0);
  return result;
}

export function getWeekEnd(date: Date, weekStartsOn: 0 | 1): Date {
  const weekStart = getWeekStart(date, weekStartsOn);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);
  return weekEnd;
}

export function getMonthStart(date: Date): Date {
  const result = new Date(date);
  result.setDate(1);
  result.setHours(0, 0, 0, 0);
  return result;
}

export function getMonthEnd(date: Date): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + 1);
  result.setDate(0);
  result.setHours(23, 59, 59, 999);
  return result;
}

export function detectAndMarkConflicts(events: ScheduleEvent[]): ScheduleEvent[] {
  const result = events.map((event) => ({ ...event, hasConflict: false }));

  for (let i = 0; i < result.length; i++) {
    const current = result[i];
    if (!current || current.status === 'cancelled') continue;

    for (let j = i + 1; j < result.length; j++) {
      const other = result[j];
      if (!other || other.status === 'cancelled') continue;

      if (current.resourceId === other.resourceId && hasTimeOverlap(current, other)) {
        current.hasConflict = true;
        other.hasConflict = true;
      }
    }
  }

  return result;
}
