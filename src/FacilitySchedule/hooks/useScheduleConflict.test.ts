import { describe, it, expect } from 'vitest';
import { useScheduleConflict } from './useScheduleConflict';
import { renderHook } from '@testing-library/react';
import type { ScheduleEvent } from '../FacilitySchedule.schema';

describe('useScheduleConflict', () => {
  const mockEvents: ScheduleEvent[] = [
    {
      id: 'event-1',
      resourceId: 'resource-1',
      groupId: 'group-1',
      title: 'Event 1',
      attendee: 'John Doe',
      startDate: new Date('2025-01-01T10:00:00Z'),
      endDate: new Date('2025-01-01T11:00:00Z'),
      status: 'confirmed',
      createdAt: new Date('2025-01-01T00:00:00Z'),
      updatedAt: new Date('2025-01-01T00:00:00Z'),
    },
    {
      id: 'event-2',
      resourceId: 'resource-2',
      groupId: 'group-1',
      title: 'Event 2',
      attendee: 'Jane Smith',
      startDate: new Date('2025-01-01T10:00:00Z'),
      endDate: new Date('2025-01-01T11:00:00Z'),
      status: 'confirmed',
      createdAt: new Date('2025-01-01T00:00:00Z'),
      updatedAt: new Date('2025-01-01T00:00:00Z'),
    },
  ];

  it('detects conflict when events overlap', () => {
    const { result } = renderHook(() =>
      useScheduleConflict({
        startDate: '2025-01-01T10:30:00Z',
        duration: 1,
        resourceId: 'resource-1',
        events: mockEvents,
      }),
    );

    expect(result.current).not.toBeNull();
    expect(result.current?.existingSchedule.id).toBe('event-1');
  });

  it('detects conflict when event starts at same time', () => {
    const { result } = renderHook(() =>
      useScheduleConflict({
        startDate: '2025-01-01T10:00:00Z',
        duration: 0.5,
        resourceId: 'resource-1',
        events: mockEvents,
      }),
    );

    expect(result.current).not.toBeNull();
    expect(result.current?.existingSchedule.id).toBe('event-1');
  });

  it('returns null when no conflict exists', () => {
    const { result } = renderHook(() =>
      useScheduleConflict({
        startDate: '2025-01-01T12:00:00Z',
        duration: 1,
        resourceId: 'resource-1',
        events: mockEvents,
      }),
    );

    expect(result.current).toBeNull();
  });

  it('returns null when using different resource', () => {
    const { result } = renderHook(() =>
      useScheduleConflict({
        startDate: '2025-01-01T10:30:00Z',
        duration: 1,
        resourceId: 'resource-2',
        events: [
          {
            id: 'event-1',
            resourceId: 'resource-1',
            groupId: 'group-1',
            title: 'Event 1',
            attendee: 'John Doe',
            startDate: new Date('2025-01-01T10:00:00Z'),
            endDate: new Date('2025-01-01T11:00:00Z'),
            status: 'confirmed',
            createdAt: new Date('2025-01-01T00:00:00Z'),
            updatedAt: new Date('2025-01-01T00:00:00Z'),
          },
        ],
      }),
    );

    expect(result.current).toBeNull();
  });

  it('excludes current event from conflict check', () => {
    const { result } = renderHook(() =>
      useScheduleConflict({
        startDate: '2025-01-01T10:30:00Z',
        duration: 0.5,
        resourceId: 'resource-1',
        events: mockEvents,
        currentEventId: 'event-1',
      }),
    );

    expect(result.current).toBeNull();
  });

  it('returns null when resourceId is undefined', () => {
    const { result } = renderHook(() =>
      useScheduleConflict({
        startDate: '2025-01-01T10:00:00Z',
        duration: 1,
        resourceId: undefined,
        events: mockEvents,
      }),
    );

    expect(result.current).toBeNull();
  });

  it('returns null when startDate is invalid', () => {
    const { result } = renderHook(() =>
      useScheduleConflict({
        startDate: 'invalid-date',
        duration: 1,
        resourceId: 'resource-1',
        events: mockEvents,
      }),
    );

    expect(result.current).toBeNull();
  });

  it('handles zero duration - no conflict when start equals end', () => {
    const { result } = renderHook(() =>
      useScheduleConflict({
        startDate: '2025-01-01T10:00:00Z',
        duration: 0,
        resourceId: 'resource-1',
        events: mockEvents,
      }),
    );

    expect(result.current).toBeNull();
  });

  it('handles negative duration - end time before start time', () => {
    const { result } = renderHook(() =>
      useScheduleConflict({
        startDate: '2025-01-01T10:00:00Z',
        duration: -1,
        resourceId: 'resource-1',
        events: mockEvents,
      }),
    );

    expect(result.current).toBeNull();
  });

  it('handles empty events array', () => {
    const { result } = renderHook(() =>
      useScheduleConflict({
        startDate: '2025-01-01T10:00:00Z',
        duration: 1,
        resourceId: 'resource-1',
        events: [],
      }),
    );

    expect(result.current).toBeNull();
  });
});
