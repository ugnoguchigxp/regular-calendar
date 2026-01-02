import { describe, it, expect } from 'vitest';
import { useEventForm, useConflictCheck, useAvailableResources, useResourceDisplayNames, prepareEventFormData } from './useEventForm';
import { renderHook, act } from '@testing-library/react';
import type { ScheduleEvent, Resource, ResourceGroup } from '../../FacilitySchedule/FacilitySchedule.schema';

describe('useEventForm', () => {
  const mockResources: Resource[] = [
    {
      id: 'resource-1',
      name: 'Resource 1',
      order: 1,
      isAvailable: true,
      groupId: 'group-1',
      createdAt: new Date('2025-01-01T00:00:00Z'),
      updatedAt: new Date('2025-01-01T00:00:00Z'),
    },
    {
      id: 'resource-2',
      name: 'Resource 2',
      order: 2,
      isAvailable: true,
      groupId: 'group-1',
      createdAt: new Date('2025-01-01T00:00:00Z'),
      updatedAt: new Date('2025-01-01T00:00:00Z'),
    },
  ];

  const mockEvent: ScheduleEvent = {
    id: 'event-1',
    resourceId: 'resource-1',
    groupId: 'group-1',
    title: 'Test Event',
    attendee: 'John Doe',
    startDate: new Date('2025-01-01T10:00:00Z'),
    endDate: new Date('2025-01-01T11:00:00Z'),
    status: 'confirmed',
    createdAt: new Date('2025-01-01T00:00:00Z'),
    updatedAt: new Date('2025-01-01T00:00:00Z'),
  };

  it('initializes form with default values for new event', () => {
    const { result } = renderHook(() =>
      useEventForm({
        resources: mockResources,
      }),
    );

    expect(result.current.isEditMode).toBe(false);
    expect(result.current.form.getValues('title')).toBe('');
    expect(result.current.form.getValues('attendee')).toBe('');
    expect(result.current.durationVal).toBe(1);
    expect(result.current.isAllDay).toBe(false);
  });

  it('initializes form with event values for edit mode', () => {
    const { result } = renderHook(() =>
      useEventForm({
        event: mockEvent,
        resources: mockResources,
      }),
    );

    expect(result.current.isEditMode).toBe(true);
    expect(result.current.form.getValues('title')).toBe('Test Event');
    expect(result.current.form.getValues('attendee')).toBe('John Doe');
    expect(result.current.form.getValues('resourceId')).toBe('resource-1');
    expect(result.current.durationVal).toBe(1);
  });

  it('uses defaultResourceId if provided', () => {
    const { result } = renderHook(() =>
      useEventForm({
        defaultResourceId: 'resource-2',
        resources: mockResources,
      }),
    );

    expect(result.current.form.getValues('resourceId')).toBe('resource-2');
  });

  it('uses first resource if no default is provided', () => {
    const { result } = renderHook(() =>
      useEventForm({
        resources: mockResources,
      }),
    );

    expect(result.current.form.getValues('resourceId')).toBe('resource-1');
  });

  it('calculates endDateDisplay correctly', () => {
    const { result } = renderHook(() =>
      useEventForm({
        resources: mockResources,
      }),
    );

    const startDateVal = '2025-01-01T10:00:00';
    const durationVal = 2;

    act(() => {
      result.current.form.setValue('startDate', startDateVal);
      result.current.form.setValue('durationHours', durationVal);
    });

    const startDate = result.current.startDateVal;
    const duration = result.current.durationVal;

    const start = new Date(startDate);
    const minutes = duration * 60;
    const expectedEnd = new Date(start.getTime() + minutes * 60000);

    expect(result.current.endDateDisplay).toEqual(expectedEnd);
  });

  it('handles isAllDay correctly', () => {
    const { result } = renderHook(() =>
      useEventForm({
        event: { ...mockEvent, isAllDay: true },
        resources: mockResources,
      }),
    );

    expect(result.current.isAllDay).toBe(true);
  });
});

describe('useConflictCheck', () => {
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
  ];

  it('detects conflict', () => {
    const { result } = renderHook(() =>
      useConflictCheck('2025-01-01T10:30:00Z', 0.5, 'resource-1', mockEvents),
    );

    expect(result.current).not.toBeNull();
  });

  it('returns null when no conflict', () => {
    const { result } = renderHook(() =>
      useConflictCheck('2025-01-01T12:00:00', 1, 'resource-1', mockEvents),
    );

    expect(result.current).toBeNull();
  });

  it('returns null for invalid date', () => {
    const { result } = renderHook(() =>
      useConflictCheck('invalid-date', 1, 'resource-1', mockEvents),
    );

    expect(result.current).toBeNull();
  });

  it('excludes current event from conflict check', () => {
    const { result } = renderHook(() =>
      useConflictCheck('2025-01-01T10:00:00', 1, 'resource-1', mockEvents, 'event-1'),
    );

    expect(result.current).toBeNull();
  });
});

