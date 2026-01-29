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
	slotSize: number; // pixels per hour
	slotInterval?: number; // minutes
	onEventClick?: (event: ScheduleEvent) => void;
	onEmptySlotClick?: (resourceId: string, startTime: Date) => void;
	components?: {
		EventCard?: React.ComponentType<EventCardComponentProps>;
	};
	orientation?: "horizontal" | "vertical";
	headerLeftOffset?: string | number; // Offset for nested sticky grouping
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
	slotSize,
	slotInterval = 60,
	onEventClick,
	onEmptySlotClick,
	components,
	orientation = "vertical",
	headerLeftOffset = 0,
}: ResourceColumnProps) {
	const startParts = startTime.split(":");
	const endParts = endTime.split(":");
	const startHour = Number(startParts[0] ?? 0);
	const startMinute = Number(startParts[1] ?? 0);
	const endHour = Number(endParts[0] ?? 23);
	const endMinute = Number(endParts[1] ?? 0);

	const contentRef = useRef<HTMLDivElement>(null);
	const isHorizontal = orientation === "horizontal";

	const slots = useMemo(() => {
		const startTotal = startHour * 60 + startMinute;
		const endTotal = endHour * 60 + endMinute;
		const result: number[] = [];
		for (let t = startTotal; t < endTotal; t += slotInterval) {
			result.push(t);
		}
		return result;
	}, [startHour, startMinute, endHour, endMinute, slotInterval]);

	const cellSize = slotSize; // pixels per slot
	const gridSize = slots.length * cellSize;

	const eventsWithLayout = useMemo((): EventWithLayout[] => {
		// Merge allDayEvents as full-duration events for visualization
		const gridEvents = [...events];

		if (allDayEvents.length > 0) {
			allDayEvents.forEach((ade) => {
				// Clone event and force time to cover the entire visible day
				const syntheticEvent = { ...ade };

				// Use the VIEW date (currentDate) as base, not event date
				const s = new Date(currentDate);
				s.setHours(startHour, startMinute, 0, 0);

				const e = new Date(currentDate);
				e.setHours(endHour, endMinute, 0, 0);

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
	}, [events, allDayEvents, currentDate, startHour, startMinute, endHour, endMinute]);

	function calculateCardPosition(eventWithLayout: EventWithLayout) {
		const event = eventWithLayout;

		const viewStartBase = new Date(currentDate);
		viewStartBase.setHours(startHour, startMinute, 0, 0);

		const getMinutesFromStart = (d: Date) => {
			const diffMs = d.getTime() - viewStartBase.getTime();
			return diffMs / (1000 * 60);
		};

		const startMinutes = getMinutesFromStart(event.startDate);
		const durationMinutes = (event.endDate.getTime() - event.startDate.getTime()) / (1000 * 60);

		// Position based on slots: (minutes / interval) * pixels_per_slot
		const pos = (startMinutes / slotInterval) * slotSize;
		const size = (durationMinutes / slotInterval) * slotSize;

		const depthPercent = 100 / eventWithLayout.totalColumns;
		const offsetPercent =
			(eventWithLayout.column * 100) / eventWithLayout.totalColumns;

		return { top: pos, height: size, widthPercent: depthPercent, leftPercent: offsetPercent };
	}

	function handleColumnPointerUp(e: React.PointerEvent<HTMLDivElement>) {
		if (!onEmptySlotClick) return;

		const rect = e.currentTarget.getBoundingClientRect();
		const offset = isHorizontal ? e.clientX - rect.left : e.clientY - rect.top;

		// Number of slots from start
		const slotsFromStart = Math.max(0, Math.floor(offset / slotSize));
		const minutesFromStart = slotsFromStart * slotInterval;

		const clickDate = new Date(currentDate);
		clickDate.setHours(startHour, startMinute, 0, 0);
		clickDate.setMinutes(clickDate.getMinutes() + minutesFromStart);

		onEmptySlotClick(resource.id, clickDate);
	}

	function triggerColumnClickFromHeader() {
		if (!onEmptySlotClick) return;
		const clickDate = new Date(currentDate);
		clickDate.setHours(startHour, 0, 0, 0);
		onEmptySlotClick(resource.id, clickDate);
	}

	if (isHorizontal) {
		return (
			<div className="flex border-b border-border hover:bg-muted/5 w-full h-[var(--ui-space-24)] shrink-0">
				{/* Resource Header (Row version) */}
				<div
					className="w-[var(--ui-space-32)] flex-shrink-0 border-r border-border bg-background flex flex-col items-center justify-center sticky z-30 shrink-0 p-2"
					style={{ left: headerLeftOffset }}
				>
					<div className="font-semibold text-xs text-center">{resource.name}</div>
					<div className="text-[10px] text-muted-foreground">
						{events.length + allDayEvents.length} events
					</div>
				</div>

				{/* Content Container (Row version) */}
				<div
					ref={contentRef}
					className="relative flex-1 cursor-pointer min-w-max h-full"
					style={{ minWidth: `${gridSize}px` }}
					onPointerUp={handleColumnPointerUp}
				>
					{/* Grid Lines Background (Row version) */}
					<div className="absolute inset-0 z-0 pointer-events-none flex">
						{slots.map((slot) => (
							<div
								key={slot}
								className="border-r border-border/50 h-full"
								style={{ width: `${cellSize}px` }}
							/>
						))}
					</div>

					{/* Events Area (Row version) */}
					<div className="relative h-full z-10 flex">
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
									orientation="horizontal"
								/>
							);
						})}
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="flex-1 min-w-[var(--ui-space-22-5)] border-r border-border hover:bg-muted/5 flex flex-col">
			{/* Header */}
			<div className="h-[var(--ui-space-14)] border-b border-border bg-background flex items-center justify-center sticky top-[var(--ui-space-0)] z-20 shrink-0 py-[var(--ui-space-2)]">
				<div className="text-center relative">
					<div className="font-semibold text-sm">{resource.name}</div>
					<div className="text-xs text-muted-foreground">
						{events.length + allDayEvents.length} events
					</div>

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
				style={{ minHeight: `${gridSize}px` }}
				onPointerUp={handleColumnPointerUp}
			>
				{/* Grid Lines Background */}
				<div className="absolute inset-[var(--ui-space-0)] z-0 pointer-events-none flex flex-col">
					{slots.map((slot) => (
						<div
							key={slot}
							className="border-b border-border/50 w-full"
							style={{ height: `${cellSize}px` }}
						/>
					))}
				</div>

				{/* Events - positioned absolutely relative to content container */}
				<div className="relative w-full z-10 flex flex-col">
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
								orientation="vertical"
							/>
						);
					})}
				</div>
			</div>
		</div>
	);
}
