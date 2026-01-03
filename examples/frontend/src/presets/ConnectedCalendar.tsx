import { useState } from "react";
import {
	RegularCalendar,
	RegularCalendarSchema,
	type ScheduleEvent,
} from "regular-calendar";
import { ConnectedEventModal } from "./ConnectedEventModal";
import type { EventFormData } from "./hooks/useEventForm";
import { useScheduleContext } from "./ScheduleContext";
import { cleanEventId, mergeEvents } from "./utils";

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
	} = useScheduleContext();

	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | undefined>(
		undefined,
	);
	const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

	// Merge all events using utility function
	const allEvents = mergeEvents(events, additionalEvents);

	if (error) return <div className="p-4 text-red-500">Error: {error}</div>;
	if (!apiSettings || loading)
		return <div className="p-4">Loading schedule data...</div>;

	// Merge API settings with local settings
	const mergedSettings = {
		...apiSettings,
		defaultDuration: 30,
		weekStartsOn: settings.weekStartsOn,
		startTime: settings.businessHoursStart,
		endTime: settings.businessHoursEnd,
		timeZone: settings.timeZone,
	};
	const calendarEvents =
		allEvents as unknown as RegularCalendarSchema.ScheduleEvent[];
	const calendarSettings =
		mergedSettings as unknown as RegularCalendarSchema.FacilityScheduleSettings;

	const handleTimeSlotClick = (date: Date) => {
		setSelectedDate(date);
		setSelectedEvent(undefined);
		setIsModalOpen(true);
	};

	const handleEventClick = (event: ScheduleEvent) => {
		// Restore real ID using utility function
		const cleanEvent = cleanEventId(event);
		setSelectedEvent(cleanEvent);
		setSelectedDate(undefined);
		setIsModalOpen(true);
	};

	const handleClose = () => {
		setIsModalOpen(false);
		setSelectedEvent(undefined);
		setSelectedDate(undefined);
	};

	const handleSave = async (data: EventFormData) => {
		try {
			if (selectedEvent) {
				await updateEvent(selectedEvent.id, data);
			} else {
				await createEvent(data);
			}
			handleClose();
		} catch (e) {
			console.error("Failed to save event", e);
		}
	};

	const handleDelete = async () => {
		if (selectedEvent) {
			try {
				await deleteEvent(selectedEvent.id);
				handleClose();
			} catch (e) {
				console.error("Failed to delete event", e);
			}
		}
	};

	return (
		<>
			<RegularCalendar
				events={calendarEvents}
				settings={calendarSettings}
				isLoading={loading}
				onEventClick={handleEventClick}
				onTimeSlotClick={handleTimeSlotClick}
				onDateClick={handleTimeSlotClick}
				enablePersistence={true}
				defaultView="week"
				storageKey="regular-calendar-demo-view"
			/>

			<ConnectedEventModal
				isOpen={isModalOpen}
				onClose={handleClose}
				onSave={handleSave}
				onDelete={handleDelete}
				event={selectedEvent}
				defaultStartTime={selectedDate}
				resources={resources}
				groups={groups}
				events={events}
				currentUserId={currentUserId}
			/>
		</>
	);
}
