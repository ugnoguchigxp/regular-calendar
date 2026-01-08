/**
 * ResourceColumn - Component for displaying a single resource column in Day view
 * Ported from PositionColumn.tsx
 */

import { useMemo, useRef } from "react";
import { Button } from "@/components/ui/Button";
import type {
	EventCardComponentProps,
	Resource,
	ScheduleEvent,
} from "../../FacilitySchedule.schema";
import { hasTimeOverlap } from "../../utils/scheduleHelpers";
import { ScheduleEventCard } from "./ScheduleEventCard";

interface ResourceColumnProps {
	resource: Resource;
	events: ScheduleEvent[];
	allDayEvents?: ScheduleEvent[];
	startTime: string; // "HH:mm"
	endTime: string; // "HH:mm"
	currentDate: Date;
	slotHeight: number; // pixels per hour
	onEventClick?: (event: ScheduleEvent) => void;
	onEmptySlotClick?: (resourceId: string, startTime: Date) => void;
	components?: {
		EventCard?: React.ComponentType<EventCardComponentProps>;
	};
}

interface EventWithLayout extends ScheduleEvent {
	column: number;
	totalColumns: number;
}

export function ResourceColumn({
	resource,
	events,
	allDayEvents = [],
	startTime,
	endTime,
	currentDate,
	slotHeight,
	onEventClick,
	onEmptySlotClick,
	components,
}: ResourceColumnProps) {
	// Duplicate logic from TimeGrid to ensure alignment
	const startParts = startTime.split(":");
	const endParts = endTime.split(":");
	const startHour = Number(startParts[0] ?? 0);
	const endHour = Number(endParts[0] ?? 23);

	const contentRef = useRef<HTMLDivElement>(null);

	const hours: number[] = [];
	for (let hour = startHour; hour <= endHour; hour++) {
		hours.push(hour);
	}

	const eventsWithLayout = useMemo((): EventWithLayout[] => {
		// Merge allDayEvents as full-duration events for visualization
		const gridEvents = [...events];

		if (allDayEvents.length > 0) {
			allDayEvents.forEach((ade) => {
				// Clone event and force time to cover the entire visible day
				const syntheticEvent = { ...ade };

				// Use the VIEW date (currentDate) as base, not event date (which might be yesterday if multi-day)
				const s = new Date(currentDate);
				s.setHours(startHour, 0, 0, 0);

				const e = new Date(currentDate);
				e.setHours(endHour, 0, 0, 0);

				syntheticEvent.startDate = s;
				syntheticEvent.endDate = e;

				gridEvents.push(syntheticEvent);
			});
		}

		if (gridEvents.length === 0) return [];

		const sorted = [...gridEvents].sort(
			(a, b) => a.startDate.getTime() - b.startDate.getTime(),
		);
		const groups: ScheduleEvent[][] = [];

		for (const event of sorted) {
			let foundGroup = false;

			for (const group of groups) {
				const overlapsWithGroup = group.some((e) => hasTimeOverlap(e, event));
				if (overlapsWithGroup) {
					group.push(event);
					foundGroup = true;
					break;
				}
			}

			if (!foundGroup) {
				groups.push([event]);
			}
		}

		const result: EventWithLayout[] = [];

		for (const group of groups) {
			if (group.length === 1) {
				const event = group[0];
				if (event) {
					result.push({
						...event,
						column: 0,
						totalColumns: 1,
					});
				}
			} else {
				const maxColumns = Math.min(group.length, 4);

				for (let i = 0; i < group.length; i++) {
					const event = group[i];
					if (event) {
						result.push({
							...event,
							column: i % maxColumns,
							totalColumns: maxColumns,
						});
					}
				}
			}
		}

		return result;
	}, [events, allDayEvents, currentDate, startHour, endHour]);

	function calculateCardPosition(eventWithLayout: EventWithLayout) {
		const event = eventWithLayout;

		// Normalize hours relative to current view date
		// Need to reset currentDate hour cause I mutated it in getHoursWithDayOffset inline?
		// Wait, new Date(currentDate.setHours...) mutates currentDate!
		// FIX: use new Date(currentDate) first.

		const viewBase = new Date(currentDate);
		viewBase.setHours(0, 0, 0, 0);

		const getRelativeHour = (d: Date) => {
			const diffMs = d.getTime() - viewBase.getTime();
			return diffMs / (1000 * 60 * 60); // Float hours including days
		};

		const startTotalHours = getRelativeHour(event.startDate);
		const endTotalHours = getRelativeHour(event.endDate);

		const hoursFromStart = startTotalHours - startHour;
		const durationHours = endTotalHours - startTotalHours;

		const top = hoursFromStart * slotHeight;
		const height = durationHours * slotHeight;

		const widthPercent = 100 / eventWithLayout.totalColumns;
		const leftPercent =
			(eventWithLayout.column * 100) / eventWithLayout.totalColumns;

		return { top, height, widthPercent, leftPercent };
	}

	function handleColumnPointerUp(e: React.PointerEvent<HTMLDivElement>) {
		if (!onEmptySlotClick) return;

		const rect = e.currentTarget.getBoundingClientRect();
		const clickY = e.clientY - rect.top; // Relative to content container
		const hoursFromStart = Math.max(0, clickY / slotHeight);

		const clickHour = Math.floor(startHour + hoursFromStart);
		const clickMinute = Math.round((hoursFromStart % 1) * 60);

		const clickDate = new Date();
		clickDate.setHours(clickHour, clickMinute, 0, 0);

		onEmptySlotClick(resource.id, clickDate);
	}

	function triggerColumnClickFromHeader() {
		if (!onEmptySlotClick) return;
		const clickDate = new Date();
		clickDate.setHours(startHour, 0, 0, 0);
		onEmptySlotClick(resource.id, clickDate);
	}

	return (
		<div className="flex-1 min-w-[var(--ui-space-22-5)] border-r border-border hover:bg-muted/5 flex flex-col">
			{/* Header */}
			{/* Header - Auto height */}
			<div className="h-[var(--ui-space-14)] border-b border-border bg-background flex items-center justify-center sticky top-[var(--ui-space-0)] z-20 shrink-0 py-[var(--ui-space-2)]">
				<div className="text-center relative">
					<div className="font-semibold text-sm">{resource.name}</div>
					<div className="text-xs text-muted-foreground">
						{events.length + allDayEvents.length} events
					</div>

					{/* All Day Events removed from header as requested */}

					<Button
						type="button"
						variant="ghost"
						className="sr-only focus:not-sr-only focus:absolute focus:right-[var(--ui-space-2)] focus:top-[var(--ui-space-2)]"
						onClick={(event) => {
							event.stopPropagation();
							triggerColumnClickFromHeader();
						}}
					>
						{`Add event to ${resource.name}`}
					</Button>
				</div>
			</div>

			{/* Content Container */}
			<div
				ref={contentRef}
				className="relative flex-1 w-full cursor-pointer"
				onPointerUp={handleColumnPointerUp}
			>
				{/* Grid Lines Background */}
				<div className="absolute inset-[var(--ui-space-0)] z-0 pointer-events-none flex flex-col">
					{hours.map((hour) => (
						<div
							key={hour}
							className="border-b border-border/50 w-full"
							style={{ height: `${slotHeight}px` }}
						/>
					))}
				</div>

				{/* Events - positioned absolutely relative to content container */}
				<div className="relative w-full z-10">
					{eventsWithLayout.map((layoutEvent) => {
						const { top, height, widthPercent, leftPercent } =
							calculateCardPosition(layoutEvent);
						return (
							<ScheduleEventCard
								key={layoutEvent.id}
								event={layoutEvent}
								top={top}
								height={height}
								widthPercent={widthPercent}
								leftPercent={leftPercent}
								onClick={(e: React.MouseEvent) => {
									e.stopPropagation();
									onEventClick?.(layoutEvent);
								}}
								components={components}
							/>
						);
					})}
				</div>
			</div>
		</div>
	);
}
