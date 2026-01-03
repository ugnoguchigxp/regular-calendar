import type { Resource, ResourceGroup, ScheduleEvent } from "../../types";

export interface CustomFieldOption {
    value: string;
    label: string;
}

export interface CustomField {
    name: string;
    label: string;
    type: "text" | "textarea" | "select" | "checkbox" | "number";
    options?: CustomFieldOption[]; // For select type
    required?: boolean;
    defaultValue?: unknown;
    placeholder?: string;
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
    onEventCreate: (data: any) => Promise<void>;
    onEventUpdate: (eventId: string, data: any) => Promise<void>;
    onEventDelete: (eventId: string) => Promise<void>;
    onToast?: (message: string, type: "success" | "error") => void;
    customFields?: CustomField[];
    currentUserId?: string;
    i18n?: {
        locale?: string;
        // Add more i18n options as needed
    };
}
