import { z } from 'zod';

// ==========================================
// Field Schemas
// ==========================================

export const ViewModeSchema = z.enum(['day', 'week', 'month']);

export const AttendeeInfoSchema = z.object({
  name: z.string(),
  email: z.string().optional(),
  personnelId: z.string().optional(),
  type: z.enum(['personnel', 'external']).default('external'),
});

// ==========================================
// Entity Schemas
// ==========================================

export const ScheduleEventSchema = z.object({
  id: z.string(),
  resourceId: z.string().nullable().optional(), // Was positionId
  groupId: z.string(), // Was roomId
  title: z.string(), // Was patientName
  attendee: z.string(),
  startDate: z.date(),
  endDate: z.date(),
  status: z.string(), // Generic status
  description: z.string().optional(),
  note: z.string().optional(),
  color: z.string().optional(),
  isAllDay: z.boolean().optional(),

  // Extension for app-specific data
  extendedProps: z.record(z.string(), z.any()).optional(),

  // Legacy support or specific UI flags
  hasConflict: z.boolean().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const ScheduleEventArraySchema = z.array(ScheduleEventSchema);

export const ResourceSchema = z.object({
  id: z.string(),
  name: z.string(), // Was number/name
  order: z.number(),
  isAvailable: z.boolean(), // Was used
  groupId: z.string(), // Was roomId

  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().optional(),
});

export const ResourceGroupSchema = z.object({
  id: z.string(),
  name: z.string(),
  displayMode: z.enum(['grid', 'list']),
  dimension: z.number(), // grid size or list columns
  resources: z.array(ResourceSchema),

  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().optional(),
});

export const TimeSlotSchema = z.object({
  id: z.string().or(z.number()), // Allow string ID too
  label: z.string(),
  startTime: z.string(), // HH:mm
  endTime: z.string(), // HH:mm
});

export const FacilityScheduleSettingsSchema = z.object({
  // Basic settings
  defaultDuration: z.number(), // hours

  // Business hours
  startTime: z.string(), // HH:mm
  endTime: z.string(), // HH:mm

  // Holidays
  closedDays: z.array(z.number()), // 0=Sunday

  // Display
  weekStartsOn: z.union([z.literal(0), z.literal(1)]),
  timeZone: z.string().optional(),

  // Time slots
  timeSlots: z.array(TimeSlotSchema).optional(),
});

export const DensityDataSchema = z.object({
  date: z.date(),
  bookedCount: z.number(),
  maxSlots: z.number(),
  density: z.number(),
  isClosedDay: z.boolean(),
});

export interface ScheduleConflict {
  resourceId: string; // Was positionId
  existingSchedule: ScheduleEvent;
  newSchedule: Partial<ScheduleEvent>;
  conflictType: 'double-booking' | 'overlap';
}

// ==========================================
// Inferred Types
// ==========================================

export interface EventFormData {
  title: string;
  attendee: string;
  resourceId?: string;
  groupId?: string;
  startDate: Date;
  endDate: Date;
  isAllDay?: boolean;
  notes?: string;
  description?: string;
  color?: string;
  [key: string]: any;
}

export interface FacilityScheduleProps {
  // Data
  events: ScheduleEvent[];
  resources: Resource[];
  groups: ResourceGroup[];
  settings: FacilityScheduleSettings;

  // State (controlled)
  currentDate?: Date;
  viewMode?: ViewMode;
  selectedGroupId?: string | null;

  // Actions
  onDateChange?: (date: Date) => void;
  onViewChange?: (view: ViewMode) => void;
  onGroupChange?: (groupId: string | null) => void;

  // CRUD Actions
  onEventCreate?: (data: EventFormData) => void;
  onEventUpdate?: (id: string, data: EventFormData) => void;
  onEventDelete?: (eventId: string) => void;

  // Customization
  isLoading?: boolean;
  className?: string;
  hideGroupSelector?: boolean;

  /**
   * Custom components to override default internal components.
   */
  components?: {
    EventModal?: React.ComponentType<any>;
  };

  // Custom header slots
  headerLeft?: React.ReactNode;
  headerRight?: React.ReactNode;

  // Persistence & Defaults
  defaultView?: ViewMode;
  enablePersistence?: boolean;
  storageKey?: string;
}

export type ViewMode = z.infer<typeof ViewModeSchema>;
export type AttendeeInfo = z.infer<typeof AttendeeInfoSchema>;
export type ScheduleEvent = z.infer<typeof ScheduleEventSchema>;
export type Resource = z.infer<typeof ResourceSchema>;
export type ResourceGroup = z.infer<typeof ResourceGroupSchema>;
export type TimeSlot = z.infer<typeof TimeSlotSchema>;
export type FacilityScheduleSettings = z.infer<typeof FacilityScheduleSettingsSchema>;
export type DensityData = z.infer<typeof DensityDataSchema>;

