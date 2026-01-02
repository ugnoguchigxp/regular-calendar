import { describe, it, expect, vi } from 'vitest';
import type { Personnel } from '../../PersonnelPanel/PersonnelPanel.schema';
import { transformBookingsToEvents } from './transformBookings';

describe('transformBookings', () => {
  const personnel: Personnel[] = [
    {
      id: 'p1',
      name: 'Person 1',
      department: 'Engineering',
      email: 'person1@example.com',
      priority: 0,
    },
    {
      id: 'p2',
      name: 'Person 2',
      department: 'Design',
      email: 'person2@example.com',
      priority: 0,
    },
  ];

  describe('transformBookingsToEvents', () => {
    const mockAvailability = [
      {
        resourceId: 'r1',
        resourceName: 'Resource 1',
        groupId: 'g1',
        isAvailable: true,
        bookings: [
          {
            eventId: 'e1',
            title: 'Meeting',
            startDate: '2025-01-01T10:00:00',
            endDate: '2025-01-01T12:00:00',
            isAllDay: false,
            attendee: '[]',
          },
          {
            eventId: 'e2',
            title: 'Workshop',
            startDate: '2025-01-01T14:00:00',
            endDate: '2025-01-01T16:00:00',
            isAllDay: false,
            attendee: '[{"name": "John Doe"}]',
          },
        ],
      },
      {
        resourceId: 'r2',
        resourceName: 'Resource 2',
        groupId: 'g1',
        isAvailable: true,
        bookings: [
          {
            eventId: 'e3',
            title: 'Training',
            startDate: '2025-01-01T09:00:00',
            endDate: '2025-01-01T11:00:00',
            isAllDay: false,
            attendee: '[{"name": "Jane Smith", "personnelId": "p1"}]',
            extendedProps: JSON.stringify({ ownerId: 'p1' }),
          },
        ],
      },
    ];

    it('should transform bookings to events', () => {
      const result = transformBookingsToEvents(mockAvailability, personnel);

      expect(result).toHaveLength(3);
      expect(result[0].id).toBe('e1');
      expect(result[1].id).toBe('e2');
      expect(result[2].id).toBe('e3');
    });

    it('should parse dates correctly', () => {
      const result = transformBookingsToEvents(mockAvailability, personnel);

      expect(result[0].startDate).toBeInstanceOf(Date);
      expect(result[0].endDate).toBeInstanceOf(Date);
      expect(result[0].startDate.getTime()).toBe(new Date('2025-01-01T10:00:00').getTime());
    });

    it('should set correct resource and group ids', () => {
      const result = transformBookingsToEvents(mockAvailability, personnel);

      expect(result[0].resourceId).toBe('r1');
      expect(result[0].groupId).toBe('g1');
      expect(result[2].resourceId).toBe('r2');
      expect(result[2].groupId).toBe('g1');
    });

    it('should handle all-day events', () => {
      const availabilityWithAllDay = [
        {
          resourceId: 'r1',
          resourceName: 'Resource 1',
          groupId: 'g1',
          isAvailable: true,
          bookings: [
            {
              eventId: 'e1',
              title: 'All Day Event',
              startDate: '2025-01-01T00:00:00',
              endDate: '2025-01-02T00:00:00',
              isAllDay: true,
              attendee: '[]',
            },
          ],
        },
      ];

      const result = transformBookingsToEvents(availabilityWithAllDay, personnel);

      expect(result[0].isAllDay).toBe(true);
    });

    it('should format title with attendees', () => {
      const result = transformBookingsToEvents(mockAvailability, personnel);

      expect(result[1].title).toBe('Workshop (John Doe)');
    });

    it('should keep original title when no attendees', () => {
      const result = transformBookingsToEvents(mockAvailability, personnel);

      expect(result[0].title).toBe('Meeting');
    });

    it('should assign color based on owner', () => {
      const result = transformBookingsToEvents(mockAvailability, personnel);

      expect(result[2].color).toBeDefined();
    });

    it('should not assign color when no owner match', () => {
      const availabilityWithoutOwner = [
        {
          resourceId: 'r1',
          resourceName: 'Resource 1',
          groupId: 'g1',
          isAvailable: true,
          bookings: [
            {
              eventId: 'e1',
              title: 'Meeting',
              startDate: '2025-01-01T10:00:00',
              endDate: '2025-01-01T12:00:00',
              isAllDay: false,
              attendee: '[{"personnelId": "p999"}]',
              extendedProps: JSON.stringify({ ownerId: 'p999' }),
            },
          ],
        },
      ];

      const result = transformBookingsToEvents(availabilityWithoutOwner, personnel);

      expect(result[0].color).toBeUndefined();
    });

    it('should handle string extendedProps', () => {
      const availabilityWithStringProps = [
        {
          resourceId: 'r1',
          resourceName: 'Resource 1',
          groupId: 'g1',
          isAvailable: true,
          bookings: [
            {
              eventId: 'e1',
              title: 'Meeting',
              startDate: '2025-01-01T10:00:00',
              endDate: '2025-01-01T12:00:00',
              isAllDay: false,
              attendee: '[]',
              extendedProps: JSON.stringify({ ownerId: 'p1', custom: 'value' }),
            },
          ],
        },
      ];

      const result = transformBookingsToEvents(availabilityWithStringProps, personnel);

      expect(result[0].extendedProps?.ownerId).toBe('p1');
      expect(result[0].extendedProps?.custom).toBe('value');
      expect(result[0].extendedProps?.originalTitle).toBe('Meeting');
    });

    it('should handle object extendedProps', () => {
      const availabilityWithObjectProps = [
        {
          resourceId: 'r1',
          resourceName: 'Resource 1',
          groupId: 'g1',
          isAvailable: true,
          bookings: [
            {
              eventId: 'e1',
              title: 'Meeting',
              startDate: '2025-01-01T10:00:00',
              endDate: '2025-01-01T12:00:00',
              isAllDay: false,
              attendee: '[]',
              extendedProps: { ownerId: 'p1', custom: 'value' } as any,
            },
          ],
        },
      ];

      const result = transformBookingsToEvents(availabilityWithObjectProps, personnel);

      expect(result[0].extendedProps?.ownerId).toBe('p1');
      expect(result[0].extendedProps?.custom).toBe('value');
    });

    it('should handle invalid extendedProps JSON', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const availabilityWithInvalidProps = [
        {
          resourceId: 'r1',
          resourceName: 'Resource 1',
          groupId: 'g1',
          isAvailable: true,
          bookings: [
            {
              eventId: 'e1',
              title: 'Meeting',
              startDate: '2025-01-01T10:00:00',
              endDate: '2025-01-01T12:00:00',
              isAllDay: false,
              attendee: '[]',
              extendedProps: 'invalid json',
            },
          ],
        },
      ];

      const result = transformBookingsToEvents(availabilityWithInvalidProps, personnel);

      expect(result[0].extendedProps).toHaveProperty('originalTitle', 'Meeting');
      expect(result[0].extendedProps).toHaveProperty('ownerId', undefined);

      consoleSpy.mockRestore();
    });

    it('should handle missing extendedProps', () => {
      const availabilityWithoutProps = [
        {
          resourceId: 'r1',
          resourceName: 'Resource 1',
          groupId: 'g1',
          isAvailable: true,
          bookings: [
            {
              eventId: 'e1',
              title: 'Meeting',
              startDate: '2025-01-01T10:00:00',
              endDate: '2025-01-01T12:00:00',
              isAllDay: false,
              attendee: '[]',
            },
          ],
        },
      ];

      const result = transformBookingsToEvents(availabilityWithoutProps, personnel);

      expect(result[0].extendedProps).toBeDefined();
    });

    it('should set status to booked', () => {
      const result = transformBookingsToEvents(mockAvailability, personnel);

      result.forEach(event => {
        expect(event.status).toBe('booked');
      });
    });

    it('should set createdAt and updatedAt', () => {
      const result = transformBookingsToEvents(mockAvailability, personnel);

      result.forEach(event => {
        expect(event.createdAt).toBeInstanceOf(Date);
        expect(event.updatedAt).toBeInstanceOf(Date);
      });
    });

    it('should handle empty bookings', () => {
      const availabilityWithEmptyBookings = [
        {
          resourceId: 'r1',
          resourceName: 'Resource 1',
          groupId: 'g1',
          isAvailable: true,
          bookings: [],
        },
      ];

      const result = transformBookingsToEvents(availabilityWithEmptyBookings, personnel);

      expect(result).toHaveLength(0);
    });

    it('should handle multiple resources', () => {
      const result = transformBookingsToEvents(mockAvailability, personnel);

      expect(result.some(e => e.resourceId === 'r1')).toBe(true);
      expect(result.some(e => e.resourceId === 'r2')).toBe(true);
    });

    it('should preserve attendee data', () => {
      const result = transformBookingsToEvents(mockAvailability, personnel);

      expect(result[0].attendee).toBe('[]');
      expect(result[1].attendee).toBe('[{"name": "John Doe"}]');
    });
  });
});
