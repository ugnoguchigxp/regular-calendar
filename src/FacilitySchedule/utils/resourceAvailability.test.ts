import { describe, it, expect } from 'vitest';
import type { Resource, ScheduleEvent } from '../FacilitySchedule.schema';
import { getResourceAvailability } from './resourceAvailability';

describe('resourceAvailability', () => {
  const resources: Resource[] = [
    {
      id: 'r1',
      name: 'Resource 1',
      order: 1,
      isAvailable: true,
      groupId: 'g1',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'r2',
      name: 'Resource 2',
      order: 2,
      isAvailable: true,
      groupId: 'g1',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

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
      startDate: new Date('2025-01-01T14:00:00'),
      endDate: new Date('2025-01-01T16:00:00'),
      status: 'booked',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '3',
      resourceId: 'r2',
      groupId: 'g1',
      title: 'Event 3',
      attendee: 'Bob',
      startDate: new Date('2025-01-01T11:00:00'),
      endDate: new Date('2025-01-01T13:00:00'),
      status: 'booked',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '4',
      resourceId: 'r1',
      groupId: 'g1',
      title: 'Cancelled Event',
      attendee: 'Alice',
      startDate: new Date('2025-01-01T11:30:00'),
      endDate: new Date('2025-01-01T12:30:00'),
      status: 'cancelled',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  describe('getResourceAvailability', () => {
    it('should return availability info for all resources', () => {
      const timeRange = {
        start: new Date('2025-01-01T10:00:00'),
        end: new Date('2025-01-01T11:30:00'),
      };

      const result = getResourceAvailability(resources, events, timeRange);

      expect(result).toHaveLength(2);
      expect(result[0].resourceId).toBe('r1');
      expect(result[1].resourceId).toBe('r2');
    });

    it('should detect conflict for overlapping events', () => {
      const timeRange = {
        start: new Date('2025-01-01T10:00:00'),
        end: new Date('2025-01-01T11:30:00'),
      };

      const result = getResourceAvailability(resources, events, timeRange);

      expect(result[0].isAvailable).toBe(false);
      expect(result[0].conflictingEvents).toHaveLength(1);
      expect(result[0].conflictingEvents[0].id).toBe('1');
    });

    it('should return available when no conflicts', () => {
      const timeRange = {
        start: new Date('2025-01-01T13:00:00'),
        end: new Date('2025-01-01T13:30:00'),
      };

      const result = getResourceAvailability(resources, events, timeRange);

      expect(result[0].isAvailable).toBe(true);
      expect(result[0].conflictingEvents).toHaveLength(0);
    });

    it('should exclude cancelled events from conflict detection', () => {
      const timeRange = {
        start: new Date('2025-01-01T11:30:00'),
        end: new Date('2025-01-01T12:30:00'),
      };

      const result = getResourceAvailability(resources, events, timeRange);

      expect(result[0].isAvailable).toBe(false);
      expect(result[0].conflictingEvents).toHaveLength(1);
      expect(result[0].conflictingEvents[0].id).toBe('1');
    });

    it('should exclude specific event from conflict detection', () => {
      const timeRange = {
        start: new Date('2025-01-01T10:00:00'),
        end: new Date('2025-01-01T11:30:00'),
      };

      const result = getResourceAvailability(resources, events, timeRange, '1');

      expect(result[0].isAvailable).toBe(true);
      expect(result[0].conflictingEvents).toHaveLength(0);
    });

    it('should return today schedule for all resources', () => {
      const timeRange = {
        start: new Date('2025-01-01T10:00:00'),
        end: new Date('2025-01-01T11:30:00'),
      };

      const result = getResourceAvailability(resources, events, timeRange);

      expect(result[0].todaySchedule).toHaveLength(2);
      expect(result[0].todaySchedule[0].id).toBe('1');
      expect(result[0].todaySchedule[1].id).toBe('2');
      expect(result[1].todaySchedule).toHaveLength(1);
      expect(result[1].todaySchedule[0].id).toBe('3');
    });

    it('should handle all-day events correctly', () => {
      const eventsWithAllDay: ScheduleEvent[] = [
        {
          id: '1',
          resourceId: 'r1',
          groupId: 'g1',
          title: 'All Day Event',
          attendee: 'John',
          startDate: new Date('2025-01-01T00:00:00'),
          endDate: new Date('2025-01-02T00:00:00'),
          status: 'booked',
          isAllDay: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const timeRange = {
        start: new Date('2025-01-01T10:00:00'),
        end: new Date('2025-01-01T11:00:00'),
      };

      const result = getResourceAvailability(resources, eventsWithAllDay, timeRange);

      expect(result[0].isAvailable).toBe(false);
      expect(result[0].conflictingEvents).toHaveLength(1);
    });

    it('should handle all-day events with isAllDay in extendedProps', () => {
      const eventsWithAllDay: ScheduleEvent[] = [
        {
          id: '1',
          resourceId: 'r1',
          groupId: 'g1',
          title: 'All Day Event',
          attendee: 'John',
          startDate: new Date('2025-01-01T00:00:00'),
          endDate: new Date('2025-01-02T00:00:00'),
          status: 'booked',
          extendedProps: { isAllDay: true },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const timeRange = {
        start: new Date('2025-01-01T10:00:00'),
        end: new Date('2025-01-01T11:00:00'),
      };

      const result = getResourceAvailability(resources, eventsWithAllDay, timeRange);

      expect(result[0].isAvailable).toBe(false);
      expect(result[0].conflictingEvents).toHaveLength(1);
    });

    it('should handle string boolean values for isAllDay', () => {
      const eventsWithAllDay: ScheduleEvent[] = [
        {
          id: '1',
          resourceId: 'r1',
          groupId: 'g1',
          title: 'All Day Event',
          attendee: 'John',
          startDate: new Date('2025-01-01T00:00:00'),
          endDate: new Date('2025-01-02T00:00:00'),
          status: 'booked',
          extendedProps: { isAllDay: 'true' },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const timeRange = {
        start: new Date('2025-01-01T10:00:00'),
        end: new Date('2025-01-01T11:00:00'),
      };

      const result = getResourceAvailability(resources, eventsWithAllDay, timeRange);

      expect(result[0].isAvailable).toBe(false);
    });

    it('should handle invalid dates gracefully', () => {
      const timeRange = {
        start: new Date('invalid'),
        end: new Date('invalid'),
      };

      const result = getResourceAvailability(resources, events, timeRange);

      expect(result).toHaveLength(2);
      expect(result[0].isAvailable).toBe(true);
      expect(result[1].isAvailable).toBe(true);
      expect(result[0].conflictingEvents).toHaveLength(0);
      expect(result[0].todaySchedule).toHaveLength(0);
    });

    it('should sort today schedule by start time', () => {
      const timeRange = {
        start: new Date('2025-01-01T10:00:00'),
        end: new Date('2025-01-01T11:30:00'),
      };

      const result = getResourceAvailability(resources, events, timeRange);

      const todaySchedule = result[0].todaySchedule;
      expect(todaySchedule[0].startDate.getTime()).toBeLessThanOrEqual(todaySchedule[1].startDate.getTime());
    });

    it('should handle events spanning multiple days', () => {
      const multiDayEvents: ScheduleEvent[] = [
        {
          id: '1',
          resourceId: 'r1',
          groupId: 'g1',
          title: 'Multi Day Event',
          attendee: 'John',
          startDate: new Date('2025-01-01T10:00:00'),
          endDate: new Date('2025-01-03T14:00:00'),
          status: 'booked',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const timeRange = {
        start: new Date('2025-01-02T12:00:00'),
        end: new Date('2025-01-02T13:00:00'),
      };

      const result = getResourceAvailability(resources, multiDayEvents, timeRange);

      expect(result[0].isAvailable).toBe(false);
      expect(result[0].conflictingEvents).toHaveLength(1);
    });

    it('should return empty conflicting events for resource with no events', () => {
      const timeRange = {
        start: new Date('2025-01-01T10:00:00'),
        end: new Date('2025-01-01T11:00:00'),
      };

      const result = getResourceAvailability(resources, events, timeRange);

      expect(result[1].isAvailable).toBe(true);
      expect(result[1].conflictingEvents).toHaveLength(0);
    });

    it('should handle events that exactly match time range boundaries', () => {
      const boundaryEvents: ScheduleEvent[] = [
        {
          id: '1',
          resourceId: 'r1',
          groupId: 'g1',
          title: 'Boundary Event',
          attendee: 'John',
          startDate: new Date('2025-01-01T10:00:00'),
          endDate: new Date('2025-01-01T12:00:00'),
          status: 'booked',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const timeRange = {
        start: new Date('2025-01-01T10:00:00'),
        end: new Date('2025-01-01T12:00:00'),
      };

      const result = getResourceAvailability(resources, boundaryEvents, timeRange);

      expect(result[0].isAvailable).toBe(false);
      expect(result[0].conflictingEvents).toHaveLength(1);
    });
  });
});
