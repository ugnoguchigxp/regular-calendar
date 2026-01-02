import { describe, it, expect } from 'vitest';
import {
  ViewModeSchema,
  AttendeeInfoSchema,
  ScheduleEventSchema,
  ScheduleEventArraySchema,
  ResourceSchema,
  ResourceGroupSchema,
  TimeSlotSchema,
  FacilityScheduleSettingsSchema,
  DensityDataSchema,
} from './FacilitySchedule.schema';

describe('ViewModeSchema', () => {
  it('validates valid view modes', () => {
    expect(ViewModeSchema.parse('day')).toBe('day');
    expect(ViewModeSchema.parse('week')).toBe('week');
    expect(ViewModeSchema.parse('month')).toBe('month');
  });

  it('rejects invalid view modes', () => {
    expect(() => ViewModeSchema.parse('year')).toThrow();
    expect(() => ViewModeSchema.parse('')).toThrow();
    expect(() => ViewModeSchema.parse(undefined)).toThrow();
  });
});

describe('AttendeeInfoSchema', () => {
  it('validates attendee with required fields', () => {
    const result = AttendeeInfoSchema.parse({
      name: 'John Doe',
      type: 'personnel',
    });
    expect(result.name).toBe('John Doe');
    expect(result.type).toBe('personnel');
  });

  it('validates attendee with optional fields', () => {
    const result = AttendeeInfoSchema.parse({
      name: 'Jane Smith',
      email: 'jane@example.com',
      personnelId: '123',
      type: 'external',
    });
    expect(result.email).toBe('jane@example.com');
    expect(result.personnelId).toBe('123');
    expect(result.type).toBe('external');
  });

  it('defaults type to external', () => {
    const result = AttendeeInfoSchema.parse({
      name: 'John Doe',
    });
    expect(result.type).toBe('external');
  });

  it('rejects invalid types', () => {
    expect(() =>
      AttendeeInfoSchema.parse({
        name: 'John Doe',
        type: 'invalid',
      }),
    ).toThrow();
  });
});

