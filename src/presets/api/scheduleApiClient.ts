import type {
	Resource,
	ResourceGroup,
	ScheduleEvent,
} from "../../FacilitySchedule/FacilitySchedule.schema";
import type { Personnel } from "../../PersonnelPanel/PersonnelPanel.schema";
import type { ResourceAvailabilityResponse } from "../utils/transformBookings";
import type {
	ConfigResponse,
	EventData,
	ResourceAvailabilityParams,
	ScheduleApiClient,
} from "./types";

type ApiEvent = Omit<ScheduleEvent, "startDate" | "endDate"> & {
	startDate: string | Date;
	endDate: string | Date;
};

/**
 * Parse event dates from API response
 */
function parseEventDates(event: ApiEvent): ScheduleEvent {
	return {
		...event,
		startDate: new Date(event.startDate),
		endDate: new Date(event.endDate),
	};
}

/**
 * Create a Schedule API Client that communicates with the backend
 *
 * @param baseUrl - Base URL for API endpoints (e.g., '/api')
 * @returns ScheduleApiClient instance
 */
export function createScheduleApiClient(baseUrl: string): ScheduleApiClient {
	const getUrl = (path: string): string => {
		const base = baseUrl.replace(/\/$/, "");
		const endpoint = path.replace(/^\//, "");
		return `${base}/${endpoint}`;
	};

	const fetchJson = async <T>(
		url: string,
		options?: RequestInit,
	): Promise<T> => {
		const res = await fetch(url, {
			...options,
			headers: {
				"Content-Type": "application/json",
				...options?.headers,
			},
		});
		if (!res.ok) {
			throw new Error(`API error: ${res.status} ${res.statusText}`);
		}
		return res.json();
	};

	return {
		// Config
		async getConfig(): Promise<ConfigResponse> {
			return fetchJson<ConfigResponse>(getUrl("/config"));
		},

		// Events
		async getEvents(personnelIds?: string[]): Promise<ScheduleEvent[]> {
			let url = getUrl("/events");
			if (personnelIds && personnelIds.length > 0) {
				url += `?personnelIds=${personnelIds.join(",")}`;
			}
			const events = await fetchJson<ApiEvent[]>(url);
			return events.map(parseEventDates);
		},

		async createEvent(data: EventData): Promise<ScheduleEvent> {
			const event = await fetchJson<ApiEvent>(getUrl("/events"), {
				method: "POST",
				body: JSON.stringify(data),
			});
			return parseEventDates(event);
		},

		async updateEvent(
			id: string,
			data: Partial<EventData>,
		): Promise<ScheduleEvent> {
			const event = await fetchJson<ApiEvent>(getUrl(`/events/${id}`), {
				method: "PUT",
				body: JSON.stringify(data),
			});
			return parseEventDates(event);
		},

		async deleteEvent(id: string): Promise<void> {
			await fetch(getUrl(`/events/${id}`), { method: "DELETE" });
		},

		// Groups
		async createGroup(data: Partial<ResourceGroup>): Promise<ResourceGroup> {
			return fetchJson<ResourceGroup>(getUrl("/groups"), {
				method: "POST",
				body: JSON.stringify(data),
			});
		},

		async updateGroup(
			id: string,
			data: Partial<ResourceGroup>,
		): Promise<ResourceGroup> {
			return fetchJson<ResourceGroup>(getUrl(`/groups/${id}`), {
				method: "PUT",
				body: JSON.stringify(data),
			});
		},

		async deleteGroup(id: string): Promise<void> {
			await fetch(getUrl(`/groups/${id}`), { method: "DELETE" });
		},

		// Resources
		async createResource(data: Partial<Resource>): Promise<Resource> {
			return fetchJson<Resource>(getUrl("/resources"), {
				method: "POST",
				body: JSON.stringify(data),
			});
		},

		async updateResource(
			id: string,
			data: Partial<Resource>,
		): Promise<Resource> {
			return fetchJson<Resource>(getUrl(`/resources/${id}`), {
				method: "PUT",
				body: JSON.stringify(data),
			});
		},

		async deleteResource(id: string): Promise<void> {
			await fetch(getUrl(`/resources/${id}`), { method: "DELETE" });
		},

		// Personnel
		async getPersonnel(): Promise<Personnel[]> {
			return fetchJson<Personnel[]>(getUrl("/personnel"));
		},

		async updatePersonnelPriority(
			id: string,
			priority: number,
		): Promise<Personnel> {
			return fetchJson<Personnel>(getUrl(`/personnel/${id}`), {
				method: "PUT",
				body: JSON.stringify({ priority }),
			});
		},

		// Resource Availability
		async getResourceAvailability(
			params: ResourceAvailabilityParams,
		): Promise<ResourceAvailabilityResponse[]> {
			const { date, view } = params;
			const url = getUrl(
				`/resource-availability?date=${date.toISOString()}&view=${view}`,
			);
			const data = await fetchJson<{
				resources: ResourceAvailabilityResponse[];
			}>(url);
			return data.resources;
		},
	};
}
