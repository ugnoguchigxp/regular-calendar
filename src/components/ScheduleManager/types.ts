import type {
	CustomField,
	Resource,
	ResourceGroup,
	ScheduleEvent,
} from "../../FacilitySchedule/FacilitySchedule.schema";
export type { CustomField };

export interface CustomFieldOption {
	value: string;
	label: string;
}

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
	onEventCreate: (data: Record<string, unknown>) => Promise<void>;
	onEventUpdate: (
		eventId: string,
		data: Record<string, unknown>,
	) => Promise<void>;
	onEventDelete: (eventId: string) => Promise<void>;
	onToast?: (message: string, type: "success" | "error") => void;
	customFields?: CustomField[];
	currentUserId?: string;
	i18n?: {
		locale?: string;
		// Add more i18n options as needed
	};
}
