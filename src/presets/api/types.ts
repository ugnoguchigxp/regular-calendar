import type {
    FacilityScheduleSettings,
    Resource,
    ResourceGroup,
    ScheduleEvent
} from '../../FacilitySchedule/FacilitySchedule.schema';
import type { Personnel } from '../../PersonnelPanel/PersonnelPanel.schema';
import type { ResourceAvailabilityResponse } from '../utils/transformBookings';

/**
 * Configuration response from API
 */
export interface ConfigResponse {
    groups: ResourceGroup[];
    resources: Resource[];
    settings: FacilityScheduleSettings;
}

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
    extendedProps?: Record<string, any>;
}

/**
 * Resource availability request parameters
 */
export interface ResourceAvailabilityParams {
    date: Date;
    view: 'day' | 'week' | 'month';
}

/**
 * API Client interface for schedule operations
 * This interface allows for easy mocking in tests
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
    getResourceAvailability(params: ResourceAvailabilityParams): Promise<ResourceAvailabilityResponse[]>;
}
