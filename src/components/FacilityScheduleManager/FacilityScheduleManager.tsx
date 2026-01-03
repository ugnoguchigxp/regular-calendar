import {
	type ComponentProps,
	useCallback,
	useEffect,
	useMemo,
	useState,
} from "react";
import { useScheduleContext } from "../../contexts/ScheduleContext";
import type { ResourceAvailabilityResponse } from "../../contexts/types";
import { FacilitySchedule } from "../../FacilitySchedule/FacilitySchedule";
import type {
	EventFormData,
	ScheduleEvent,
	ViewMode,
} from "../../FacilitySchedule/FacilitySchedule.schema";
import { transformBookingsToEvents } from "../../utils/transformHelpers";
import { EventModal } from "../EventModal/EventModal";

export interface FacilityScheduleManagerSettings {
	weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6;
	businessHoursStart: string;
	businessHoursEnd: string;
	[key: string]: unknown;
}

export interface FacilityScheduleManagerProps {
	settings: FacilityScheduleManagerSettings;
	currentUserId?: string;
	enablePersistence?: boolean;
}

export function FacilityScheduleManager({
	settings,
	currentUserId,
	enablePersistence = true,
}: FacilityScheduleManagerProps) {
	const {
		resources,
		groups,
		settings: apiSettings,
		loading,
		error,
		createEvent,
		updateEvent,
		deleteEvent,
		fetchResourceAvailability,
		personnel,
	} = useScheduleContext();

	// Use provided currentUserId or fallback to first personnel
	const effectiveUserId = currentUserId || personnel?.[0]?.id;

	// Local state for FacilitySchedule (Controlled Mode)
	const [currentDate, setCurrentDate] = useState(new Date());
	const [viewMode, setViewMode] = useState<ViewMode>("day");
	const [localEvents, setLocalEvents] = useState<ScheduleEvent[]>([]);
	const [isFetching, setIsFetching] = useState(false);
	const [resourceAvailability, setResourceAvailability] = useState<
		{ resourceId: string; isAvailable: boolean }[]
	>([]);

	// Fetch data based on current view
	const fetchData = useCallback(async () => {
		setIsFetching(true);
		try {
			const availability = await fetchResourceAvailability(
				currentDate,
				viewMode,
			);

			// Use extracted utility function for transformation
			const flattenedEvents = transformBookingsToEvents(
				availability as ResourceAvailabilityResponse[],
				personnel,
			);

			console.log(
				`[FacilityScheduleManager] Loaded ${flattenedEvents.length} events for ${viewMode} view`,
			);
			setLocalEvents(flattenedEvents);
		} catch (err) {
			console.error("Failed to fetch data", err);
		} finally {
			setIsFetching(false);
		}
	}, [currentDate, viewMode, fetchResourceAvailability, personnel]);

	// Initial fetch and on view/date change
	useEffect(() => {
		fetchData();
	}, [fetchData]);

	const handleCreate = useCallback(
		async (data: EventFormData) => {
			// EventFormData from schema has Date objects for startDate/endDate
			const enhancedData = {
				title: data.title,
				attendee: data.attendee,
				// resourceId is optional in EventFormData but might be needed by API.
				// We handle undefined by defaulting to empty string if needed or letting API handle it.
				resourceId: data.resourceId || undefined,
				startDate: data.startDate,
				endDate: data.endDate,
				status: data.status,
				note: data.note,
				isAllDay: data.isAllDay,
				extendedProps: {
					...(data.extendedProps || {}),
					ownerId: effectiveUserId,
				},
			};

			try {
				await createEvent(enhancedData);
				fetchData();
			} catch (e) {
				console.error("Failed to save event", e);
			}
		},
		[createEvent, effectiveUserId, fetchData],
	);

	const handleUpdate = useCallback(
		async (id: string, data: EventFormData) => {
			const updateData = {
				title: data.title,
				attendee: data.attendee,
				resourceId: data.resourceId || undefined,
				startDate: data.startDate,
				endDate: data.endDate,
				status: data.status,
				note: data.note,
				isAllDay: data.isAllDay,
				extendedProps: {
					...(data.extendedProps || {}),
				},
			};

			try {
				await updateEvent(id, updateData);
				fetchData();
			} catch (e) {
				console.error("Failed to update event", e);
			}
		},
		[updateEvent, fetchData],
	);

	const handleDelete = useCallback(
		async (id: string) => {
			try {
				await deleteEvent(id);
				fetchData();
			} catch (e) {
				console.error("Failed to delete event", e);
			}
		},
		[deleteEvent, fetchData],
	);

	const handleAvailabilityRequest = useCallback(
		async (criteria: { startDate: Date; endDate: Date }) => {
			// In DayView, we want to check availability for the specific time range.
			// fetchResourceAvailability is designed to fetch for a whole view,
			// but we can use it to get latest status.
			try {
				const results = await fetchResourceAvailability(
					criteria.startDate,
					"day",
				);
				setResourceAvailability(
					results.map((r) => ({
						resourceId: r.resourceId,
						isAvailable: r.isAvailable,
					})),
				);
			} catch (err) {
				console.error("Failed to fetch specific availability", err);
			}
		},
		[fetchResourceAvailability],
	);

	// Wrap Standard EventModal
	const WrappedEventModal = useMemo(() => {
		return (props: ComponentProps<typeof EventModal>) => (
			<EventModal
				{...props}
				currentUserId={effectiveUserId}
				personnel={personnel}
				readOnlyResource={true}
				resourceAvailability={resourceAvailability}
				onAvailabilityRequest={handleAvailabilityRequest}
			/>
		);
	}, [
		effectiveUserId,
		personnel,
		resourceAvailability,
		handleAvailabilityRequest,
	]);

	if (error)
		return (
			<div className="p-[var(--ui-space-4)] text-red-500">Error: {error}</div>
		);
	if (!apiSettings || loading)
		return (
			<div className="p-[var(--ui-space-4)]">Loading schedule data...</div>
		);

	// Merge API settings with local settings
	const mergedSettings = {
		// Use API settings as base, then override with local props
		...apiSettings,
		weekStartsOn: settings.weekStartsOn ?? apiSettings.weekStartsOn,
		startTime: settings.businessHoursStart ?? apiSettings.startTime,
		endTime: settings.businessHoursEnd ?? apiSettings.endTime,
	};

	return (
		<FacilitySchedule
			events={localEvents}
			resources={resources}
			groups={groups}
			settings={mergedSettings}
			isLoading={loading || isFetching}
			currentDate={currentDate}
			viewMode={viewMode}
			onDateChange={setCurrentDate}
			onViewChange={setViewMode}
			onEventCreate={handleCreate}
			onEventUpdate={handleUpdate}
			onEventDelete={handleDelete}
			components={{
				EventModal: WrappedEventModal,
			}}
			enablePersistence={enablePersistence}
		/>
	);
}
