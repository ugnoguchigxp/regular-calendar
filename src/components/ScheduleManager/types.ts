import type {
	CustomField,
	Personnel,
	Resource,
	ResourceGroup,
	ScheduleEvent,
} from "../../FacilitySchedule/FacilitySchedule.schema";
export type { CustomField };

import type { EventData } from "../../contexts/types";

export interface CustomFieldOption {
	value: string;
	label: string;
}

export interface ScheduleManagerProps {
	events: ScheduleEvent[];
	resources: Resource[];
	groups: ResourceGroup[];
	settings: {
		weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6;
		businessHoursStart: string;
		businessHoursEnd: string;
		timeZone: string;
		[key: string]: unknown;
	};
	isLoading?: boolean;
	onEventCreate: (data: EventData) => Promise<void>;
	onEventUpdate: (eventId: string, data: Partial<EventData>) => Promise<void>;
	onEventDelete: (eventId: string) => Promise<void>;
	onToast?: (message: string, type: "success" | "error") => void;
	customFields?: CustomField[];
	personnel?: Personnel[];
	currentUserId?: string;
	i18n?: {
		locale?: string;
		// Add more i18n options as needed
	};
}
