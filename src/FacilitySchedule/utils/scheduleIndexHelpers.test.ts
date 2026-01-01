import type { ScheduleEvent } from '../FacilitySchedule.schema';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
    createEventIndexes,
    getDayKey,
    getEventsByResource,
    getEventsByDay,
    getEventsByGroup,
} from './scheduleIndexHelpers';

describe('scheduleIndexHelpers', () => {
    const mockEvents: ScheduleEvent[] = [
        {
            id: '1',
            title: 'Event 1',
            resourceId: 'resource1',
            groupId: 'group1',
            attendee: 'Person 1',
            startDate: new Date('2025-01-01T10:00:00'),
            endDate: new Date('2025-01-01T11:00:00'),
            status: 'confirmed',
            createdAt: new Date('2025-01-01T00:00:00'),
            updatedAt: new Date('2025-01-01T00:00:00'),
        },
        {
            id: '2',
            title: 'Event 2',
            resourceId: 'resource1',
            groupId: 'group1',
            attendee: 'Person 2',
            startDate: new Date('2025-01-01T12:00:00'),
            endDate: new Date('2025-01-01T13:00:00'),
            status: 'confirmed',
            createdAt: new Date('2025-01-01T00:00:00'),
            updatedAt: new Date('2025-01-01T00:00:00'),
        },
        {
            id: '3',
            title: 'Event 3',
            resourceId: 'resource2',
            groupId: 'group2',
            attendee: 'Person 3',
            startDate: new Date('2025-01-02T10:00:00'),
            endDate: new Date('2025-01-02T11:00:00'),
            status: 'confirmed',
            createdAt: new Date('2025-01-02T00:00:00'),
            updatedAt: new Date('2025-01-02T00:00:00'),
        },
        {
            id: '4',
            title: 'Event 4',
            resourceId: 'resource2',
            groupId: 'group1',
            attendee: 'Person 4',
            startDate: new Date('2025-01-01T14:00:00'),
            endDate: new Date('2025-01-01T15:00:00'),
            status: 'confirmed',
            createdAt: new Date('2025-01-01T00:00:00'),
            updatedAt: new Date('2025-01-01T00:00:00'),
        },
    ];

    describe('createEventIndexes', () => {
        it('creates empty indexes for empty events array', () => {
            const indexes = createEventIndexes([]);
            expect(indexes.byResource.size).toBe(0);
            expect(indexes.byDay.size).toBe(0);
            expect(indexes.byGroup.size).toBe(0);
        });

        it('indexes events by resource', () => {
            const indexes = createEventIndexes(mockEvents);
            expect(indexes.byResource.get('resource1')).toHaveLength(2);
            expect(indexes.byResource.get('resource2')).toHaveLength(2);
        });

        it('indexes events by day', () => {
            const indexes = createEventIndexes(mockEvents);
            const day1Key = getDayKey(mockEvents[0].startDate);
            const day2Key = getDayKey(mockEvents[2].startDate);
            
            expect(indexes.byDay.get(day1Key)).toHaveLength(3);
            expect(indexes.byDay.get(day2Key)).toHaveLength(1);
        });

        it('indexes events by group', () => {
            const indexes = createEventIndexes(mockEvents);
            expect(indexes.byGroup.get('group1')).toHaveLength(3);
            expect(indexes.byGroup.get('group2')).toHaveLength(1);
        });

        it('handles events without resourceId', () => {
            const eventsWithoutResource: ScheduleEvent[] = [
                {
                    id: '1',
                    title: 'Event',
                    groupId: 'group1',
                    attendee: 'Person 1',
                    startDate: new Date('2025-01-01T00:00:00'),
                    endDate: new Date('2025-01-01T01:00:00'),
                    status: 'confirmed',
                    createdAt: new Date('2025-01-01T00:00:00'),
                    updatedAt: new Date('2025-01-01T00:00:00'),
                },
            ];
            const indexes = createEventIndexes(eventsWithoutResource);
            expect(indexes.byResource.size).toBe(0);
            expect(indexes.byGroup.get('group1')).toHaveLength(1);
        });
    });

    describe('getDayKey', () => {
        it('returns consistent day key for local dates', () => {
            const date = new Date('2025-01-15T10:00:00');
            const key = getDayKey(date);
            expect(key).toBeTruthy();
            expect(typeof key).toBe('string');
            expect(key).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        });

        it('returns same key for same day in different times', () => {
            const date1 = new Date('2025-01-15T10:00:00');
            const date2 = new Date('2025-01-15T18:30:45');
            expect(getDayKey(date1)).toBe(getDayKey(date2));
        });

        it('returns different keys for different dates', () => {
            const date1 = new Date('2025-01-15T10:00:00');
            const date2 = new Date('2025-01-16T10:00:00');
            expect(getDayKey(date1)).not.toBe(getDayKey(date2));
        });

        it('handles month boundaries', () => {
            const date = new Date('2025-01-31T23:59:59');
            const key = getDayKey(date);
            expect(key).toBeTruthy();
            expect(key.startsWith('2025-01')).toBe(true);
        });

        it('handles year boundaries', () => {
            const date = new Date('2025-12-31T23:59:59');
            const key = getDayKey(date);
            expect(key).toBeTruthy();
            expect(key.startsWith('2025-12')).toBe(true);
        });

        it('handles leap year dates', () => {
            const date = new Date('2024-02-29T12:00:00');
            const key = getDayKey(date);
            expect(key).toBeTruthy();
        });

        it('caches results for performance', () => {
            const date = new Date('2025-01-15T12:00:00');
            const key1 = getDayKey(date);
            const key2 = getDayKey(date);
            expect(key1).toBe(key2);
        });
    });

    describe('getEventsByResource', () => {
        it('returns events for existing resource', () => {
            const indexes = createEventIndexes(mockEvents);
            const events = getEventsByResource('resource1', indexes);
            expect(events).toHaveLength(2);
            expect(events[0].id).toBe('1');
            expect(events[1].id).toBe('2');
        });

        it('returns empty array for non-existent resource', () => {
            const indexes = createEventIndexes(mockEvents);
            const events = getEventsByResource('nonexistent', indexes);
            expect(events).toEqual([]);
        });
    });

    describe('getEventsByDay', () => {
        it('returns events for existing day', () => {
            const indexes = createEventIndexes(mockEvents);
            const events = getEventsByDay(new Date('2025-01-01'), indexes);
            expect(events).toHaveLength(3);
        });

        it('returns events with times', () => {
            const indexes = createEventIndexes(mockEvents);
            const events = getEventsByDay(new Date('2025-01-01T10:00:00'), indexes);
            expect(events).toHaveLength(3);
        });

        it('returns empty array for non-existent day', () => {
            const indexes = createEventIndexes(mockEvents);
            const events = getEventsByDay(new Date('2025-01-03'), indexes);
            expect(events).toEqual([]);
        });
    });

    describe('getEventsByGroup', () => {
        it('returns events for existing group', () => {
            const indexes = createEventIndexes(mockEvents);
            const events = getEventsByGroup('group1', indexes);
            expect(events).toHaveLength(3);
        });

        it('returns empty array for non-existent group', () => {
            const indexes = createEventIndexes(mockEvents);
            const events = getEventsByGroup('nonexistent', indexes);
            expect(events).toEqual([]);
        });
    });
});
