import {
  areIntervalsOverlapping,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  addDays,
  format
} from 'date-fns';
import type { Resource, ScheduleConflict, ScheduleEvent } from '../FacilitySchedule.schema';

/**
 * Check if time ranges overlap
 */
export function hasTimeOverlap(
  schedule1: { startDate: Date; endDate: Date },
  schedule2: { startDate: Date; endDate: Date }
): boolean {
  return areIntervalsOverlapping(
    { start: schedule1.startDate, end: schedule1.endDate },
    { start: schedule2.startDate, end: schedule2.endDate }
  );
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
    if (existing.id === newEvent.id) continue; // Skip same event

    if (existing.resourceId === newEvent.resourceId) {
      if (hasTimeOverlap(existing, newEvent)) {
        return {
          resourceId: newEvent.resourceId,
          existingSchedule: existing,
          newSchedule: newEvent,
          conflictType: 'double-booking',
        };
      }
    }
  }
  return null;
}

export function filterEventsByDateRange(
  events: ScheduleEvent[],
  startDate: Date,
  endDate: Date
): ScheduleEvent[] {
  return events.filter((event) => {
    return areIntervalsOverlapping(
      { start: event.startDate, end: event.endDate },
      { start: startDate, end: endDate }
    );
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
  return filterEventsByDateRange(events, startOfDay(date), endOfDay(date));
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
  const startTime = format(event.startDate, 'HH:mm');
  const endTime = format(event.endDate, 'HH:mm');
  return `${event.title} (${startTime}-${endTime})`;
}

// ... Date helpers ...
const dateRangeCache = new Map<string, Date[]>();
const MAX_CACHE_SIZE = 100;

export function generateDateRange(start: Date, end: Date): Date[] {
  const s = startOfDay(start);
  const e = startOfDay(end);

  const cacheKey = `${s.getTime()}-${e.getTime()}`;

  if (dateRangeCache.has(cacheKey)) {
    return dateRangeCache.get(cacheKey)!;
  }

  const dates: Date[] = [];
  let current = s;

  while (current <= e) {
    dates.push(current);
    current = addDays(current, 1);
  }

  if (dateRangeCache.size >= MAX_CACHE_SIZE) {
    const firstKey = dateRangeCache.keys().next().value;
    if (firstKey) dateRangeCache.delete(firstKey);
  }

  dateRangeCache.set(cacheKey, dates);
  return dates;
}

export function getWeekStart(date: Date, weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6 = 1): Date {
  return startOfWeek(date, { weekStartsOn });
}

export function getWeekEnd(date: Date, weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6 = 1): Date {
  return endOfWeek(date, { weekStartsOn });
}

export function getMonthStart(date: Date): Date {
  return startOfMonth(date);
}

export function getMonthEnd(date: Date): Date {
  return endOfMonth(date);
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

/**
 * Calculates the display range for a given view mode and reference date.
 * Useful for DayView and WeekView to extend hours if settings require it.
 */
export function calculateViewRange(
  date: Date,
  viewMode: 'day' | 'week' | 'month',
  settings: { startTime: string; endTime: string; weekStartsOn?: number }
): { start: Date; end: Date } {
  const startParts = settings.startTime.split(':');
  const endParts = settings.endTime.split(':');
  const startHour = Number(startParts[0] ?? 0);
  const endHour = Number(endParts[0] ?? 23);

  if (viewMode === 'day') {
    const start = startOfDay(date);
    start.setHours(startHour);

    const end = startOfDay(date);
    if (endHour >= 24) {
      const extraDays = Math.floor(endHour / 24);
      const remainingHours = endHour % 24;
      const targetDate = addDays(end, extraDays);
      targetDate.setHours(remainingHours, 59, 59, 999);
      return { start, end: targetDate };
    } else {
      end.setHours(endHour, 59, 59, 999);
      return { start, end };
    }
  }

  if (viewMode === 'week') {
    const start = getWeekStart(date, (settings.weekStartsOn ?? 1) as any);
    const end = getWeekEnd(date, (settings.weekStartsOn ?? 1) as any);
    return { start, end };
  }

  // Month
  return { start: getMonthStart(date), end: getMonthEnd(date) };
}
