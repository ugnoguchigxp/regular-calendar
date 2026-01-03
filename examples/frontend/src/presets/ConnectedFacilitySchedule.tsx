import { FacilityScheduleManager } from "regular-calendar";

interface ConnectedFacilityScheduleSettings {
	weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6;
	businessHoursStart: string;
	businessHoursEnd: string;
	[key: string]: unknown;
}

interface ConnectedFacilityScheduleProps {
	settings: ConnectedFacilityScheduleSettings;
	currentUserId?: string;
}

export function ConnectedFacilitySchedule(
	props: ConnectedFacilityScheduleProps,
) {
	return <FacilityScheduleManager {...props} />;
}