describe('useAvailableResources', () => {
  const mockResources: Resource[] = [
    {
      id: 'resource-1',
      name: 'Resource 1',
      order: 1,
      isAvailable: true,
      groupId: 'group-1',
      createdAt: new Date('2025-01-01T00:00:00Z'),
      updatedAt: new Date('2025-01-01T00:00:00Z'),
    },
    {
      id: 'resource-2',
      name: 'Resource 2',
      order: 2,
      isAvailable: true,
      groupId: 'group-1',
      createdAt: new Date('2025-01-01T00:00:00Z'),
      updatedAt: new Date('2025-01-01T00:00:00Z'),
    },
  ];

  it('filters resources by availability', () => {
    const availability = [
      { resourceId: 'resource-1', isAvailable: false },
      { resourceId: 'resource-2', isAvailable: true },
    ];

    const { result } = renderHook(() =>
      useAvailableResources(mockResources, availability),
    );

    expect(result.current).toHaveLength(1);
    expect(result.current[0].id).toBe('resource-2');
  });

  it('returns all resources if availability data is missing', () => {
    const availability = [
      { resourceId: 'resource-1', isAvailable: true },
    ];

    const { result } = renderHook(() =>
      useAvailableResources(mockResources, availability),
    );

    expect(result.current).toHaveLength(2);
  });
});

describe('useResourceDisplayNames', () => {
  const mockResources: Resource[] = [
    {
      id: 'resource-1',
      name: 'Resource 1',
      order: 1,
      isAvailable: true,
      groupId: 'group-1',
      createdAt: new Date('2025-01-01T00:00:00Z'),
      updatedAt: new Date('2025-01-01T00:00:00Z'),
    },
    {
      id: 'resource-2',
      name: 'Resource 2',
      order: 2,
      isAvailable: true,
      groupId: 'group-2',
      createdAt: new Date('2025-01-01T00:00:00Z'),
      updatedAt: new Date('2025-01-01T00:00:00Z'),
    },
  ];

  const mockGroups: ResourceGroup[] = [
    {
      id: 'group-1',
      name: 'Group 1',
      displayMode: 'grid',
      dimension: 2,
      resources: [],
      createdAt: new Date('2025-01-01T00:00:00Z'),
      updatedAt: new Date('2025-01-01T00:00:00Z'),
    },
    {
      id: 'group-2',
      name: 'Group 2',
      displayMode: 'list',
      dimension: 1,
      resources: [],
      createdAt: new Date('2025-01-01T00:00:00Z'),
      updatedAt: new Date('2025-01-01T00:00:00Z'),
    },
  ];

  it('generates display names with group names', () => {
    const { result } = renderHook(() =>
      useResourceDisplayNames(mockResources, mockGroups),
    );

    expect(result.current.get('resource-1')).toBe('Resource 1 (Group 1)');
    expect(result.current.get('resource-2')).toBe('Resource 2 (Group 2)');
  });

  it('returns resource name without group if group not found', () => {
    const { result } = renderHook(() =>
      useResourceDisplayNames(mockResources, []),
    );

    expect(result.current.get('resource-1')).toBe('Resource 1');
  });
});

describe('prepareEventFormData', () => {
  const mockEvent: ScheduleEvent = {
    id: 'event-1',
    resourceId: 'resource-1',
    groupId: 'group-1',
    title: 'Test Event',
    attendee: 'John Doe',
    startDate: new Date('2025-01-01T10:00:00Z'),
    endDate: new Date('2025-01-01T11:00:00Z'),
    status: 'confirmed',
    createdAt: new Date('2025-01-01T00:00:00Z'),
    updatedAt: new Date('2025-01-01T00:00:00Z'),
    extendedProps: {
      usage: 'Meeting',
      ownerId: 'user-1',
    },
  };

  it('prepares form data for new event', () => {
    const formValues = {
      title: 'New Event',
      attendee: 'Jane Smith',
      resourceId: 'resource-1',
      startDate: '2025-01-01T10:00:00',
      durationHours: 2,
      status: 'booked',
      usage: 'Consultation',
    };

    const result = prepareEventFormData(formValues, undefined, 'user-2');

    expect(result.title).toBe('New Event');
    expect(result.startDate).toBeInstanceOf(Date);
    expect(result.endDate).toBeInstanceOf(Date);
    expect(result.extendedProps?.usage).toBe('Consultation');
    expect(result.extendedProps?.ownerId).toBe('user-2');
  });

  it('prepares form data for existing event', () => {
    const formValues = {
      title: 'Updated Event',
      attendee: 'John Doe',
      resourceId: 'resource-1',
      startDate: '2025-01-01T10:00:00',
      durationHours: 1.5,
      status: 'confirmed',
      usage: 'Updated',
    };

    const result = prepareEventFormData(formValues, mockEvent);

    expect(result.extendedProps?.usage).toBe('Updated');
    expect(result.extendedProps?.ownerId).toBe('user-1');
  });

  it('sets isAllDay time to midnight', () => {
    const formValues = {
      title: 'All Day Event',
      attendee: 'John Doe',
      resourceId: 'resource-1',
      startDate: '2025-01-01T15:00:00',
      durationHours: 8,
      isAllDay: true,
    };

    const result = prepareEventFormData(formValues, undefined);

    expect(result.startDate.getHours()).toBe(0);
    expect(result.startDate.getMinutes()).toBe(0);
  });
});
