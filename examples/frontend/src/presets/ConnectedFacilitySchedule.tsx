import {
	type ComponentProps,
	useCallback,
	useEffect,
	useMemo,
	useState,
} from "react";
import {
	EventModal,
	FacilitySchedule,
	type EventFormData,
	type ScheduleEvent,
	type ViewMode,
} from "regular-calendar";
import { useScheduleContext } from "./ScheduleContext";
import {
	type ResourceAvailabilityResponse,
	transformBookingsToEvents,
} from "./utils/transformBookings";

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

export function ConnectedFacilitySchedule({
	settings,
	currentUserId,
}: ConnectedFacilityScheduleProps) {
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

	// Fetch data based on current view
	const fetchData = useCallback(async () => {
		setIsFetching(true);
		try {
			const availability = (await fetchResourceAvailability(
				currentDate,
				viewMode,
			)) as unknown as ResourceAvailabilityResponse[];

			// Use extracted utility function for transformation
			const flattenedEvents = transformBookingsToEvents(
				availability,
				personnel,
			);

			console.log(
				`[ConnectedFacilitySchedule] Loaded ${flattenedEvents.length} events for ${viewMode} view`,
			);
			setLocalEvents(flattenedEvents);
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
			const enhancedData = {
				...data,
				extendedProps: {
					...(data.extendedProps || {}),
					ownerId: effectiveUserId,
				},
			};
			await createEvent(enhancedData);
			fetchData();
		},
		[createEvent, effectiveUserId, fetchData],
	);

	const handleUpdate = useCallback(
		async (id: string, data: EventFormData) => {
			await updateEvent(id, data);
			fetchData();
		},
		[updateEvent, fetchData],
	);

	const handleDelete = useCallback(
		async (id: string) => {
			await deleteEvent(id);
			fetchData();
		},
		[deleteEvent, fetchData],
	);

	// Wrap Standard EventModal
	const WrappedEventModal = useMemo(() => {
		return (props: ComponentProps<typeof EventModal>) => (
			<EventModal
				{...props}
				currentUserId={effectiveUserId}
				personnel={personnel}
				readOnlyResource={true}
			/>
		);
	}, [effectiveUserId, personnel]);

	if (error) return <div className="p-4 text-red-500">Error: {error}</div>;
	if (!apiSettings || loading)
		return <div className="p-4">Loading schedule data...</div>;

	// Merge API settings with local settings
	const mergedSettings = {
		...apiSettings,
		weekStartsOn: settings.weekStartsOn,
		startTime: settings.businessHoursStart,
		endTime: settings.businessHoursEnd,
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
		/>
	);
}