describe('ScheduleEventSchema', () => {
  const baseEvent = {
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

  it('validates valid schedule event', () => {
    const result = ScheduleEventSchema.parse(baseEvent);
    expect(result.id).toBe('event-1');
  });

  it('validates with nullable resourceId', () => {
    const result = ScheduleEventSchema.parse({
      ...baseEvent,
      resourceId: null,
    });
    expect(result.resourceId).toBeNull();
  });

  it('validates with optional fields', () => {
    const result = ScheduleEventSchema.parse({
      ...baseEvent,
      description: 'Test description',
      note: 'Test note',
      color: '#ff0000',
      isAllDay: true,
      hasConflict: false,
      extendedProps: { customField: 'value' },
    });
    expect(result.description).toBe('Test description');
    expect(result.extendedProps).toEqual({ customField: 'value' });
  });

  it('rejects event without required fields', () => {
    expect(() => ScheduleEventSchema.parse({})).toThrow();
  });

  it('rejects invalid dates', () => {
    expect(() =>
      ScheduleEventSchema.parse({
        ...baseEvent,
        startDate: 'invalid',
      }),
    ).toThrow();
  });
});

describe('ScheduleEventArraySchema', () => {
  it('validates array of events', () => {
    const events = [
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
    const result = ScheduleEventArraySchema.parse(events);
    expect(result).toHaveLength(1);
  });

  it('validates empty array', () => {
    const result = ScheduleEventArraySchema.parse([]);
    expect(result).toHaveLength(0);
  });
});

describe('ResourceSchema', () => {
  const baseResource = {
    id: 'resource-1',
    name: 'Resource 1',
    order: 1,
    isAvailable: true,
    groupId: 'group-1',
    createdAt: new Date('2025-01-01T00:00:00Z'),
    updatedAt: new Date('2025-01-01T00:00:00Z'),
  };

  it('validates valid resource', () => {
    const result = ResourceSchema.parse(baseResource);
    expect(result.id).toBe('resource-1');
  });

  it('validates with deletedAt', () => {
    const result = ResourceSchema.parse({
      ...baseResource,
      deletedAt: new Date('2025-01-02T00:00:00Z'),
    });
    expect(result.deletedAt).toBeDefined();
  });

  it('rejects resource without required fields', () => {
    expect(() => ResourceSchema.parse({})).toThrow();
  });
});

describe('ResourceGroupSchema', () => {
  const baseGroup = {
    id: 'group-1',
    name: 'Group 1',
    displayMode: 'grid' as const,
    dimension: 3,
    resources: [],
    createdAt: new Date('2025-01-01T00:00:00Z'),
    updatedAt: new Date('2025-01-01T00:00:00Z'),
  };

  it('validates valid resource group', () => {
    const result = ResourceGroupSchema.parse(baseGroup);
    expect(result.id).toBe('group-1');
  });

  it('validates with list display mode', () => {
    const result = ResourceGroupSchema.parse({
      ...baseGroup,
      displayMode: 'list' as const,
    });
    expect(result.displayMode).toBe('list');
  });

  it('validates with resources', () => {
    const resources = [
      {
        id: 'resource-1',
        name: 'Resource 1',
        order: 1,
        isAvailable: true,
        groupId: 'group-1',
        createdAt: new Date('2025-01-01T00:00:00Z'),
        updatedAt: new Date('2025-01-01T00:00:00Z'),
      },
    ];
    const result = ResourceGroupSchema.parse({
      ...baseGroup,
      resources,
    });
    expect(result.resources).toHaveLength(1);
  });

  it('rejects invalid display mode', () => {
    expect(() =>
      ResourceGroupSchema.parse({
        ...baseGroup,
        displayMode: 'invalid',
      }),
    ).toThrow();
  });
});

describe('TimeSlotSchema', () => {
  const baseSlot = {
    id: 'slot-1',
    label: 'Morning',
    startTime: '09:00',
    endTime: '12:00',
  };

  it('validates time slot with string id', () => {
    const result = TimeSlotSchema.parse(baseSlot);
    expect(result.id).toBe('slot-1');
  });

  it('validates time slot with number id', () => {
    const result = TimeSlotSchema.parse({
      ...baseSlot,
      id: 1,
    });
    expect(result.id).toBe(1);
  });

  it('rejects time slot without required fields', () => {
    expect(() => TimeSlotSchema.parse({})).toThrow();
  });
});

describe('FacilityScheduleSettingsSchema', () => {
  const baseSettings = {
    defaultDuration: 1,
    startTime: '09:00',
    endTime: '18:00',
    closedDays: [0],
    weekStartsOn: 0,
  };

  it('validates valid settings', () => {
    const result = FacilityScheduleSettingsSchema.parse(baseSettings);
    expect(result.defaultDuration).toBe(1);
  });

  it('validates with weekStartsOn as 1', () => {
    const result = FacilityScheduleSettingsSchema.parse({
      ...baseSettings,
      weekStartsOn: 1,
    });
    expect(result.weekStartsOn).toBe(1);
  });

  it('validates with optional fields', () => {
    const result = FacilityScheduleSettingsSchema.parse({
      ...baseSettings,
      timeZone: 'Asia/Tokyo',
      timeSlots: [
        {
          id: 'slot-1',
          label: 'Morning',
          startTime: '09:00',
          endTime: '12:00',
        },
      ],
    });
    expect(result.timeZone).toBe('Asia/Tokyo');
    expect(result.timeSlots).toHaveLength(1);
  });

  it('rejects invalid weekStartsOn', () => {
    expect(() =>
      FacilityScheduleSettingsSchema.parse({
        ...baseSettings,
        weekStartsOn: 2,
      }),
    ).toThrow();
  });
});

describe('DensityDataSchema', () => {
  const baseDensity = {
    date: new Date('2025-01-01T00:00:00Z'),
    bookedCount: 5,
    maxSlots: 10,
    density: 0.5,
    isClosedDay: false,
  };

  it('validates valid density data', () => {
    const result = DensityDataSchema.parse(baseDensity);
    expect(result.bookedCount).toBe(5);
  });

  it('validates with isClosedDay true', () => {
    const result = DensityDataSchema.parse({
      ...baseDensity,
      isClosedDay: true,
    });
    expect(result.isClosedDay).toBe(true);
  });

  it('rejects density data without required fields', () => {
    expect(() => DensityDataSchema.parse({})).toThrow();
  });
});
