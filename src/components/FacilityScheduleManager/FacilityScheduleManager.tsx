import {
	type ComponentProps,
	useCallback,
	useEffect,
	useMemo,
	useRef,
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
		events: contextEvents,
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
	// biome-ignore lint/correctness/useExhaustiveDependencies: contextEvents is used as a trigger for data refresh
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
	}, [
		currentDate,
		viewMode,
		fetchResourceAvailability,
		personnel,
		contextEvents,
	]);

	// Initial fetch and on view/date/event change
	useEffect(() => {
		fetchData();
	}, [fetchData]);

	// Merge context events with local transformed events (to ensure colors and extra info)
	const displayEvents = useMemo(() => {
		// Use Map to deduplicate by ID, preferring local transformed events for colors
		const eventMap = new Map<string, ScheduleEvent>();

		// 1. Add events from context
		for (const e of contextEvents) {
			eventMap.set(e.id, e);
		}

		// 2. Override with localEvents (which have colors assigned by transformBookingsToEvents)
		// and ensure they belong to the correct groupId/resourceId
		for (const le of localEvents) {
			const existing = eventMap.get(le.id);
			if (existing) {
				eventMap.set(le.id, {
					...existing,
					color: le.color || existing.color,
					groupId: le.groupId || existing.groupId,
				} as ScheduleEvent);
			} else {
				eventMap.set(le.id, le);
			}
		}

		return Array.from(eventMap.values());
	}, [contextEvents, localEvents]);

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
				// context update will trigger fetchData via useEffect
			} catch (e) {
				console.error("Failed to save event", e);
			}
		},
		[createEvent, effectiveUserId],
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
				// context update will trigger fetchData via useEffect
			} catch (e) {
				console.error("Failed to update event", e);
			}
		},
		[updateEvent],
	);

	const handleDelete = useCallback(
		async (id: string) => {
			try {
				await deleteEvent(id);
				// context update will trigger fetchData via useEffect
			} catch (e) {
				console.error("Failed to delete event", e);
			}
		},
		[deleteEvent],
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

	// Stable wrapper to avoid remounting the modal
	// We pass the data-dependent parts as simple props if possible,
	// but since FacilitySchedule doesn't support them all, we use a ref-based approach or context.
	// For now, let's keep it simple: Define the component once and use a ref for the changing data.
	const modalDataRef = useRef({
		effectiveUserId,
		personnel,
		resourceAvailability,
		onAvailabilityRequest: handleAvailabilityRequest,
	});

	useEffect(() => {
		modalDataRef.current = {
			effectiveUserId,
			personnel,
			resourceAvailability,
			onAvailabilityRequest: handleAvailabilityRequest,
		};
	}, [
		effectiveUserId,
		personnel,
		resourceAvailability,
		handleAvailabilityRequest,
	]);

	const EventModalComponent = useMemo(
		() => (props: ComponentProps<typeof EventModal>) => (
			<EventModal
				{...props}
				currentUserId={modalDataRef.current.effectiveUserId}
				personnel={modalDataRef.current.personnel}
				readOnlyResource={true}
				resourceAvailability={modalDataRef.current.resourceAvailability}
				onAvailabilityRequest={modalDataRef.current.onAvailabilityRequest}
			/>
		),
		[], // Identity stable
	);

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
			events={displayEvents}
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
				EventModal: EventModalComponent,
			}}
			enablePersistence={enablePersistence}
		/>
	);
}
