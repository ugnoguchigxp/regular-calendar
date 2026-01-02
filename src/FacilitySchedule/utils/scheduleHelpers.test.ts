import { describe, it, expect } from 'vitest';
import type { ScheduleEvent, Resource } from '../FacilitySchedule.schema';
import {
  hasTimeOverlap,
  checkScheduleConflict,
  filterEventsByDateRange,
  filterEventsByResource,
  filterEventsByDay,
  sortEventsByTime,
  sortResourcesByOrder,
  getEventDuration,
  getEventDisplayText,
  generateDateRange,
  getWeekStart,
  getWeekEnd,
  getMonthStart,
  getMonthEnd,
  detectAndMarkConflicts,
  calculateViewRange,
} from './scheduleHelpers';

describe('scheduleHelpers', () => {
  describe('hasTimeOverlap', () => {
    it('should return true for overlapping schedules', () => {
      const schedule1 = {
        startDate: new Date('2025-01-01T10:00:00'),
        endDate: new Date('2025-01-01T12:00:00'),
      };
      const schedule2 = {
        startDate: new Date('2025-01-01T11:00:00'),
        endDate: new Date('2025-01-01T13:00:00'),
      };

      expect(hasTimeOverlap(schedule1, schedule2)).toBe(true);
    });

    it('should return false for non-overlapping schedules', () => {
      const schedule1 = {
        startDate: new Date('2025-01-01T10:00:00'),
        endDate: new Date('2025-01-01T12:00:00'),
      };
      const schedule2 = {
        startDate: new Date('2025-01-01T14:00:00'),
        endDate: new Date('2025-01-01T16:00:00'),
      };

      expect(hasTimeOverlap(schedule1, schedule2)).toBe(false);
    });

    it('should return false for adjacent schedules (end equals start)', () => {
      const schedule1 = {
        startDate: new Date('2025-01-01T10:00:00'),
        endDate: new Date('2025-01-01T12:00:00'),
      };
      const schedule2 = {
        startDate: new Date('2025-01-01T12:00:00'),
        endDate: new Date('2025-01-01T14:00:00'),
      };

      expect(hasTimeOverlap(schedule1, schedule2)).toBe(false);
    });
  });

  describe('checkScheduleConflict', () => {
    const existingEvents: ScheduleEvent[] = [
      {
        id: '1',
        resourceId: 'r1',
        groupId: 'g1',
        title: 'Event 1',
        attendee: 'John',
        startDate: new Date('2025-01-01T10:00:00'),
        endDate: new Date('2025-01-01T12:00:00'),
        status: 'booked',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '2',
        resourceId: 'r1',
        groupId: 'g1',
        title: 'Event 2',
        attendee: 'Jane',
        startDate: new Date('2025-01-01T14:00:00'),
        endDate: new Date('2025-01-01T16:00:00'),
        status: 'booked',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    it('should detect conflict for overlapping events on same resource', () => {
      const newEvent = {
        id: '3',
        resourceId: 'r1',
        groupId: 'g1',
        title: 'New Event',
        attendee: 'Bob',
        startDate: new Date('2025-01-01T11:00:00'),
        endDate: new Date('2025-01-01T13:00:00'),
        status: 'booked',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const conflict = checkScheduleConflict(newEvent, existingEvents);

      expect(conflict).not.toBeNull();
      expect(conflict?.conflictType).toBe('double-booking');
      expect(conflict?.resourceId).toBe('r1');
    });

    it('should not detect conflict for non-overlapping events', () => {
      const newEvent = {
        id: '3',
        resourceId: 'r1',
        groupId: 'g1',
        title: 'New Event',
        attendee: 'Bob',
        startDate: new Date('2025-01-01T16:00:00'),
        endDate: new Date('2025-01-01T18:00:00'),
        status: 'booked',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const conflict = checkScheduleConflict(newEvent, existingEvents);

      expect(conflict).toBeNull();
    });

    it('should not detect conflict for events on different resources', () => {
      const newEvent = {
        id: '3',
        resourceId: 'r2',
        groupId: 'g1',
        title: 'New Event',
        attendee: 'Bob',
        startDate: new Date('2025-01-01T11:00:00'),
        endDate: new Date('2025-01-01T13:00:00'),
        status: 'booked',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const conflict = checkScheduleConflict(newEvent, existingEvents);

      expect(conflict).toBeNull();
    });

    it('should skip cancelled events', () => {
      const eventsWithCancelled = [
        {
          id: '1',
          resourceId: 'r1',
          groupId: 'g1',
          title: 'Cancelled Event',
          attendee: 'Bob',
          startDate: new Date('2025-01-01T10:00:00'),
          endDate: new Date('2025-01-01T12:00:00'),
          status: 'cancelled',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const newEvent = {
        id: '2',
        resourceId: 'r1',
        groupId: 'g1',
        title: 'New Event',
        attendee: 'Alice',
        startDate: new Date('2025-01-01T10:00:00'),
        endDate: new Date('2025-01-01T12:00:00'),
        status: 'booked',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const conflict = checkScheduleConflict(newEvent, eventsWithCancelled);

      expect(conflict).toBeNull();
    });

    it('should skip same event (by id)', () => {
      const newEvent = {
        id: '1',
        resourceId: 'r1',
        groupId: 'g1',
        title: 'Event 1 Updated',
        attendee: 'John Updated',
        startDate: new Date('2025-01-01T11:00:00'),
        endDate: new Date('2025-01-01T13:00:00'),
        status: 'booked',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const conflict = checkScheduleConflict(newEvent, existingEvents);

      expect(conflict).toBeNull();
    });
  });

  describe('filterEventsByDateRange', () => {
    const events: ScheduleEvent[] = [
      {
        id: '1',
        resourceId: 'r1',
        groupId: 'g1',
        title: 'Event 1',
        attendee: 'John',
        startDate: new Date('2025-01-01T10:00:00'),
        endDate: new Date('2025-01-01T12:00:00'),
        status: 'booked',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '2',
        resourceId: 'r1',
        groupId: 'g1',
        title: 'Event 2',
        attendee: 'Jane',
        startDate: new Date('2025-01-02T14:00:00'),
        endDate: new Date('2025-01-02T16:00:00'),
        status: 'booked',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '3',
        resourceId: 'r1',
        groupId: 'g1',
        title: 'Event 3',
        attendee: 'Bob',
        startDate: new Date('2025-01-03T09:00:00'),
        endDate: new Date('2025-01-03T11:00:00'),
        status: 'booked',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    it('should filter events within date range', () => {
      const startDate = new Date('2025-01-01T00:00:00');
      const endDate = new Date('2025-01-02T23:59:59');

      const result = filterEventsByDateRange(events, startDate, endDate);

      expect(result).toHaveLength(2);
      expect(result.map(e => e.id)).toEqual(['1', '2']);
    });

    it('should include events that overlap range boundaries', () => {
      const startDate = new Date('2025-01-02T12:00:00');
      const endDate = new Date('2025-01-03T10:00:00');

      const result = filterEventsByDateRange(events, startDate, endDate);

      expect(result).toHaveLength(2);
      expect(result.map(e => e.id)).toEqual(['2', '3']);
    });

    it('should return empty array for no matching events', () => {
      const startDate = new Date('2025-02-01T00:00:00');
      const endDate = new Date('2025-02-02T23:59:59');

      const result = filterEventsByDateRange(events, startDate, endDate);

      expect(result).toHaveLength(0);
    });
  });

  describe('filterEventsByResource', () => {
    const events: ScheduleEvent[] = [
      {
        id: '1',
        resourceId: 'r1',
        groupId: 'g1',
        title: 'Event 1',
        attendee: 'John',
        startDate: new Date('2025-01-01T10:00:00'),
        endDate: new Date('2025-01-01T12:00:00'),
        status: 'booked',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '2',
        resourceId: 'r2',
        groupId: 'g1',
        title: 'Event 2',
        attendee: 'Jane',
        startDate: new Date('2025-01-01T14:00:00'),
        endDate: new Date('2025-01-01T16:00:00'),
        status: 'booked',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    it('should filter events by resource id', () => {
      const result = filterEventsByResource(events, 'r1');

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });

    it('should return empty array for non-existent resource', () => {
      const result = filterEventsByResource(events, 'r999');

      expect(result).toHaveLength(0);
    });
  });

  describe('filterEventsByDay', () => {
    const events: ScheduleEvent[] = [
      {
        id: '1',
        resourceId: 'r1',
        groupId: 'g1',
        title: 'Event 1',
        attendee: 'John',
        startDate: new Date('2025-01-01T10:00:00'),
        endDate: new Date('2025-01-01T12:00:00'),
        status: 'booked',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '2',
        resourceId: 'r1',
        groupId: 'g1',
        title: 'Event 2',
        attendee: 'Jane',
        startDate: new Date('2025-01-02T14:00:00'),
        endDate: new Date('2025-01-02T16:00:00'),
        status: 'booked',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    it('should filter events for specific day', () => {
      const date = new Date('2025-01-01T00:00:00');

      const result = filterEventsByDay(events, date);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });
  });

  describe('sortEventsByTime', () => {
    const events: ScheduleEvent[] = [
      {
        id: '2',
        resourceId: 'r1',
        groupId: 'g1',
        title: 'Event 2',
        attendee: 'Jane',
        startDate: new Date('2025-01-01T14:00:00'),
        endDate: new Date('2025-01-01T16:00:00'),
        status: 'booked',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '1',
        resourceId: 'r1',
        groupId: 'g1',
        title: 'Event 1',
        attendee: 'John',
        startDate: new Date('2025-01-01T10:00:00'),
        endDate: new Date('2025-01-01T12:00:00'),
        status: 'booked',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    it('should sort events by start time', () => {
      const result = sortEventsByTime(events);

      expect(result[0].id).toBe('1');
      expect(result[1].id).toBe('2');
    });

    it('should not mutate original array', () => {
      const originalOrder = events.map(e => e.id);
      sortEventsByTime(events);

      expect(events.map(e => e.id)).toEqual(originalOrder);
    });
  });

  describe('sortResourcesByOrder', () => {
    const resources: Resource[] = [
      { id: 'r2', name: 'Resource 2', order: 2, isAvailable: true, groupId: 'g1', createdAt: new Date(), updatedAt: new Date() },
      { id: 'r1', name: 'Resource 1', order: 1, isAvailable: true, groupId: 'g1', createdAt: new Date(), updatedAt: new Date() },
      { id: 'r3', name: 'Resource 3', order: 3, isAvailable: true, groupId: 'g1', createdAt: new Date(), updatedAt: new Date() },
    ];

    it('should sort resources by order', () => {
      const result = sortResourcesByOrder(resources);

      expect(result[0].id).toBe('r1');
      expect(result[1].id).toBe('r2');
      expect(result[2].id).toBe('r3');
    });

    it('should not mutate original array', () => {
      const originalOrder = resources.map(r => r.id);
      sortResourcesByOrder(resources);

      expect(resources.map(r => r.id)).toEqual(originalOrder);
    });
  });

  describe('getEventDuration', () => {
    it('should calculate duration in hours', () => {
      const event: ScheduleEvent = {
        id: '1',
        resourceId: 'r1',
        groupId: 'g1',
        title: 'Event 1',
        attendee: 'John',
        startDate: new Date('2025-01-01T10:00:00'),
        endDate: new Date('2025-01-01T12:00:00'),
        status: 'booked',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const duration = getEventDuration(event);

      expect(duration).toBe(2);
    });

    it('should calculate partial hour duration', () => {
      const event: ScheduleEvent = {
        id: '1',
        resourceId: 'r1',
        groupId: 'g1',
        title: 'Event 1',
        attendee: 'John',
        startDate: new Date('2025-01-01T10:00:00'),
        endDate: new Date('2025-01-01T11:30:00'),
        status: 'booked',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const duration = getEventDuration(event);

      expect(duration).toBe(1.5);
    });
  });

  describe('getEventDisplayText', () => {
    it('should format event display text', () => {
      const event: ScheduleEvent = {
        id: '1',
        resourceId: 'r1',
        groupId: 'g1',
        title: 'Meeting',
        attendee: 'John',
        startDate: new Date('2025-01-01T10:00:00'),
        endDate: new Date('2025-01-01T12:00:00'),
        status: 'booked',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const displayText = getEventDisplayText(event);

      expect(displayText).toBe('Meeting (10:00-12:00)');
    });
  });

  describe('generateDateRange', () => {
    it('should generate date range for single day', () => {
      const start = new Date('2025-01-01T00:00:00');
      const end = new Date('2025-01-01T00:00:00');

      const result = generateDateRange(start, end);

      expect(result).toHaveLength(1);
      expect(result[0].toDateString()).toBe('Wed Jan 01 2025');
    });

    it('should generate date range for multiple days', () => {
      const start = new Date('2025-01-01T00:00:00');
      const end = new Date('2025-01-05T00:00:00');

      const result = generateDateRange(start, end);

      expect(result).toHaveLength(5);
      expect(result[0].toDateString()).toBe('Wed Jan 01 2025');
      expect(result[4].toDateString()).toBe('Sun Jan 05 2025');
    });

    it('should cache results', () => {
      const start = new Date('2025-01-01T00:00:00');
      const end = new Date('2025-01-05T00:00:00');

      const result1 = generateDateRange(start, end);
      const result2 = generateDateRange(start, end);

      expect(result1).toBe(result2);
    });
  });

  describe('getWeekStart', () => {
    it('should return Monday as week start when weekStartsOn is 1', () => {
      const date = new Date('2025-01-03T10:00:00'); // Friday

      const weekStart = getWeekStart(date, 1);

      expect(weekStart.toDateString()).toBe('Mon Dec 30 2024');
    });

    it('should return Sunday as week start when weekStartsOn is 0', () => {
      const date = new Date('2025-01-03T10:00:00'); // Friday

      const weekStart = getWeekStart(date, 0);

      expect(weekStart.toDateString()).toBe('Sun Dec 29 2024');
    });

    it('should default to Monday as week start', () => {
      const date = new Date('2025-01-03T10:00:00'); // Friday

      const weekStart = getWeekStart(date);

      expect(weekStart.toDateString()).toBe('Mon Dec 30 2024');
    });
  });

  describe('getWeekEnd', () => {
    it('should return Sunday as week end when weekStartsOn is 1', () => {
      const date = new Date('2025-01-03T10:00:00'); // Friday

      const weekEnd = getWeekEnd(date, 1);

      expect(weekEnd.toDateString()).toBe('Sun Jan 05 2025');
    });

    it('should return Saturday as week end when weekStartsOn is 0', () => {
      const date = new Date('2025-01-03T10:00:00'); // Friday

      const weekEnd = getWeekEnd(date, 0);

      expect(weekEnd.toDateString()).toBe('Sat Jan 04 2025');
    });
  });

  describe('getMonthStart', () => {
    it('should return start of month', () => {
      const date = new Date('2025-01-15T10:00:00');

      const monthStart = getMonthStart(date);

      expect(monthStart.toDateString()).toBe('Wed Jan 01 2025');
    });
  });

  describe('getMonthEnd', () => {
    it('should return end of month', () => {
      const date = new Date('2025-01-15T10:00:00');

      const monthEnd = getMonthEnd(date);

      expect(monthEnd.toDateString()).toBe('Fri Jan 31 2025');
    });
  });

  describe('detectAndMarkConflicts', () => {
    const events: ScheduleEvent[] = [
      {
        id: '1',
        resourceId: 'r1',
        groupId: 'g1',
        title: 'Event 1',
        attendee: 'John',
        startDate: new Date('2025-01-01T10:00:00'),
        endDate: new Date('2025-01-01T12:00:00'),
        status: 'booked',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '2',
        resourceId: 'r1',
        groupId: 'g1',
        title: 'Event 2',
        attendee: 'Jane',
        startDate: new Date('2025-01-01T11:00:00'),
        endDate: new Date('2025-01-01T13:00:00'),
        status: 'booked',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '3',
        resourceId: 'r1',
        groupId: 'g1',
        title: 'Event 3',
        attendee: 'Bob',
        startDate: new Date('2025-01-01T14:00:00'),
        endDate: new Date('2025-01-01T16:00:00'),
        status: 'booked',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '4',
        resourceId: 'r2',
        groupId: 'g1',
        title: 'Event 4',
        attendee: 'Alice',
        startDate: new Date('2025-01-01T11:00:00'),
        endDate: new Date('2025-01-01T13:00:00'),
        status: 'booked',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    it('should mark overlapping events on same resource', () => {
      const result = detectAndMarkConflicts(events);

      expect(result[0].hasConflict).toBe(true);
      expect(result[1].hasConflict).toBe(true);
      expect(result[2].hasConflict).toBe(false);
      expect(result[3].hasConflict).toBe(false);
    });

    it('should not mark cancelled events', () => {
      const eventsWithCancelled = [
        ...events,
        {
          id: '5',
          resourceId: 'r1',
          groupId: 'g1',
          title: 'Cancelled Event',
          attendee: 'Charlie',
          startDate: new Date('2025-01-01T11:30:00'),
          endDate: new Date('2025-01-01T12:30:00'),
          status: 'cancelled',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const result = detectAndMarkConflicts(eventsWithCancelled);

      expect(result[4].hasConflict).toBe(false);
    });
  });

  describe('calculateViewRange', () => {
    it('should calculate day view range', () => {
      const date = new Date('2025-01-01T10:00:00');
      const settings = {
        startTime: '08:00',
        endTime: '20:00',
      };

      const result = calculateViewRange(date, 'day', settings);

      expect(result.start.getHours()).toBe(8);
      expect(result.start.getDate()).toBe(1);
      expect(result.end.getHours()).toBe(20);
      expect(result.end.getDate()).toBe(1);
    });

    it('should handle end time extending to next day', () => {
      const date = new Date('2025-01-01T10:00:00');
      const settings = {
        startTime: '08:00',
        endTime: '26:00',
      };

      const result = calculateViewRange(date, 'day', settings);

      expect(result.start.getHours()).toBe(8);
      expect(result.start.getDate()).toBe(1);
      expect(result.end.getHours()).toBe(2);
      expect(result.end.getDate()).toBe(2);
    });

    it('should calculate week view range', () => {
      const date = new Date('2025-01-03T10:00:00'); // Friday
      const settings = {
        startTime: '08:00',
        endTime: '20:00',
        weekStartsOn: 1,
      };

      const result = calculateViewRange(date, 'week', settings);

      expect(result.start.toDateString()).toBe('Mon Dec 30 2024');
      expect(result.end.toDateString()).toBe('Sun Jan 05 2025');
    });

    it('should calculate month view range', () => {
      const date = new Date('2025-01-15T10:00:00');
      const settings = {
        startTime: '08:00',
        endTime: '20:00',
      };

      const result = calculateViewRange(date, 'month', settings);

      expect(result.start.toDateString()).toBe('Wed Jan 01 2025');
      expect(result.end.toDateString()).toBe('Fri Jan 31 2025');
    });
  });
});
