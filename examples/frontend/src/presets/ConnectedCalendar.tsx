import { useMemo } from "react";
import { ScheduleManager, type ScheduleEvent } from "regular-calendar";
import { useScheduleContext } from "./ScheduleContext";
import { mergeEvents } from "./utils";

interface ConnectedCalendarProps {
	settings: {
		weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6;
		businessHoursStart: string;
		businessHoursEnd: string;
		timeZone: string;
		[key: string]: unknown;
	};
	additionalEvents?: ScheduleEvent[];
	currentUserId?: string;
}

export function ConnectedCalendar({
	settings,
	additionalEvents = [],
	currentUserId,
}: ConnectedCalendarProps) {
	const {
		events,
		resources,
		groups,
		settings: apiSettings,
		loading,
		error,
		createEvent,
		updateEvent,
		deleteEvent,
		personnel,
	} = useScheduleContext();

	const allEvents = useMemo(
		() => mergeEvents(events, additionalEvents),
		[events, additionalEvents]
	);

	const mergedSettings = useMemo(() => ({
		...apiSettings,
		defaultDuration: 30,
		weekStartsOn: settings.weekStartsOn,
		startTime: settings.businessHoursStart,
		endTime: settings.businessHoursEnd,
		businessHoursStart: settings.businessHoursStart,
		businessHoursEnd: settings.businessHoursEnd,
		timeZone: settings.timeZone,
	}), [apiSettings, settings]);

	if (error) return <div className="p-[var(--ui-space-4)] text-red-500">Error: {error}</div>;
	if (!apiSettings || loading)
		return <div className="p-[var(--ui-space-4)]">Loading schedule data...</div>;

	const handleUpdate = async (id: string, data: any) => {
		// Restore real ID from event if needed (recurrence logic, etc.)
		// We try to find the event and check for realId property
		const event = allEvents.find((e) => e.id === id);
		const realId = (event?.extendedProps?.realId as string) || id;
		await updateEvent(realId, data);
	};

	const handleDelete = async (id: string) => {
		const event = allEvents.find((e) => e.id === id);
		const realId = (event?.extendedProps?.realId as string) || id;
		await deleteEvent(realId);
	};

	return (
		<ScheduleManager
			events={allEvents}
			resources={resources}
			groups={groups}
			settings={mergedSettings}
			isLoading={loading}
			onEventCreate={createEvent}
			onEventUpdate={handleUpdate}
			onEventDelete={handleDelete}
			currentUserId={currentUserId}
			personnel={personnel}
		/>
	);
}
