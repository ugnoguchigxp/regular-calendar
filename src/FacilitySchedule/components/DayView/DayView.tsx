/**
 * DayView - Day View Component
 */

import { useMemo } from "react";
import { DAY_VIEW } from "../../constants";
import type {
	EventCardComponentProps,
	FacilityScheduleSettings,
	Resource,
	ScheduleEvent,
	ResourceGroup,
} from "../../FacilitySchedule.schema";
import {
	calculateViewRange,
	filterEventsByDateRange,
	sortEventsByTime,
} from "../../utils/scheduleHelpers";
import {
	createEventIndexes,
	getEventsByResource,
} from "../../utils/scheduleIndexHelpers";
import { ResourceColumn } from "./ResourceColumn";
import { TimeGrid } from "./TimeGrid";

export interface DayViewProps {
	currentDate: Date;
	resources: Resource[];
	events: ScheduleEvent[];
	settings: FacilityScheduleSettings;
	onEventClick?: (event: ScheduleEvent) => void;
	onEmptySlotClick?: (resourceId: string, startTime: Date) => void;
	components?: {
		EventCard?: React.ComponentType<EventCardComponentProps>;
	};
	groups?: ResourceGroup[];
}

export function DayView({
	currentDate,
	resources,
	events,
	settings,
	groups = [],
	onEventClick,
	onEmptySlotClick,
	components,
}: DayViewProps) {
	// ... (calculate gridHeight/Width omitted for brevity, keep existing code if not shown here, proceed to rendering logic)
	const getTotalHours = (timeStr: string) => {
		const [h, m] = timeStr.split(":").map(Number);
		return h + (m / 60);
	};
	const startTotalHours = getTotalHours(settings.startTime);
	const endTotalHours = getTotalHours(settings.endTime);
	const startTotalMinutes = Math.round(startTotalHours * 60);
	const endTotalMinutes = Math.round(endTotalHours * 60);
	const slotInterval = settings.slotInterval ?? 60;
	const slotCount = Math.ceil((endTotalMinutes - startTotalMinutes) / slotInterval);
	const gridHeight = slotCount * DAY_VIEW.SLOT_HEIGHT + DAY_VIEW.HEADER_HEIGHT;
	const gridWidth = slotCount * DAY_VIEW.SLOT_WIDTH;

	// ... (filtering logic omitted)
	const { allDayEvents, timedEvents } = useMemo(() => {
		const { start, end } = calculateViewRange(currentDate, "day", settings);
		const filtered = filterEventsByDateRange(events, start, end);
		const sorted = sortEventsByTime(filtered);

		return {
			allDayEvents: sorted.filter((e) => e.isAllDay),
			timedEvents: sorted.filter((e) => !e.isAllDay),
		};
	}, [events, currentDate, settings]);

	// ... (indexing logic omitted)
	const eventIndexes = useMemo(() => {
		return createEventIndexes(timedEvents);
	}, [timedEvents]);

	// Group by resource (omitted)
	const eventsByResource = useMemo(() => {
		const map = new Map<string, ScheduleEvent[]>();
		for (const resource of resources) {
			const resourceEvents = getEventsByResource(resource.id, eventIndexes);
			map.set(resource.id, resourceEvents);
		}
		return map;
	}, [resources, eventIndexes]);

	// Group Map for Headers
	const groupMap = useMemo(() => {
		const map = new Map<string, ResourceGroup>();
		for (const g of groups) {
			map.set(g.id, g);
		}
		return map;
	}, [groups]);

	const isVertical = settings.orientation === "vertical";

	return (
		<div className="flex flex-col h-full bg-background">
			{isVertical ? (
				/* Horizontal Timeline (vertical Resources) */
				<div className="flex-1 overflow-auto relative">
					<div className="flex flex-col min-w-max" style={{ minWidth: `${gridWidth + 128}px` }}>
						{/* Header - Time Slots Row */}
						<div className="flex border-b border-border bg-muted/40 sticky top-0 z-30">
							{/* Header Spacer (Matches Group + Resource Column) */}
							<div className="flex-shrink-0 bg-background border-r border-b border-border sticky left-0 z-50 flex">
								<div className="w-[var(--ui-space-12)] border-r border-border shrink-0" /> {/* Group Column Header placeholder */}
								<div className="w-[var(--ui-space-32)] flex-1 shrink-0" /> {/* Resource Name Header placeholder */}
							</div>
							<TimeGrid
								startTime={settings.startTime}
								endTime={settings.endTime}
								slotSize={DAY_VIEW.SLOT_WIDTH}
								slotInterval={settings.slotInterval ?? 60}
								orientation="horizontal"
							/>
						</div>

						{/* Resource Rows */}
						<div className="flex flex-col">
							{(() => {
								// Restructure: Chunk resources by group
								const groupedResources: { group: ResourceGroup | undefined; resources: Resource[] }[] = [];
								let currentGroup: ResourceGroup | undefined;
								let currentChunk: Resource[] = [];

								resources.forEach((resource, i) => {
									const group = groupMap.get(resource.groupId);
									const prevResource = i > 0 ? resources[i - 1] : null;

									// If group changes, push current chunk
									if (prevResource && prevResource.groupId !== resource.groupId) {
										groupedResources.push({ group: currentGroup, resources: currentChunk });
										currentChunk = [];
									}
									currentGroup = group;
									currentChunk.push(resource);
								});
								// Push last chunk
								if (currentChunk.length > 0) {
									groupedResources.push({ group: currentGroup, resources: currentChunk });
								}

								return groupedResources.map((chunk, chunkIndex) => (
									<div key={`${chunk.group?.id}-${chunkIndex}`} className="flex border-b border-border relative">
										{/* Group Header Column (Sticky) */}
										<div className="sticky left-0 z-20 w-[var(--ui-space-12)] flex-shrink-0 bg-background border-r border-border flex items-center justify-center font-bold text-muted-foreground writing-mode-vertical-rl">
											<div className="sticky top-[var(--ui-space-14)] py-2 max-h-screen">
												{chunk.group?.name || "-"}
											</div>
										</div>

										{/* Resources List for this Group */}
										<div className="flex flex-col flex-1 min-w-0">
											{chunk.resources.map((resource, resIndex) => (
												<div key={resource.id} className={`${resIndex < chunk.resources.length - 1 ? "border-b border-border" : ""}`}>
													<ResourceColumn
														resource={resource}
														events={eventsByResource.get(resource.id) || []}
														allDayEvents={allDayEvents.filter((e) => e.resourceId === resource.id)}
														startTime={settings.startTime}
														endTime={settings.endTime}
														currentDate={currentDate}
														slotSize={DAY_VIEW.SLOT_WIDTH}
														slotInterval={settings.slotInterval ?? 60}
														onEventClick={onEventClick}
														onEmptySlotClick={onEmptySlotClick}
														components={components}
														orientation="horizontal"
														headerLeftOffset="var(--ui-space-12)"
													/>
												</div>
											))}
										</div>
									</div>
								));
							})()}
						</div>
					</div>
				</div>
			) : (
				/* Vertical Timeline (horizontal Resources) */
				<div className="flex-1 overflow-y-auto">
					<div className="flex" style={{ minHeight: `${gridHeight}px` }}>
						{/* Time Column */}
						<div
							className="sticky left-[var(--ui-space-0)] z-30 bg-background"
							style={{ width: `${DAY_VIEW.TIME_COLUMN_WIDTH}px` }}
						>
							<div className="sticky top-0 z-40 bg-background border-b border-r border-border h-[var(--ui-space-8)]" /> {/* Group Header Corner */}
							<TimeGrid
								startTime={settings.startTime}
								endTime={settings.endTime}
								slotSize={DAY_VIEW.SLOT_HEIGHT}
								slotInterval={settings.slotInterval ?? 60}
								orientation="vertical"
							/>
						</div>

						{/* Resource Columns */}
						<div className="flex flex-col flex-1 min-w-0">
							{/* Group Headers Row */}
							<div className="flex sticky top-0 z-30 bg-background border-b border-border h-[var(--ui-space-8)]">
								{/* Iterate resources to build grouped headers */}
								{(() => {
									const headers = [];
									for (let i = 0; i < resources.length; i++) {
										const resource = resources[i];
										const group = groupMap.get(resource.groupId);
										let colSpan = 1;
										// Calculate span
										while (i + colSpan < resources.length && resources[i + colSpan].groupId === resource.groupId) {
											colSpan++;
										}

										headers.push(
											<div
												key={`group-${resource.groupId}-${i}`}
												className="flex items-center justify-center border-r border-border text-xs font-semibold bg-muted/20 truncate px-2"
												style={{ flex: `${colSpan} ${colSpan} 0%` }}
											>
												{group?.name || "-"}
											</div>
										);
										i += colSpan - 1; // Skip handled resources
									}
									return headers;
								})()}
							</div>

							<div className="flex flex-1 min-w-0">
								{resources.map((resource) => (
									<ResourceColumn
										key={resource.id}
										resource={resource}
										events={eventsByResource.get(resource.id) || []}
										allDayEvents={allDayEvents.filter(
											(e) => e.resourceId === resource.id,
										)}
										startTime={settings.startTime}
										endTime={settings.endTime}
										currentDate={currentDate}
										slotSize={DAY_VIEW.SLOT_HEIGHT}
										slotInterval={settings.slotInterval}
										onEventClick={onEventClick}
										onEmptySlotClick={onEmptySlotClick}
										components={components}
										orientation="vertical"
									/>
								))}
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
