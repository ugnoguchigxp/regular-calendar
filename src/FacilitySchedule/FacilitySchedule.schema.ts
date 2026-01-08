import type React from "react";
import { z } from "zod";
import type { Personnel } from "../PersonnelPanel/PersonnelPanel.schema";
export type { Personnel };

// ==========================================
// Field Schemas
// ==========================================

export const ViewModeSchema = z.enum(["day", "week", "month"]);

export const AttendeeInfoSchema = z.object({
	name: z.string(),
	email: z.string().optional(),
	personnelId: z.string().optional(),
	type: z.enum(["personnel", "external"]).default("external"),
});

// Custom Fields
export interface CustomField {
	name: string;
	label: string;
	type:
		| "text"
		| "textarea"
		| "number"
		| "date"
		| "select"
		| "boolean"
		| "checkbox";
	options?: { label: string; value: string }[]; // For select
	required?: boolean;
	defaultValue?: unknown;
	placeholder?: string;
}

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
	extendedProps: z.record(z.string(), z.unknown()).optional(),

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
	displayMode: z.enum(["grid", "list"]),
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
	weekStartsOn: z.union([
		z.literal(0),
		z.literal(1),
		z.literal(2),
		z.literal(3),
		z.literal(4),
		z.literal(5),
		z.literal(6),
	]),
	timeZone: z.string().optional(),

	// Time slots
	timeSlots: z.array(TimeSlotSchema).optional(),

	// Pagination
	paginationEnabled: z.boolean().optional(),
	paginationPageSize: z.number().optional(),
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
	conflictType: "double-booking" | "overlap";
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
	durationHours: number;
	status?: string;
	note?: string;
	isAllDay?: boolean;
	notes?: string;
	description?: string;
	color?: string;
	[key: string]: unknown;
}

export interface EventModalComponentProps {
	isOpen: boolean;
	event?: ScheduleEvent;
	resources: Resource[];
	groups: ResourceGroup[];
	events: ScheduleEvent[];
	personnel?: Personnel[];
	resourceAvailability?: { resourceId: string; isAvailable: boolean }[];
	defaultResourceId?: string;
	defaultStartTime?: Date;
	readOnlyResource?: boolean;
	onClose: () => void;
	onSave: (data: EventFormData) => void;
	onDelete?: (eventId: string) => void;
	currentUserId?: string;
	customFields?: CustomField[];
}

export interface EventCardComponentProps {
	event: ScheduleEvent;
	viewMode: ViewMode;
	isCompact?: boolean;
	onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
	className?: string;
	style?: React.CSSProperties;
}

export interface FacilityScheduleProps {
	// Data
	events: ScheduleEvent[];
	resources: Resource[];
	groups: ResourceGroup[];
	settings: FacilityScheduleSettings;
	customFields?: CustomField[];

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
		EventModal?: React.ComponentType<EventModalComponentProps>;
		EventCard?: React.ComponentType<EventCardComponentProps>;
	};

	// Custom header slots
	headerLeft?: React.ReactNode;
	headerRight?: React.ReactNode;

	// Persistence & Defaults
	defaultView?: ViewMode;
	enablePersistence?: boolean;
	storageKey?: string;

	// Pagination
	pagination?: PaginationOptions;
}

export const PaginationOptionsSchema = z.object({
	enabled: z.boolean().default(false),
	pageSize: z.number().default(8),
});

export type PaginationOptions = z.infer<typeof PaginationOptionsSchema>;

export type ViewMode = z.infer<typeof ViewModeSchema>;
export type AttendeeInfo = z.infer<typeof AttendeeInfoSchema>;
export type ScheduleEvent = z.infer<typeof ScheduleEventSchema>;
export type Resource = z.infer<typeof ResourceSchema>;
export type ResourceGroup = z.infer<typeof ResourceGroupSchema>;
export type TimeSlot = z.infer<typeof TimeSlotSchema>;
export type FacilityScheduleSettings = z.infer<
	typeof FacilityScheduleSettingsSchema
>;
export type DensityData = z.infer<typeof DensityDataSchema>;
