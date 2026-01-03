/**
 * Event Display Components
 */

import { useDraggable } from "@dnd-kit/core";
import type React from "react";
import type { ScheduleEvent } from "../../RegularCalendar.schema";

// Helper to get location string
const getEventLocation = (event: ScheduleEvent): string => {
	// Use extendedProps if available, or description
	if (event.extendedProps?.location) {
		const loc = event.extendedProps.location;
		if (typeof loc === "string") return loc;
		if (typeof loc === "object" && loc !== null) {
			const record = loc as Record<string, unknown>;
			const building =
				typeof record.building === "string" ? record.building : "";
			const room = typeof record.room === "string" ? record.room : "";
			return `${building} ${room}`.trim();
		}
	}
	return event.description || "";
};

// Helper to check if all day
const getEventIsAllDay = (event: ScheduleEvent): boolean => {
	return !!event.extendedProps?.isAllDay;
};

/**
 * Event Item for Day/Week View
 */
interface EventItemProps {
	event: ScheduleEvent;
	position: { top: number; height: number };
	column?: number; // 0-indexed column position for overlapping events
	totalColumns?: number; // Total columns in overlap group
	onEventClick?: (event: ScheduleEvent) => void;
	currentUserId?: string;
	resources?: { id: string; name: string }[];
}

const getDisplayAttendee = (
	attendee: string | null | undefined,
	fallbackLabel: string,
	currentUserId?: string,
): string => {
	if (!attendee || attendee === "[]" || attendee === "") return fallbackLabel;
	try {
		const parsed =
			typeof attendee === "string" ? JSON.parse(attendee) : attendee;
		if (Array.isArray(parsed)) {
			const filtered = parsed.filter((p) => {
				if (typeof p !== "object" || p === null) return false;
				// Filter out self
				if (
					currentUserId &&
					"personnelId" in p &&
					p.personnelId === currentUserId
				) {
					return false;
				}
				return true;
			});

			const names = filtered
				.map((p) => {
					const name = (p as { name?: unknown }).name;
					return typeof name === "string" ? name : null;
				})
				.filter((name): name is string => Boolean(name));

			if (names.length > 0) return names.join(", ");
			// If all filtered out (self only), return empty or fallback?
			// User said "自分は表示しなくていい", so empty is better.
			return "";
		}
	} catch {}
	return typeof attendee === "string" ? attendee : "";
};

export const EventItem: React.FC<EventItemProps> = ({
	event,
	position,
	column = 0,
	totalColumns = 1,
	onEventClick,
	currentUserId,
	resources = [],
}) => {
	// Note: Drag functionality depends on DndContext being present in parent
	const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
		id: event.id,
		data: event,
		disabled: false, // Default to true? Logic can be refined.
	});

	const handleClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		onEventClick?.(event);
	};

	const title = event.title;
	const displayAttendee = getDisplayAttendee(event.attendee, "", currentUserId);

	// Resolve resource name from ID or fallback to locationText
	const resource = resources.find((r) => r.id === event.resourceId);
	const resourceName = resource?.name || getEventLocation(event);

	// Calculate width and left position for overlapping events
	const widthPercent = 100 / totalColumns;
	const leftPercent = column * widthPercent;

	return (
		<button
			ref={setNodeRef}
			{...listeners}
			{...attributes}
			onClick={handleClick}
			type="button"
			onKeyDown={(e) => {
				if (e.key === "Enter" || e.key === " ") {
					e.preventDefault();
					e.stopPropagation();
					onEventClick?.(event);
				}
			}}
			className={`
        absolute rounded px-[var(--ui-space-1)] py-[var(--ui-space-1)] text-sm cursor-pointer
        transition-all select-none flex flex-col items-start text-left
        active:scale-95
        ${isDragging ? "opacity-50" : "hover:shadow-md"}
      `}
			style={{
				top: `${position.top}px`,
				height: `${position.height}px`,
				minHeight: "44px",
				left: `calc(${leftPercent}% + 2px)`,
				width: `calc(${widthPercent}% - 4px)`,
				backgroundColor: event.color || "#3b82f6",
				color: "white",
				zIndex: isDragging ? 50 : 10 + column,
			}}
		>
			<div className="font-medium truncate text-xs w-full">{title}</div>
			{displayAttendee !== "" && (
				<div className="text-[10px] opacity-90 truncate w-full">
					{displayAttendee}
				</div>
			)}
			{resourceName !== "" && (
				<div className="text-[10px] opacity-90 truncate w-full">
					{resourceName}
				</div>
			)}
		</button>
	);
};

/**
 * Event Item for Month View
 */
interface MonthEventItemProps {
	event: ScheduleEvent;
	onClick?: (event: ScheduleEvent) => void;
	currentUserId?: string;
}

export const MonthEventItem: React.FC<MonthEventItemProps> = ({
	event,
	onClick,
}) => {
	const handleClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		onClick?.(event);
	};

	const title = event.title;
	const isAllDay = getEventIsAllDay(event);

	const timeStr = isAllDay
		? "All Day"
		: `${event.startDate.getHours()}:${event.startDate.getMinutes().toString().padStart(2, "0")}`;

	return (
		<button
			type="button"
			onClick={handleClick}
			className="w-full text-left text-sm px-[var(--ui-space-2)] py-[var(--ui-space-1)] mb-[var(--ui-space-0-5)] rounded truncate cursor-pointer active:scale-95 transition-transform select-none border-0 min-h-[var(--ui-space-7)] flex items-center"
			style={{
				backgroundColor: event.color || "#3b82f6",
				color: "white",
			}}
		>
			<span className="font-medium mr-[var(--ui-space-1)]">{timeStr}</span>{" "}
			{title}
		</button>
	);
};

/**
 * Drag Overlay Component
 */
interface EventDragOverlayProps {
	event: ScheduleEvent;
	currentUserId?: string;
	resources?: { id: string; name: string }[];
}

export const EventDragOverlay: React.FC<EventDragOverlayProps> = ({
	event,
	currentUserId,
	resources = [],
}) => {
	const title = event.title;
	const displayAttendee = getDisplayAttendee(event.attendee, "", currentUserId);
	const resource = resources.find((r) => r.id === event.resourceId);
	const resourceName = resource?.name || getEventLocation(event);

	return (
		<div
			className="rounded px-[var(--ui-space-2)] py-[var(--ui-space-2)] text-sm shadow-lg min-h-[var(--ui-space-11)] flex flex-col items-start text-left"
			style={{
				backgroundColor: event.color || "#3b82f6",
				color: "white",
				width: "200px",
			}}
		>
			<div className="font-medium w-full">{title}</div>
			{displayAttendee !== "" && (
				<div className="text-xs opacity-90 w-full text-left">
					with {displayAttendee}
				</div>
			)}
			{resourceName !== "" && (
				<div className="text-sm opacity-90 w-full text-left">
					{resourceName}
				</div>
			)}
		</div>
	);
};
