import type {
	FacilityScheduleSettings,
	Personnel,
	Resource,
	ResourceGroup,
	ScheduleEvent,
} from "../FacilitySchedule/FacilitySchedule.schema";

/**
 * Event data for create/update operations
 */
export interface EventData {
	title: string;
	attendee?: string;
	resourceId?: string;
	startDate: Date;
	endDate: Date;
	status?: string;
	note?: string;
	isAllDay?: boolean;
	extendedProps?: Record<string, unknown>;
}

/**
 * Resource availability request parameters
 */
export interface ResourceAvailabilityParams {
	date: Date;
	view: "day" | "week" | "month";
}

/**
 * Booking data from resource availability API
 */
export interface BookingData {
	eventId: string;
	title: string;
	startDate: string;
	endDate: string;
	isAllDay: boolean;
	attendee: string;
	extendedProps?: string | Record<string, unknown>;
}

/**
 * Resource availability response from API
 */
export interface ResourceAvailabilityResponse {
	resourceId: string;
	resourceName: string;
	groupId: string;
	isAvailable: boolean;
	bookings: BookingData[];
}

/**
 * Configuration response from API
 */
export interface ConfigResponse {
	groups: ResourceGroup[];
	resources: Resource[];
	settings: FacilityScheduleSettings;
}

/**
 * API Client interface for schedule operations
 * This interface must be implemented by the consumer
 */
export interface ScheduleApiClient {
	// Config
	getConfig(): Promise<ConfigResponse>;

	// Events
	getEvents(personnelIds?: string[]): Promise<ScheduleEvent[]>;
	createEvent(data: EventData): Promise<ScheduleEvent>;
	updateEvent(id: string, data: Partial<EventData>): Promise<ScheduleEvent>;
	deleteEvent(id: string): Promise<void>;

	// Groups
	createGroup(data: Partial<ResourceGroup>): Promise<ResourceGroup>;
	updateGroup(id: string, data: Partial<ResourceGroup>): Promise<ResourceGroup>;
	deleteGroup(id: string): Promise<void>;

	// Resources
	createResource(data: Partial<Resource>): Promise<Resource>;
	updateResource(id: string, data: Partial<Resource>): Promise<Resource>;
	deleteResource(id: string): Promise<void>;

	// Personnel
	getPersonnel(): Promise<Personnel[]>;
	updatePersonnelPriority(id: string, priority: number): Promise<Personnel>;

	// Resource Availability
	getResourceAvailability(
		params: ResourceAvailabilityParams,
	): Promise<ResourceAvailabilityResponse[]>;
}

/**
 * Resource availability info type alias for use in context
 */
export type ContextResourceAvailability = ResourceAvailabilityResponse;

export interface ScheduleContextType {
	events: ScheduleEvent[];
	personnelEvents: ScheduleEvent[];
	resources: Resource[];
	groups: ResourceGroup[];
	settings: FacilityScheduleSettings | null;
	personnel: Personnel[];
	loading: boolean;
	error: string | null;

	createEvent: (data: EventData) => Promise<void>;
	updateEvent: (id: string, data: Partial<EventData>) => Promise<void>;
	deleteEvent: (id: string) => Promise<void>;

	createGroup: (data: Partial<ResourceGroup>) => Promise<ResourceGroup>;
	updateGroup: (
		id: string,
		data: Partial<ResourceGroup>,
	) => Promise<ResourceGroup>;
	deleteGroup: (id: string) => Promise<void>;

	createResource: (data: Partial<Resource>) => Promise<Resource>;
	updateResource: (id: string, data: Partial<Resource>) => Promise<Resource>;
	deleteResource: (id: string) => Promise<void>;

	updatePersonnelPriority: (id: string, priority: number) => Promise<void>;
	fetchPersonnelEvents: (
		personnelIds: string[],
		append?: boolean,
	) => Promise<void>;
	fetchResourceAvailability: (
		date: Date,
		view?: "day" | "week" | "month",
	) => Promise<ContextResourceAvailability[]>;
	getResourceAvailabilityFromCache: (
		date: Date,
		view?: "day" | "week" | "month",
	) => ContextResourceAvailability[] | undefined;
}
