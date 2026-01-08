import {
	DndContext,
	type DragEndEvent,
	DragOverlay,
	type DragStartEvent,
	PointerSensor,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import { type ComponentType, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { DateDisplay as DateFormat } from "@/components/ui/DateDisplay";
import { Icons } from "@/components/ui/Icons";
import { ViewSelector } from "@/components/ui/ViewSelector";
import { useAppTranslation } from "@/utils/i18n";
import { navigateDate } from "../utils/dateNavigation";
import { defaultStorage, type StorageAdapter } from "../utils/StorageAdapter";
import { EventDragOverlay } from "./components/Common/EventComponents";
import { DayView } from "./components/DayView/DayView";
import { MonthView } from "./components/MonthView/MonthView";
import { WeekView } from "./components/WeekView/WeekView";
import type {
	FacilityScheduleSettings,
	Resource,
	ScheduleEvent,
	ViewMode,
} from "./RegularCalendar.schema";

export interface EventCardProps {
	event: ScheduleEvent;
	viewMode: ViewMode | "resource";
	isDragging: boolean;
	onClick?: (e: React.MouseEvent) => void;
}

export interface RegularCalendarComponents {
	EventCard?: ComponentType<EventCardProps>;
	EventModal?: ComponentType<Record<string, unknown>>;
}

export interface RegularCalendarProps {
	// Data
	events: ScheduleEvent[];
	settings: FacilityScheduleSettings;

	// State (controlled)
	currentDate?: Date;
	viewMode?: ViewMode;

	// Actions
	onDateChange?: (date: Date) => void;
	onViewChange?: (view: ViewMode) => void;

	// Event Actions
	onEventClick?: (event: ScheduleEvent) => void;
	onEventDrop?: (
		event: ScheduleEvent,
		dropDate: Date,
		resourceId?: string,
	) => void;
	onTimeSlotClick?: (date: Date) => void;
	onDateClick?: (date: Date) => void;

	// Customization
	isLoading?: boolean;
	className?: string;

	// Custom header slots
	headerLeft?: React.ReactNode;
	headerRight?: React.ReactNode;

	// Persistence & Defaults
	defaultView?: ViewMode;
	enablePersistence?: boolean;
	storageKey?: string;
	storage?: StorageAdapter;

	// User Identity
	currentUserId?: string;

	// Resources for resolving names
	resources?: Resource[];

	// Custom Rendering
	renderEventContent?: (
		event: ScheduleEvent,
		viewMode: ViewMode,
	) => React.ReactNode;

	// Component Overrides
	components?: RegularCalendarComponents;
}

export function RegularCalendar({
	events,
	settings,
	currentDate: propCurrentDate,
	viewMode: propViewMode,
	onDateChange,
	onViewChange,
	onEventClick,
	onEventDrop,
	onTimeSlotClick,
	onDateClick,
	isLoading = false,
	className,
	headerLeft,
	headerRight,
	defaultView = "week",
	enablePersistence = false,
	storageKey = "regular-calendar-view",
	storage = defaultStorage,
	currentUserId,
	resources = [],
	renderEventContent,
	components,
}: RegularCalendarProps) {
	const { t } = useAppTranslation();

	// Internal State
	const [internalDate, setInternalDate] = useState(new Date());

	// Initialize view state with persistence logic
	const [internalViewMode, setInternalViewMode] = useState<ViewMode>(() => {
		if (enablePersistence) {
			try {
				const saved = storage.getItem(storageKey);
				if (saved && ["day", "week", "month"].includes(saved)) {
					return saved as ViewMode;
				}
			} catch (e) {
				console.warn("Failed to load calendar view from storage", e);
			}
		}
		return defaultView;
	});

	// Derived State
	const currentDate = propCurrentDate ?? internalDate;
	const viewMode = propViewMode ?? internalViewMode;

	// Persist view changes
	useEffect(() => {
		if (enablePersistence && !propViewMode) {
			try {
				storage.setItem(storageKey, internalViewMode);
			} catch (e) {
				console.warn("Failed to save calendar view to storage", e);
			}
		}
	}, [internalViewMode, enablePersistence, storageKey, propViewMode, storage]);

	// Helpers
	const handleDateNavigate = (direction: "prev" | "next") => {
		const newDate = navigateDate(currentDate, viewMode, direction);

		if (onDateChange) onDateChange(newDate);
		else setInternalDate(newDate);
	};

	const handleToday = () => {
		const today = new Date();
		if (onDateChange) onDateChange(today);
		else setInternalDate(today);
	};

	const handleViewChange = (mode: ViewMode) => {
		if (onViewChange) {
			onViewChange(mode);
		} else {
			setInternalViewMode(mode);
		}
	};

	// Event Handlers Wrapper
	const handleTimeSlotClick = (date: Date, timeSlotString?: string) => {
		// timeSlotString is passed from Day/Week views as "HH:mm"
		const targetDate = new Date(date);
		if (timeSlotString) {
			const [hours, minutes] = timeSlotString.split(":").map(Number);
			if (!Number.isNaN(hours)) targetDate.setHours(hours);
			if (!Number.isNaN(minutes)) targetDate.setMinutes(minutes);
		}
		onTimeSlotClick?.(targetDate);
	};

	const handleDayClick = (date: Date) => {
		if (onDateClick) onDateClick(date);
		// Optional: Switch to day view on date click if desired
		// if (onViewChange) onViewChange('day');
		// else setInternalViewMode('day');

		// For now, just propagate the date change and maybe let parent decide
		if (onDateChange) onDateChange(date);
		else setInternalDate(date);
	};

	// DnD Sensors
	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 8,
			},
		}),
	);

	const [activeEvent, setActiveEvent] = useState<ScheduleEvent | null>(null);

	const handleDragStart = (event: DragStartEvent) => {
		const { active } = event;
		const draggedEvent = events.find((e) => e.id === active.id);
		if (draggedEvent) {
			setActiveEvent(draggedEvent);
		}
	};

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;
		setActiveEvent(null);

		if (!over || !onEventDrop) return;

		const draggedEvent = events.find((e) => e.id === active.id);
		if (!draggedEvent) return;

		const dropId = over.id as string;
		// Assume dropId is in ISO date format or similar identifying the slot
		// For DayView/WeekView slots, we expect "YYYY-MM-DDTHH:mm"
		// For MonthView cells, we expect "YYYY-MM-DD"

		const dropDate = new Date(dropId);
		if (Number.isNaN(dropDate.getTime())) return;

		// Calculate new start time
		// If dropped on a specific time slot (has time component in ID), use that directly
		// If dropped on a day cell (Month view or Day header), preserve original time but change date
		const isTimeSlot = dropId.includes("T");

		const newStartDate = new Date(dropDate);

		if (!isTimeSlot) {
			// Month view or day header drop: Keep original time
			newStartDate.setHours(
				draggedEvent.startDate.getHours(),
				draggedEvent.startDate.getMinutes(),
			);
		}

		onEventDrop(draggedEvent, newStartDate);
	};

	return (
		<DndContext
			sensors={sensors}
			onDragStart={handleDragStart}
			onDragEnd={handleDragEnd}
		>
			<div className={`flex flex-col h-full bg-background ${className}`}>
				{/* Header */}
				<header className="border-b border-border px-[var(--ui-space-4)] py-[var(--ui-space-3)] flex items-center justify-between gap-[var(--ui-space-4)]">
					<div className="flex items-center gap-[var(--ui-space-2)]">
						<Button
							variant="outline"
							size="icon"
							onClick={() => handleDateNavigate("prev")}
						>
							<Icons.ChevronLeft className="h-[var(--ui-space-4)] w-[var(--ui-space-4)]" />
						</Button>
						<Button variant="outline" onClick={handleToday}>
							{t("today_button")}
						</Button>
						<Button
							variant="outline"
							size="icon"
							onClick={() => handleDateNavigate("next")}
						>
							<Icons.ChevronRight className="h-[var(--ui-space-4)] w-[var(--ui-space-4)]" />
						</Button>

						<span className="text-lg font-bold ml-[var(--ui-space-2)]">
							<DateFormat date={currentDate} showSecondary showDayOfWeek />
						</span>
						{headerLeft}
					</div>

					<div className="flex items-center gap-[var(--ui-space-4)]">
						<ViewSelector
							currentView={viewMode}
							onViewChange={handleViewChange}
							options={[
								{ value: "day", label: t("view_day") },
								{ value: "week", label: t("view_week") },
								{ value: "month", label: t("view_month") },
							]}
						/>
						{headerRight}
					</div>
				</header>

				{/* Content */}
				<div className="flex-1 overflow-hidden relative">
					{isLoading && (
						<div className="absolute inset-[var(--ui-space-0)] bg-background/50 z-10 flex items-center justify-center">
							Loading...
						</div>
					)}

					{viewMode === "day" && (
						<DayView
							currentDate={currentDate}
							events={events}
							settings={settings}
							onEventClick={onEventClick}
							onTimeSlotClick={handleTimeSlotClick}
							currentUserId={currentUserId}
							resources={resources}
							renderEventContent={renderEventContent}
							components={components}
						/>
					)}

					{viewMode === "week" && (
						<WeekView
							currentDate={currentDate}
							events={events}
							settings={settings}
							onEventClick={onEventClick}
							onTimeSlotClick={handleTimeSlotClick}
							currentUserId={currentUserId}
							resources={resources}
							renderEventContent={renderEventContent}
							components={components}
						/>
					)}

					{viewMode === "month" && (
						<MonthView
							currentDate={currentDate}
							events={events}
							settings={settings}
							onEventClick={onEventClick}
							onDateClick={handleDayClick}
							currentUserId={currentUserId}
							renderEventContent={renderEventContent}
							components={components}
						/>
					)}
				</div>
			</div>
			<DragOverlay>
				{activeEvent ? (
					<EventDragOverlay
						event={activeEvent}
						currentUserId={currentUserId}
						resources={resources}
					/>
				) : null}
			</DragOverlay>
		</DndContext>
	);
}
